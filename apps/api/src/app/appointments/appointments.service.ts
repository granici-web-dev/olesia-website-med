import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { stat } from 'node:fs/promises';
import type { AppointmentDto, Paginated } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService, type UploadedImage } from '../storage/storage.service';
import { paginate } from '../common/dto/pagination.dto';
import { Prisma } from '../../generated/prisma/client';
import {
  AppointmentStatus,
  PaymentStatus,
  PaymentTargetType,
} from '../../generated/prisma/enums';
import { MailService } from '../mail/mail.service';
import { normalizePatientEmail } from '../common/patient-email';
import { CalendlyService, type CalendlyWebhookBody } from './calendly.service';
import { toAppointmentDto } from './appointments.mapper';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ListAppointmentsDto } from './dto/list-appointments.dto';

/**
 * Calendly puts no ceiling on what an invitee types, and both columns are
 * unbounded `text`. The cap truncates rather than rejects: a booking that
 * exists in her calendar has to exist in the back office too, even if the
 * person pasted an essay into the reason field.
 */
export const CLIENT_NAME_MAX = 200;
export const REASON_MAX = 2000;

/** Truncate to a column's ceiling; blank and missing both read as absent. */
export function clampText(value: string | null | undefined, max: number): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/**
 * A Calendly booking reduced to the fields we persist, independent of whether
 * it arrived via webhook or the backup-sync API poll. The service is resolved
 * from `eventTypeUri`; `eventUri` is the idempotency key.
 */
export interface NormalizedBooking {
  eventUri: string;
  eventTypeUri: string;
  /** The invitee URI, which is what the next reschedule will point back at. */
  inviteeUri: string | null;
  /** Set only on the new half of a reschedule: the invitee it replaces. */
  rescheduledFromInviteeUri: string | null;
  clientName: string;
  clientEmail: string;
  reason: string | null;
  startTime: Date;
  endTime: Date;
  videoUrl: string | null;
  cancelUrl: string | null;
  rescheduleUrl: string | null;
}

/**
 * The `invitee.created` half of a webhook, reduced to what we store. Separate
 * from the service so the mapping can be checked against a recorded payload
 * without a database: the reschedule link and the field ceilings are decided
 * here, and getting either wrong is invisible until a patient is affected.
 */
export function normalizeCalendlyBooking(
  body: CalendlyWebhookBody,
  calendly: CalendlyService,
): NormalizedBooking | null {
  const payload = body.payload;
  const event = payload?.scheduled_event;
  if (!event?.uri || !event.event_type) return null;

  return {
    eventUri: event.uri,
    eventTypeUri: event.event_type,
    inviteeUri: payload?.uri ?? null,
    rescheduledFromInviteeUri: payload?.rescheduled
      ? (payload.old_invitee ?? null)
      : null,
    clientName: clampText(payload?.name, CLIENT_NAME_MAX) ?? 'Necunoscut',
    clientEmail: payload?.email ?? '',
    reason: clampText(
      calendly.extractReason(payload?.questions_and_answers),
      REASON_MAX,
    ),
    startTime: event.start_time ? new Date(event.start_time) : new Date(),
    endTime: event.end_time ? new Date(event.end_time) : new Date(),
    videoUrl: calendly.extractVideoUrl(event.location),
    cancelUrl: payload?.cancel_url ?? null,
    rescheduleUrl: payload?.reschedule_url ?? null,
  };
}

/** The row a reschedule grows out of, in the shape the carry-over needs. */
export interface ReschedulablePrevious {
  id: string;
  paymentStatus: PaymentStatus;
  patientId: string | null;
  planText: string | null;
  planFileKey: string | null;
  planFileName: string | null;
  planUploadedAt: Date | null;
}

/**
 * What moves from a canceled booking to the one that replaced it.
 *
 * The payment and the patient link are copied: the money was paid for this
 * consultation whichever slot it ends up in, and leaving `patientId` on the
 * old row is what keeps GDPR erasure able to find it. The plan is *moved* —
 * text, file and date — because a stored file has to have exactly one owner,
 * or erasing one row deletes bytes the other still points at. `prepSentAt`
 * starts empty: the appointment has a new time, so the 24h instructions are
 * owed again.
 */
