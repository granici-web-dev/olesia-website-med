import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  DeliverableOrderDto,
  QuickQuestionDto,
  SubscriptionDto,
} from '@olesia/shared';
import { deliverableEntry } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { WorkingHoursService } from '../working-hours/working-hours.service';
import { toSubscriptionDto } from '../subscriptions/subscriptions.mapper';
import { toQuickQuestionDto } from '../quick-questions/quick-questions.mapper';
import {
  ContactMessageStatus,
  DeliverableOrderStatus,
  Locale,
  PaymentStatus,
  PaymentTargetType,
  QuickQuestionStatus,
  ServiceCode,
  SubscriptionStatus,
} from '../../generated/prisma/enums';
import { PaymentsService } from '../payments/payments.service';
import { canSell } from '../common/legal-entity';
import { paymentCurrency } from '../common/payment-currency';
import { QuickQuestionCheckoutDto } from './dto/checkout.dto';
import { toDeliverableOrderDto } from '../deliverable-orders/deliverable-orders.mapper';
import {
  ContactMessageDto,
  DeliverableLeadDto,
  MonitoringLeadDto,
  QuickQuestionLeadDto,
} from './dto/create-lead.dto';

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
 *
 * Every lead records the locale it arrived in, so the answer can be written
 * back in the language the person used rather than in Romanian by default.
 */
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly workingHours: WorkingHoursService,
    private readonly payments: PaymentsService,
  ) {}

  /**
   * A moment as the practice reads it. `toLocaleString` with no zone formats
   * in the server's, which in a container is UTC — so the doctor was told an
   * EXPRESS deadline two hours early (audit A3, F10).
   */
  private async inPracticeTime(at: Date): Promise<string> {
    const { timezone } = await this.workingHours.get();
    return at.toLocaleString('ro-RO', {
      timeZone: timezone,
      dateStyle: 'long',
      timeStyle: 'short',
    });
  }

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
        locale: dto.locale ?? Locale.ro,
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

  /**
   * "Întrebare EXPRESS" → a pending QuickQuestion ticket.
   *
   * The deadline is ~1 hour of **working** time (answers v2 §5), not one hour
   * on the wall clock: a question sent at 23:40 on a Saturday is due early on
   * Monday. It is computed once, here, and stored — editing the schedule later
   * must not retroactively make an already-answered ticket late.
   */
  async createQuickQuestion(
    dto: QuickQuestionLeadDto,
  ): Promise<QuickQuestionDto> {
    const dueAt = await this.workingHours.expressDueAt();

    const qq = await this.prisma.quickQuestion.create({
      data: {
        clientName: dto.name,
        clientEmail: dto.email,
        phone: dto.phone ?? null,
        question: dto.question,
        locale: dto.locale ?? Locale.ro,
        status: QuickQuestionStatus.open,
        paymentStatus: PaymentStatus.pending,
        dueAt,
      },
    });

    await this.mail.sendLeadNotification({
      subject: 'Întrebare EXPRESS nouă',
      lines: [
        `Întrebare EXPRESS nouă. Termen de răspuns: ${await this.inPracticeTime(dueAt)}.`,
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
   * "Întrebare EXPRESS", bought: the ticket first, then the bank.
   *
   * The question is written down before the redirect and the ticket starts in
   * `awaiting_payment` — invisible to the doctor, no deadline, no answer box.
   * That is the whole of "an answer only after payment", and it costs the buyer
   * nothing if they close the tab: the worst case is a question we keep for
   * seven days and delete. Pay-first was the other reading of the brief and was
   * rejected, because with no SMTP the recovery path for a closed tab is an
   * email nobody can send (docs/shape-express-checkout.md, decision 1).
   *
   * Nothing about the price comes from the request. `Service.price` is read
   * here and handed to `PaymentsService.start()`, which applies maib's own
   * rules to it before the bank is called.
   */
  async startQuickQuestionCheckout(
    dto: QuickQuestionCheckoutDto,
  ): Promise<{ checkoutUrl: string; orderId: string }> {
    // The bank's compliance review requires the merchant's registered entity on
    // the site and in the receipt. Selling before it exists would mean taking
    // money as a company that is not named anywhere, so the route refuses while
    // the client's incorporation is outstanding (decision 3). 503, not 400:
    // there is nothing wrong with what the buyer sent.
    if (!canSell())
      throw new ServiceUnavailableException('legal_entity_missing');

    const service = await this.prisma.service.findUnique({
      where: { code: ServiceCode.quick_question },
    });
    if (!service)
      throw new NotFoundException('quick_question_service_not_found');

    const locale = dto.locale ?? Locale.ro;

    // No `dueAt`: the SLA clock starts when the money lands, not now.
    const ticket = await this.prisma.quickQuestion.create({
      data: {
        clientName: dto.name,
        clientEmail: dto.email,
        phone: dto.phone ?? null,
        question: dto.question,
        locale,
        status: QuickQuestionStatus.awaiting_payment,
        paymentStatus: PaymentStatus.pending,
      },
    });

    let started;
    try {
      started = await this.payments.start({
        targetType: PaymentTargetType.quick_question,
        targetId: ticket.id,
        amount: service.price,
        currency: paymentCurrency(),
        description: service.titleRo,
        locale,
        payerName: dto.name,
        payerEmail: dto.email,
        payerPhone: dto.phone,
        intentKey: dto.intentKey,
      });
    } catch (e) {
      // A ticket with no session behind it is a medical question nobody can
      // pay for. The purge would collect it in seven days; deleting it now
      // keeps a refused price or an unreachable bank from leaving anything
      // behind at all.
      await this.prisma.quickQuestion.delete({ where: { id: ticket.id } });
      throw e;
    }

    // The same form submitted twice. The first ticket is the one the payment
    // points at; this one has nothing behind it.
    if (started.reused) {
      await this.prisma.quickQuestion.delete({ where: { id: ticket.id } });
    }

    this.logger.log(
      `EXPRESS checkout ${started.reused ? 'resumed' : 'opened'} (order ${started.orderId}).`,
    );
    return { checkoutUrl: started.checkoutUrl, orderId: started.orderId };
  }

  /**
   * Group-C product order → a `new` DeliverableOrder the doctor works through
   * in the back office ("Comenzi").
   *
   * The label and the price come from the shared catalog, never from the
   * request: the form posts a product code and nothing else about the product.
   * An unknown code is a 400 rather than an order nobody can price.
   */
  async createDeliverable(
    dto: DeliverableLeadDto,
  ): Promise<DeliverableOrderDto> {
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
        locale: dto.locale ?? Locale.ro,
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
    await this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
        locale: dto.locale ?? Locale.ro,
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
