import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { QuickQuestionDto, SubscriptionDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { toSubscriptionDto } from '../subscriptions/subscriptions.mapper';
import { toQuickQuestionDto } from '../quick-questions/quick-questions.mapper';
import {
  PaymentStatus,
  QuickQuestionStatus,
  ServiceCode,
  SubscriptionStatus,
} from '../../generated/prisma/enums';
import { MonitoringLeadDto, QuickQuestionLeadDto } from './dto/create-lead.dto';

const QUICK_SLA_MS = 48 * 60 * 60 * 1000;
const MONITORING_MONTHS = 3;

/**
 * Public lead intake for the group-B services (portal-only, no calendar).
 * Each submission is persisted as a `pending` record so it surfaces in the
 * back office, and a notification email is sent to the practice inbox.
 */
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /** "Monitorizare 3 luni" → a pending Subscription the doctor follows up on. */
  async createMonitoring(dto: MonitoringLeadDto): Promise<SubscriptionDto> {
    const service = await this.prisma.service.findUnique({
      where: { code: ServiceCode.monitoring },
    });
    if (!service) throw new NotFoundException('monitoring_service_not_found');

    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + MONITORING_MONTHS);

    const sub = await this.prisma.subscription.create({
      data: {
        serviceId: service.id,
        clientName: dto.name,
        clientEmail: dto.email,
        phone: dto.phone ?? null,
        notes: dto.message ?? null,
        status: SubscriptionStatus.active,
        paymentStatus: PaymentStatus.pending,
        startsAt,
        endsAt,
      },
    });

    await this.mail.sendLeadNotification({
      subject: 'Cerere nouă — Monitorizare 3 luni',
      lines: [
        'Cerere nouă pentru pachetul „Monitorizare 3 luni".',
        `Nume: ${dto.name}`,
        `Email: ${dto.email}`,
        `Telefon: ${dto.phone ?? '—'}`,
        `Mesaj: ${dto.message ?? '—'}`,
      ],
    });

    this.logger.log('Monitoring lead created (pending).');
    return toSubscriptionDto(sub);
  }

  /** "Întrebare rapidă" → a pending QuickQuestion ticket (48h SLA). */
  async createQuickQuestion(dto: QuickQuestionLeadDto): Promise<QuickQuestionDto> {
    const qq = await this.prisma.quickQuestion.create({
      data: {
        clientName: dto.name,
        clientEmail: dto.email,
        phone: dto.phone ?? null,
        question: dto.question,
        attachments: dto.attachments ?? [],
        status: QuickQuestionStatus.open,
        paymentStatus: PaymentStatus.pending,
        dueAt: new Date(Date.now() + QUICK_SLA_MS),
      },
    });

    await this.mail.sendLeadNotification({
      subject: 'Întrebare rapidă nouă',
      lines: [
        'Întrebare rapidă nouă (termen de răspuns 48h).',
        `Nume: ${dto.name}`,
        `Email: ${dto.email}`,
        `Telefon: ${dto.phone ?? '—'}`,
        '',
        `Întrebare: ${dto.question}`,
      ],
    });

    this.logger.log('Quick-question lead created (pending).');
    return toQuickQuestionDto(qq);
  }
}