export function rescheduleCarryOver(previous: ReschedulablePrevious): {
  next: {
    paymentStatus: PaymentStatus;
    patientId: string | null;
    planText: string | null;
    planFileKey: string | null;
    planFileName: string | null;
    planUploadedAt: Date | null;
    prepSentAt: null;
  };
  clearedOnPrevious: {
    planText: null;
    planFileKey: null;
    planFileName: null;
    planUploadedAt: null;
  };
} {
  return {
    next: {
      paymentStatus: previous.paymentStatus,
      patientId: previous.patientId,
      planText: previous.planText,
      planFileKey: previous.planFileKey,
      planFileName: previous.planFileName,
      planUploadedAt: previous.planUploadedAt,
      prepSentAt: null,
    },
    clearedOnPrevious: {
      planText: null,
      planFileKey: null,
      planFileName: null,
      planUploadedAt: null,
    },
  };
}

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  /**
   * `event_type` URI → the day its "no service mapped" alert was mailed. One
   * mail per URI per day: the same unmapped event type is re-read by every
   * backup-sync tick, and the alert that matters is the first one.
   */
  private readonly unmappedEventTypeAlerts = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly calendly: CalendlyService,
    private readonly mail: MailService,
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

  /** Manual edits: mark no-show/completed. Payment is the ledger's business. */
  async update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentDto> {
    await this.getOrThrow(id);
    return toAppointmentDto(
      await this.prisma.appointment.update({
        where: { id },
        data: { status: dto.status },
      }),
    );
  }

  /**
   * Save the written treatment plan: stores the text (required) plus an
   * optional private attachment (prescription/doc), stamps `planUploadedAt`,
   * and moves the appointment to `completed`. A new attachment replaces the
   * previous one (the old private file is deleted to avoid orphans).
   */
  async uploadPlan(
    id: string,
    planText: string,
    file: UploadedImage | undefined,
  ): Promise<AppointmentDto> {
    const existing = await this.getOrThrow(id);

    let fileFields: { planFileKey: string; planFileName: string } | undefined;
    if (file) {
      const { key } = await this.storage.savePrivateDocument(file);
      fileFields = { planFileKey: key, planFileName: file.originalname };
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        planText,
        ...(fileFields ?? {}),
        planUploadedAt: new Date(),
        status: AppointmentStatus.completed,
      },
    });

    // Drop the superseded attachment only after the row is persisted.
    if (fileFields && existing.planFileKey) {
      await this.storage.deletePrivateDocument(existing.planFileKey);
    }

    return toAppointmentDto(updated);
  }

  /**
   * Resolve an appointment's plan attachment for the authenticated download
   * endpoint. Returns the on-disk path (private dir) and the original filename.
   */
  async getPlanFile(id: string): Promise<{ path: string; fileName: string }> {
    const appt = await this.getOrThrow(id);
    if (!appt.planFileKey) {
      throw new NotFoundException('plan_file_not_found');
    }
    // A row whose file is gone is a real state (an ephemeral private volume,
    // a database restored without it). Answer 404 rather than let
    // `res.download` fail past Nest's exception filter.
    const path = this.storage.privateDocPath(appt.planFileKey);
    try {
      await stat(path);
    } catch {
      throw new NotFoundException('plan_file_missing');
    }
    return { path, fileName: appt.planFileName ?? 'plan' };
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
    if (body.event === 'invitee_no_show.created') {
      await this.applyNoShow(uri);
      return;
    }
    if (body.event !== 'invitee.created') {
      this.logger.log(`Unhandled Calendly event "${body.event}" — ignored.`);
      return;
    }

    const booking = normalizeCalendlyBooking(body, this.calendly);
    if (!booking) {
      this.logger.warn('invitee.created without event_type — ignored.');
      return;
    }
    await this.applyBooking(booking);
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
      await this.reportUnmappedEventType(b.eventTypeUri);
      return 'skipped';
    }

    const fields = {
      serviceId: service.id,
      // Never written back as null: the backup-sync path may not know the
      // invitee URI, and it is the anchor a later reschedule looks itself up by.
      ...(b.inviteeUri ? { calendlyInviteeUri: b.inviteeUri } : {}),
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
    if (existing) {
      await this.prisma.appointment.update({
        where: { calendlyEventUri: b.eventUri },
        data: fields,
      });
      this.logger.log(`Appointment updated for ${service.code} (${b.eventUri}).`);
      return 'updated';
    }

    // Free services carry no payment, so they land already settled and never
    // surface as a "pending payment" in the back office.
    const initialPayment =
      service.price === 0 ? PaymentStatus.confirmed : PaymentStatus.pending;
    const previous = await this.findRescheduledFrom(b);

    await this.prisma.$transaction(async (tx) => {
      const carried = previous ? rescheduleCarryOver(previous) : null;
      const created = await tx.appointment.create({
        data: {
          calendlyEventUri: b.eventUri,
          status: AppointmentStatus.scheduled,
          ...fields,
          ...(carried
            ? { ...carried.next, rescheduledFromId: previous!.id }
            : {
                paymentStatus: initialPayment,
                patientId: await this.findPatientId(b.clientEmail, tx),
              }),
        },
      });
      if (!previous || !carried) return;

      await tx.appointment.update({
        where: { id: previous.id },
        data: carried.clearedOnPrevious,
      });
      // The money followed the consultation, so the ledger has to point at the
      // row that now represents it — otherwise `markTargetPaid()` settles a
      // canceled booking and the live one still reads as unpaid.
      await tx.payment.updateMany({
        where: {
          targetType: PaymentTargetType.appointment,
          targetId: previous.id,
        },
        data: { targetId: created.id },
      });
      this.logger.log(
        `Appointment ${created.id} carries over from rescheduled ${previous.id}.`,
      );
    });

    this.logger.log(`Appointment created for ${service.code} (${b.eventUri}).`);
    return 'created';
  }

  /** The canceled row a reschedule replaces, by the invitee URI it names. */
  private async findRescheduledFrom(
    b: NormalizedBooking,
  ): Promise<ReschedulablePrevious | null> {
    if (!b.rescheduledFromInviteeUri) return null;
    const previous = await this.prisma.appointment.findUnique({
      where: { calendlyInviteeUri: b.rescheduledFromInviteeUri },
      select: {
        id: true,
        paymentStatus: true,
        patientId: true,
        planText: true,
        planFileKey: true,
        planFileName: true,
        planUploadedAt: true,
        rescheduledTo: { select: { id: true } },
      },
    });
    if (!previous) {
      this.logger.warn(
        `Reschedule names an invitee we have no appointment for (${b.rescheduledFromInviteeUri}).`,
      );
      return null;
    }
    // `rescheduledFromId` is unique, so a second booking claiming the same
    // predecessor would fail the insert. Log it and let the new row stand on
    // its own rather than lose the booking.
    if (previous.rescheduledTo) {
      this.logger.warn(
        `Appointment ${previous.id} was already rescheduled into ${previous.rescheduledTo.id} — not linking again.`,
      );
      return null;
    }
    return previous;
  }

  /**
   * The patient this booking belongs to, when there already is one. A person
   * who books is not automatically a medical record — promoting one stays an
   * explicit act in the back office (same rule as `payments`) — but linking an
   * existing patient is what lets erasure reach the appointment later.
   */
  private async findPatientId(
    email: string,
    tx: Prisma.TransactionClient,
  ): Promise<string | undefined> {
    const normalized = normalizePatientEmail(email);
    if (!normalized) return undefined;
    const patient = await tx.patient.findUnique({
      where: { email: normalized },
      select: { id: true },
    });
    return patient?.id;
  }

  /**
   * A booking whose event type maps to no service is a consultation that
   * exists in her calendar and nowhere else. It used to be a `warn` nobody
   * reads; now it mails the practice, once per event type per day, because the
   * sync re-reads the same unmapped type every half hour.
   */
  private async reportUnmappedEventType(eventTypeUri: string): Promise<void> {
    this.logger.error(
      `No service mapped to event_type ${eventTypeUri} — booking not recorded.`,
    );
    const today = new Date().toISOString().slice(0, 10);
    if (this.unmappedEventTypeAlerts.get(eventTypeUri) === today) return;
    this.unmappedEventTypeAlerts.set(eventTypeUri, today);
    await this.mail.sendLeadNotification({
      subject: 'Calendly: eveniment fără serviciu asociat',
      lines: [
        'O programare a sosit pentru un tip de eveniment care nu este legat de niciun serviciu.',
        'Programarea nu a fost înregistrată în back office.',
        `event_type: ${eventTypeUri}`,
        'Deschideți Servicii în back office și alegeți evenimentul Calendly pentru serviciul potrivit.',
      ],
    });
  }

  /** Mark an appointment a no-show by its Calendly event URI (idempotent). */
  async applyNoShow(eventUri: string): Promise<void> {
    const existing = await this.prisma.appointment.findUnique({
      where: { calendlyEventUri: eventUri },
      select: { status: true },
    });
    if (!existing) {
      this.logger.warn(`No-show for unknown appointment ${eventUri} — ignored.`);
      return;
    }
    if (existing.status === AppointmentStatus.no_show) return;
    await this.prisma.appointment.update({
      where: { calendlyEventUri: eventUri },
      data: { status: AppointmentStatus.no_show },
    });
    this.logger.log(`Appointment marked no-show (${eventUri}).`);
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
