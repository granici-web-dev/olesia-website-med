import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { DeliverableOrderDto, QuickQuestionDto, SubscriptionDto } from '@olesia/shared';
import { deliverableEntry } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { toSubscriptionDto } from '../subscriptions/subscriptions.mapper';
import { toQuickQuestionDto } from '../quick-questions/quick-questions.mapper';
import {
  ContactMessageStatus,
  DeliverableOrderStatus,
  PaymentStatus,
  QuickQuestionStatus,
  ServiceCode,
  SubscriptionStatus,
} from '../../generated/prisma/enums';
import { toDeliverableOrderDto } from '../deliverable-orders/deliverable-orders.mapper';
import {
  ContactMessageDto,
  DeliverableLeadDto,
  MonitoringLeadDto,
  QuickQuestionLeadDto,
} from './dto/create-lead.dto';

const QUICK_SLA_MS = 48 * 60 * 60 * 1000;
const MONITORING_MONTHS = 3;

/** Human-readable subject labels for the practice inbox (RO). */
const CONTACT_SUBJECT_LABELS: Record<string, string> = {
  appointment: 'Programare',
  payment: 'Plată',
  how_it_works: 'Cum funcționează',
  other: 'Altă întrebare',
};

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

  /**
   * Group-C product order → a `new` DeliverableOrder the doctor works through
   * in the back office ("Comenzi").
   *
   * The label and the price come from the shared catalog, never from the
   * request: the form posts a product code and nothing else about the product.
   * An unknown code is a 400 rather than an order nobody can price.
   */
  async createDeliverable(dto: DeliverableLeadDto): Promise<DeliverableOrderDto> {
    const entry = deliverableEntry(dto.product);
    if (!entry) throw new BadRequestException('unknown_deliverable_product');

    const order = await this.prisma.deliverableOrder.create({
      data: {
        product: dto.product,
        titleRo: entry.titleRo,
        priceEur: entry.priceEur,
        clientName: dto.name,
        clientEmail: dto.email,
        phone: dto.phone ?? null,
        notes: dto.message ?? null,
        status: DeliverableOrderStatus.new,
        paymentStatus: PaymentStatus.pending,
      },
    });

    await this.mail.sendLeadNotification({
      subject: `Comandă nouă — ${entry.titleRo}`,
      lines: [
        'Comandă nouă pentru un produs personalizat.',
        `Produs: ${entry.titleRo} (${entry.priceEur} €)`,
        `Nume: ${dto.name}`,
        `Email: ${dto.email}`,
        `Telefon: ${dto.phone ?? '—'}`,
        '',
        `Detalii: ${dto.message ?? '—'}`,
      ],
    });

    this.logger.log('Deliverable order created (pending).');
    return toDeliverableOrderDto(order);
  }

  /**
   * Contact-page message → persisted as a `ContactMessage` (back-office "Mesaje")
   * AND a notification email to the practice inbox. Non-medical only (medical
   * questions go through "Întrebare rapidă"), so it carries no clinical data.
   * The `company` honeypot, when filled, marks a bot: we drop it silently and
   * report success so the bot learns nothing.
   */
  async createContact(dto: ContactMessageDto): Promise<{ ok: true }> {
    if (dto.company) {
      this.logger.warn('Contact message dropped (honeypot tripped).');
      return { ok: true };
    }

    await this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
        status: ContactMessageStatus.new,
      },
    });

    const subjectLabel = CONTACT_SUBJECT_LABELS[dto.subject] ?? dto.subject;
    await this.mail.sendLeadNotification({
      subject: `Mesaj de contact — ${subjectLabel}`,
      lines: [
        'Mesaj nou din formularul de contact (întrebare non-medicală).',
        `Nume: ${dto.name}`,
        `Email: ${dto.email}`,
        `Subiect: ${subjectLabel}`,
        '',
        `Mesaj: ${dto.message}`,
      ],
    });

    this.logger.log('Contact message received.');
    return { ok: true };
  }
}
