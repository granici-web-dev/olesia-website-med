import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import {
  PaymentState,
  PaymentStatus,
  PaymentTargetType,
  RefundState,
} from '../../generated/prisma/enums';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import {
  MaibService,
  type MaibCallbackBody,
  type MaibCheckout,
} from './maib.service';
import { toPaymentDto } from './payments.mapper';

/** What the caller needs to open a checkout for one payable thing. */
export interface StartPaymentInput {
  targetType: PaymentTargetType;
  targetId?: string;
  amount: number;
  currency: string;
  description: string;
  locale: 'ro' | 'ru' | 'en';
  payerName?: string;
  payerEmail: string;
  payerPhone?: string;
  payerIp?: string;
  payerUserAgent?: string;
}

/**
 * Map maib's status strings onto our own enum.
 *
 * Case-insensitive on purpose: the bank documents `WaitingForInit` and returns
 * `Waitingforinit`, and ships values (`Refunded`) that are in no enum at all.
 * Anything unrecognised becomes `pending` rather than throwing — a payment we
 * cannot classify is still a payment we must not lose.
 */
export function toPaymentState(
  checkoutStatus: string | null | undefined,
  paymentStatus?: string | null,
  amount?: number,
  refundedAmount?: number | null,
): PaymentState {
  const pay = (paymentStatus ?? '').toLowerCase();
  if (pay === 'refunded' || (refundedAmount && amount && refundedAmount >= amount)) {
    return PaymentState.refunded;
  }
  if (refundedAmount && refundedAmount > 0) return PaymentState.partially_refunded;
  if (pay === 'executed') return PaymentState.paid;
  if (pay === 'failed') return PaymentState.failed;

  switch ((checkoutStatus ?? '').toLowerCase()) {
    case 'completed':
      return PaymentState.paid;
    case 'failed':
      return PaymentState.failed;
    case 'expired':
      return PaymentState.expired;
    case 'abandoned':
      return PaymentState.abandoned;
    case 'cancelled':
    case 'canceled':
      return PaymentState.cancelled;
    case 'waitingforinit':
      return PaymentState.created;
    default:
      return PaymentState.pending;
  }
}

