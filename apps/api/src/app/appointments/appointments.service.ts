import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { AppointmentDto, Paginated } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService, type UploadedImage } from '../storage/storage.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { Prisma } from '../../generated/prisma/client';
import {
  AppointmentStatus,
  PaymentStatus,
} from '../../generated/prisma/enums';
import { CalendlyService, type CalendlyWebhookBody } from './calendly.service';
import { toAppointmentDto } from './appointments.mapper';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ListAppointmentsDto } from './dto/list-appointments.dto';

/**
 * A Calendly booking reduced to the fields we persist, independent of whether
 * it arrived via webhook or the backup-sync API poll. The service is resolved
 * from `eventTypeUri`; `eventUri` is the idempotency key.
 */
export interface NormalizedBooking {
  eventUri: string;
  eventTypeUri: string;
  clientName: string;
  clientEmail: string;
  reason: string | null;
  startTime: Date;
  endTime: Date;
  videoUrl: string | null;
  cancelUrl: string | null;
  rescheduleUrl: string | null;
}

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly calendly: CalendlyService,
  ) {}

  /** Paginated, filterable list for the back office (newest start first). */
  async findAll(query: ListAppointmentsDto): Promise<Paginated<AppointmentDto>> {
    const where: Prisma.AppointmentWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.serviceId) where.serviceId = query.serviceId;
    if (query.from || query.to) {
      where.startTime = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        orderBy: { startTime: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.appointment.count({ where }),
    ]);
    return paginate(items.map(toAppointmentDto), total, query);
  }

  /** Manual edits: confirm payment, mark no-show/completed. */
  async update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentDto> {
    await this.getOrThrow(id);
    return toAppointmentDto(
      await this.prisma.appointment.update({
        where: { id },
        data: { status: dto.status, paymentStatus: dto.paymentStatus },
      }),
    );
  }

  /**
   * Attach the written plan: stores the file (if provided), stamps
   * `planUploadedAt`, and moves the appointment to `completed`.
   */
  async uploadPlan(
    id: string,
    file: UploadedImage | undefined,
  ): Promise<AppointmentDto> {
    await this.getOrThrow(id);
    const planUrl = file ? (await this.storage.saveDocument(file)).url : undefined;
    return toAppointmentDto(
      await this.prisma.appointment.update({
        where: { id },
        data: {
          ...(planUrl ? { planUrl } : {}),
          planUploadedAt: new Date(),
          status: AppointmentStatus.completed,
        },
      }),
    );
  }

  /**
   * Idempotently apply a verified Calendly `invitee.*` event (webhook path).
   * Normalizes the payload and delegates to applyBooking/applyCancellation.
   */
  async ingestCalendlyEvent(body: CalendlyWebhookBody): Promise<void> {
    const payload = body.payload;
    const event = payload?.scheduled_event;
    const uri = event?.uri;
    if (!uri) {
      this.logger.warn('Calendly webhook without scheduled_event.uri — ignored.');
      return;
    }

    if (body.event === 'invitee.canceled') {
      await this.applyCancellation(uri);
      return;
    }
    if (body.event !== 'invitee.created') {
      this.logger.log(`Unhandled Calendly event "${body.event}" — ignored.`);
      return;
    }
    if (!event?.event_type) {
      this.logger.warn('invitee.created without event_type — ignored.');
      return;
    }

    await this.applyBooking({
      eventUri: uri,
      eventTypeUri: event.event_type,
      clientName: payload?.name ?? 'Necunoscut',
      clientEmail: payload?.email ?? '',
      reason: this.calendly.extractReason(payload?.questions_and_answers),
      startTime: event.start_time ? new Date(event.start_time) : new Date(),
      endTime: event.end_time ? new Date(event.end_time) : new Date(),
      videoUrl: this.calendly.extractVideoUrl(event.location),
      cancelUrl: payload?.cancel_url ?? null,
      rescheduleUrl: payload?.reschedule_url ?? null,
    });
  }

  /**
   * Idempotently create/refresh an appointment from a normalized Calendly
   * booking. Shared by the webhook and the backup-sync cron. The service is
   * resolved strictly by `event_type` URI; `eventUri` is the idempotency key.
   * Re-application refreshes Calendly-owned logistics but never overwrites the
   * manual fields (status, paymentStatus, plan).
   */
  async applyBooking(
    b: NormalizedBooking,
  ): Promise<'created' | 'updated' | 'skipped'> {
    const service = await this.prisma.service.findUnique({
      where: { calendlyEventTypeUri: b.eventTypeUri },
    });
    if (!service) {
      this.logger.warn(
        `No service mapped to event_type ${b.eventTypeUri} — ignored.`,
      );
      return 'skipped';
    }

    const fields = {
      serviceId: service.id,
      clientName: b.clientName,
      clientEmail: b.clientEmail,
      reason: b.reason,
      startTime: b.startTime,
      endTime: b.endTime,
      videoUrl: b.videoUrl,
      cancelUrl: b.cancelUrl,
      rescheduleUrl: b.rescheduleUrl,
    };

    const existing = await this.prisma.appointment.findUnique({
      where: { calendlyEventUri: b.eventUri },
      select: { id: true },
    });
    await this.prisma.appointment.upsert({
      where: { calendlyEventUri: b.eventUri },
      create: {
        calendlyEventUri: b.eventUri,
        status: AppointmentStatus.scheduled,
        paymentStatus: PaymentStatus.pending,
        ...fields,
      },
      update: fields,
    });
    const outcome = existing ? 'updated' : 'created';
    this.logger.log(
      `Appointment ${outcome} for ${service.code} (${b.eventUri}).`,
    );
    return outcome;
  }

  /** Mark an appointment canceled by its Calendly event URI (idempotent). */
  async applyCancellation(eventUri: string): Promise<void> {
    const existing = await this.prisma.appointment.findUnique({
      where: { calendlyEventUri: eventUri },
    });
    if (!existing) {
      this.logger.warn(`Cancel for unknown appointment ${eventUri} — ignored.`);
      return;
    }
    if (existing.status === AppointmentStatus.canceled) return;
    await this.prisma.appointment.update({
      where: { calendlyEventUri: eventUri },
      data: { status: AppointmentStatus.canceled },
    });
    this.logger.log(`Appointment canceled (${eventUri}).`);
  }

  private async getOrThrow(id: string) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new NotFoundException('appointment_not_found');
    return appt;
  }
}