/** States after which nothing more will happen on its own. */
const TERMINAL: PaymentState[] = [
  PaymentState.paid,
  PaymentState.failed,
  PaymentState.expired,
  PaymentState.abandoned,
  PaymentState.cancelled,
  PaymentState.refunded,
  PaymentState.partially_refunded,
];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly maib: MaibService,
  ) {}

  /* ---------------------------- starting ---------------------------- */

  /**
   * Open a hosted checkout and record it before the payer ever sees the page.
   * The row exists first on purpose: the bank's list endpoints are broken, so
   * a session we did not write down is unrecoverable.
   */
  async start(input: StartPaymentInput): Promise<{ checkoutUrl: string; orderId: string }> {
    const orderId = `${input.targetType}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`.toUpperCase();

    const site = process.env.PUBLIC_SITE_URL ?? '';
    const api = process.env.PUBLIC_API_URL ?? '';

    const session = await this.maib.createCheckout({
      amount: input.amount,
      currency: input.currency,
      language: input.locale,
      // Always explicit: omitting these makes maib fall back to the portal
      // config, and an unset callbackUrl means no callback is ever sent.
      callbackUrl: `${api}/payments/maib/callback`,
      successUrl: `${site}/${input.locale}/payment/success?order=${orderId}`,
      failUrl: `${site}/${input.locale}/payment/failed?order=${orderId}`,
      orderInfo: { id: orderId, description: input.description.slice(0, 125) },
      payerInfo: {
        name: input.payerName,
        email: input.payerEmail,
        phone: input.payerPhone,
        ip: input.payerIp,
        userAgent: input.payerUserAgent,
      },
    });

    await this.prisma.payment.create({
      data: {
        checkoutId: session.checkoutId,
        orderId,
        state: PaymentState.created,
        amount: new Prisma.Decimal(input.amount),
        currency: input.currency,
        targetType: input.targetType,
        targetId: input.targetId,
        payerName: input.payerName,
        payerEmail: input.payerEmail.toLowerCase(),
        payerPhone: input.payerPhone,
        patientId: await this.findPatientId(input.payerEmail),
      },
    });

    return { checkoutUrl: session.checkoutUrl, orderId };
  }

  /* ---------------------------- ingesting ---------------------------- */

  /**
   * Apply a verified callback. Idempotent: maib may deliver the same
   * notification more than once, and the reconcile sweep writes the same
   * transitions from the other direction.
   */
  async applyCallback(body: MaibCallbackBody): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { checkoutId: body.checkoutId },
    });
    if (!payment) {
      // Not ours, or a row we failed to write. Loud, because it means a payer
      // was charged for something we cannot attribute.
      this.logger.error(
        `maib callback for unknown checkout ${body.checkoutId} (order ${body.orderId})`,
      );
      return;
    }

    const state = toPaymentState(
      'completed',
      body.paymentStatus,
      body.paymentAmount,
      null,
    );

    await this.persist(payment.id, {
      state,
      paymentId: body.paymentId,
      method: body.paymentMethod ?? payment.method,
      payerName: body.payerName ?? payment.payerName,
      payerPhone: body.payerPhone ?? payment.payerPhone,
      rrn: body.retrievalReferenceNumber,
      approvalCode: body.approvalCode,
      cardMask: body.senderCardNumber,
      threeDsResult: body.threeDsResult,
      terminalId: body.terminalId,
      rawCallback: body as unknown as Prisma.InputJsonValue,
      paidAt: state === PaymentState.paid ? new Date() : undefined,
      failedAt: state === PaymentState.failed ? new Date() : undefined,
    });
  }

  /**
   * Ask the bank what really happened. This is the authority — the callback is
   * an optimisation, and maib does not promise one for every failure.
   */
  async syncFromBank(checkoutId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({ where: { checkoutId } });
    if (!payment) throw new NotFoundException('payment_not_found');

    let checkout: MaibCheckout;
    try {
      checkout = await this.maib.getCheckout(checkoutId);
    } catch {
      return; // Bank unavailable; the sweep will try again.
    }

    const pay = checkout.payment ?? undefined;
    const refunded = pay?.refundedAmount ?? 0;
    const state = toPaymentState(
      checkout.status,
      pay?.status,
      pay?.amount ?? Number(payment.amount),
      refunded,
    );

    await this.persist(payment.id, {
      state,
      paymentId: pay?.PaymentId ?? pay?.paymentId ?? payment.paymentId,
      // Captured only while it is still there: maib blanks paymentMethod out
      // on the payment record once a refund is accepted.
      method: pay?.paymentMethod ?? payment.method,
      approvalCode: pay?.approvalCode ?? payment.approvalCode,
      rrn: pay?.referenceNumber ?? payment.rrn,
      terminalId: pay?.terminalId ?? payment.terminalId,
      refundedAmount: new Prisma.Decimal(refunded),
      expiresAt: checkout.expiresAt ? new Date(checkout.expiresAt) : undefined,
      // Whenever the bank says it completed — not only while the state is
      // still `paid`. A refunded payment must keep the date it was paid on.
      paidAt:
        !payment.paidAt && checkout.completedAt
          ? new Date(checkout.completedAt)
          : undefined,
    });
  }

  /** Re-check everything that is still open and past its expiry. */
  async reconcileStale(): Promise<number> {
    const stale = await this.prisma.payment.findMany({
      where: {
        state: { notIn: TERMINAL },
        createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) },
      },
      select: { checkoutId: true },
      take: 100,
    });
    for (const s of stale) await this.syncFromBank(s.checkoutId);
    return stale.length;
  }

  /* ----------------------------- refunds ----------------------------- */

  async refund(
    paymentRowId: string,
    amount: number,
    reason: string,
    authorId?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentRowId },
    });
    if (!payment) throw new NotFoundException('payment_not_found');
    if (!payment.paymentId) throw new BadRequestException('payment_not_executed');

    const remaining = Number(payment.amount) - Number(payment.refundedAmount);
    if (amount <= 0 || amount > remaining) {
      throw new BadRequestException('refund_amount_out_of_range');
    }

    const res = await this.maib.refund(payment.paymentId, amount, reason);

    await this.prisma.paymentRefund.create({
      data: {
        paymentId: payment.id,
        refundId: res.refundId,
        state:
          res.status?.toLowerCase() === 'accepted'
            ? RefundState.accepted
            : RefundState.created,
        amount: new Prisma.Decimal(amount),
        currency: payment.currency,
        reason,
        authorId,
      },
    });

    // The bank owns the truth about the resulting state; ask it.
    await this.syncFromBank(payment.checkoutId);
    return this.findOne(payment.id);
  }

  /* ------------------------------ reads ------------------------------ */

  async findAll(query: PaginationQueryDto, state?: PaymentState) {
    const where: Prisma.PaymentWhereInput = state ? { state } : {};
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { refunds: true },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return paginate(items.map(toPaymentDto), total, query);
  }

  async findOne(id: string) {
    const p = await this.prisma.payment.findUnique({
      where: { id },
      include: { refunds: true },
    });
    if (!p) throw new NotFoundException('payment_not_found');
    return toPaymentDto(p);
  }

  /**
   * Everything one person has ever paid for.
   *
   * Matches on the patient link *and* on the payer email, because a Patient
   * record is often created after the first payment — without the email arm,
   * promoting a payer to a patient would silently start their history at zero.
   */
  async historyForPatient(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, email: true },
    });
    if (!patient) throw new NotFoundException('patient_not_found');

    const rows = await this.prisma.payment.findMany({
      where: {
        OR: [{ patientId: patient.id }, { payerEmail: patient.email.toLowerCase() }],
      },
      orderBy: { createdAt: 'desc' },
      include: { refunds: true },
    });
    return rows.map(toPaymentDto);
  }

  /** Public, PII-free status for the return page. */
  async publicStatus(orderId: string) {
    const p = await this.prisma.payment.findUnique({
      where: { orderId },
      select: { orderId: true, state: true, amount: true, currency: true, checkoutId: true },
    });
    if (!p) throw new NotFoundException('payment_not_found');

    // The redirect is user-controllable, so a return page hitting this while
    // the callback is still in flight must get the bank's answer, not ours.
    if (!TERMINAL.includes(p.state)) await this.syncFromBank(p.checkoutId);

    const fresh = await this.prisma.payment.findUnique({
      where: { orderId },
      select: { orderId: true, state: true, amount: true, currency: true },
    });
    return fresh ?? p;
  }

  /* ---------------------------- internals ---------------------------- */

  private async persist(id: string, data: Prisma.PaymentUpdateInput) {
    const payment = await this.prisma.payment.update({ where: { id }, data });

    // Late-link: the Patient may have been created between start and payment.
    if (!payment.patientId) {
      const patientId = await this.findPatientId(payment.payerEmail);
      if (patientId) {
        await this.prisma.payment.update({ where: { id }, data: { patientId } });
      }
    }

    if (payment.state === PaymentState.paid) await this.markTargetPaid(payment);
  }

  private async findPatientId(email: string): Promise<string | undefined> {
    // Link only to a patient who already exists. A payer is not automatically
    // a medical record — promoting one is an explicit act in the back office.
    const patient = await this.prisma.patient.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    return patient?.id;
  }

  /**
   * Mirror the paid state onto the thing that was bought, so every screen that
   * already reads `paymentStatus` keeps working without knowing about Payment.
   */
  private async markTargetPaid(payment: {
    targetType: PaymentTargetType;
    targetId: string | null;
  }): Promise<void> {
    const { targetType, targetId } = payment;
    if (!targetId) return;
    const data = { paymentStatus: PaymentStatus.confirmed };

    switch (targetType) {
      case PaymentTargetType.appointment:
        await this.prisma.appointment.update({ where: { id: targetId }, data });
        break;
      case PaymentTargetType.quick_question:
        await this.prisma.quickQuestion.update({ where: { id: targetId }, data });
        break;
      case PaymentTargetType.deliverable_order:
        await this.prisma.deliverableOrder.update({ where: { id: targetId }, data });
        break;
      case PaymentTargetType.subscription:
        await this.prisma.subscription.update({ where: { id: targetId }, data });
        break;
      case PaymentTargetType.material:
        // Paid materials have no order row yet — the Payment is the record.
        break;
    }
  }
}
