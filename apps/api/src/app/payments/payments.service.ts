import { randomBytes } from 'node:crypto';
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

/**
 * States that mean money has already moved. Once a payment reaches one of
 * these, nothing may quietly walk it back to "not paid yet" or to a plain
 * `paid` that hides a refund.
 */
const MONEY_HAS_MOVED: PaymentState[] = [
  PaymentState.paid,
  PaymentState.refunded,
  PaymentState.partially_refunded,
];

/** States a payment must never regress into once money has moved. */
const REGRESSIONS: PaymentState[] = [
  PaymentState.paid,
  PaymentState.pending,
  PaymentState.created,
];

/**
 * Decide the state to persist, given what we hold and what the bank just said.
 *
 * Both the callback and the reconcile sweep write through here. A duplicate
 * delivery of the original success notification arrives long after a refund
 * has been accepted and reports `Executed` in perfectly good faith; taken at
 * face value it would flip a refunded payment back to paid and tell the back
 * office the money is still ours.
 */
export function resolvePaymentState(
  current: PaymentState,
  incoming: PaymentState,
): PaymentState {
  if (MONEY_HAS_MOVED.includes(current) && REGRESSIONS.includes(incoming)) {
    return current;
  }
  return incoming;
}

/**
 * Compare what the bank says it charged against what we opened the session
 * with. Returns a human-readable description of the first disagreement, or
 * null when everything lines up.
 *
 * The signature proves the payload came from maib; it says nothing about the
 * payload being the one we expected. A partial capture, a currency the profile
 * was enabled for later, or a plain bank-side mistake would otherwise be
 * recorded as a clean payment and mark the purchase confirmed.
 */
export function describeCallbackMismatch(
  payment: { amount: Prisma.Decimal; currency: string; orderId: string },
  body: Pick<MaibCallbackBody, 'paymentAmount' | 'paymentCurrency' | 'orderId'>,
): string | null {
  if (!new Prisma.Decimal(body.paymentAmount).equals(payment.amount)) {
    return `amount ${body.paymentAmount} != recorded ${payment.amount.toString()}`;
  }
  if (body.paymentCurrency !== payment.currency) {
    return `currency ${body.paymentCurrency} != recorded ${payment.currency}`;
  }
  // maib documents orderId as nullable, so a missing one is the bank choosing
  // not to echo it, not a disagreement.
  if (body.orderId != null && body.orderId !== payment.orderId) {
    return `orderId ${body.orderId} != recorded ${payment.orderId}`;
  }
  return null;
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
    // The order reference is the only thing guarding the public status
    // endpoint, so it is drawn from the CSPRNG rather than Math.random. Not
    // uppercased: base64url is case-sensitive and folding it would throw away
    // half the alphabet.
    const orderId = `${input.targetType}-${randomBytes(9).toString('base64url')}`;

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

    try {
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
    } catch (e) {
      // A session the bank holds and we have no row for is unrecoverable: the
      // list endpoints are broken (docs/payments-maib-checkout.md §14). Hand it
      // back before it becomes a mystery in the merchant portal.
      await this.maib
        .cancelCheckout(session.checkoutId)
        .catch(() =>
          this.logger.error(
            `orphaned maib checkout ${session.checkoutId}: recording it failed and cancelling it failed too`,
          ),
        );
      throw e;
    }

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

    const mismatch = describeCallbackMismatch(payment, body);
    if (mismatch) {
      // Answer 200 anyway (the controller does): a retry would deliver the
      // same payload and we would reject it again. This needs a human, not
      // another delivery attempt.
      this.logger.error(
        `maib callback rejected for checkout ${body.checkoutId}: ${mismatch}`,
      );
      return;
    }

    const state = resolvePaymentState(
      payment.state,
      toPaymentState(
        'completed',
        body.paymentStatus,
        body.paymentAmount,
        Number(payment.refundedAmount),
      ),
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
      paidAt:
        !payment.paidAt && state === PaymentState.paid
          ? new Date(body.paymentExecutedAt ?? Date.now())
          : undefined,
      failedAt:
        !payment.failedAt && state === PaymentState.failed ? new Date() : undefined,
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
    const state = resolvePaymentState(
      payment.state,
      toPaymentState(
        checkout.status,
        pay?.status,
        pay?.amount ?? Number(payment.amount),
        refunded,
      ),
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

  /**
   * Refund, in two acts: reserve the money in our ledger under a row lock,
   * then ask the bank.
   *
   * The reservation is the point. Two admins pressing the button at the same
   * moment used to read the same balance, both pass the check and both call
   * the bank, and maib documents no idempotency key on the refund endpoint. So
   * a refund row is written *before* the bank call and counts against the
   * balance while it is in flight; the second caller sees the money as already
   * spoken for. If the bank then refuses, the row stays as `failed` — it is
   * evidence, not a draft.
   */
  async refund(
    paymentRowId: string,
    amount: number,
    reason: string,
    authorId?: string,
  ) {
    const reservation = await this.prisma.$transaction(async (tx) => {
      // FOR UPDATE, not findUnique: every concurrent refund of this payment
      // queues on this row before it can read the balance.
      const [locked] = await tx.$queryRaw<
        { id: string; paymentId: string | null; checkoutId: string; currency: string }[]
      >`SELECT "id", "paymentId", "checkoutId", "currency"
          FROM "Payment" WHERE "id" = ${paymentRowId} FOR UPDATE`;

      if (!locked) throw new NotFoundException('payment_not_found');
      if (!locked.paymentId) throw new BadRequestException('payment_not_executed');

      const payment = await tx.payment.findUniqueOrThrow({
        where: { id: paymentRowId },
        select: { amount: true, refundedAmount: true },
      });
      const inFlight = await tx.paymentRefund.aggregate({
        where: { paymentId: paymentRowId, state: RefundState.created },
        _sum: { amount: true },
      });

      const remaining =
        Number(payment.amount) -
        Number(payment.refundedAmount) -
        Number(inFlight._sum.amount ?? 0);

      if (amount <= 0 || amount > remaining) {
        throw new BadRequestException('refund_amount_out_of_range');
      }

      const row = await tx.paymentRefund.create({
        data: {
          paymentId: paymentRowId,
          state: RefundState.created,
          amount: new Prisma.Decimal(amount),
          currency: locked.currency,
          reason,
          authorId,
        },
      });
      return { rowId: row.id, payId: locked.paymentId, checkoutId: locked.checkoutId };
    });

    let res: { refundId: string; status: string };
    try {
      res = await this.maib.refund(reservation.payId, amount, reason);
    } catch (e) {
      await this.prisma.paymentRefund.update({
        where: { id: reservation.rowId },
        data: { state: RefundState.failed },
      });
      throw e;
    }

    await this.prisma.paymentRefund.update({
      where: { id: reservation.rowId },
      data: {
        refundId: res.refundId,
        state:
          res.status?.toLowerCase() === 'accepted'
            ? RefundState.accepted
            : RefundState.created,
      },
    });

    // The bank owns the truth about the resulting state; ask it.
    await this.syncFromBank(reservation.checkoutId);
    return this.findOne(paymentRowId);
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

  /**
   * Write the payment, its late patient link and the mirror onto the purchase
   * as one unit. Before, a crash between the three left a paid payment whose
   * appointment still read `pending`, and no retry repaired it.
   */
  private async persist(id: string, data: Prisma.PaymentUpdateInput) {
    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({ where: { id }, data });

      // Late-link: the Patient may have been created between start and payment.
      if (!payment.patientId) {
        const patientId = await this.findPatientId(payment.payerEmail, tx);
        if (patientId) {
          await tx.payment.update({ where: { id }, data: { patientId } });
        }
      }

      if (payment.state === PaymentState.paid) {
        await this.markTargetPaid(payment, tx);
      }
    });
  }

  private async findPatientId(
    email: string,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<string | undefined> {
    // Link only to a patient who already exists. A payer is not automatically
    // a medical record — promoting one is an explicit act in the back office.
    const patient = await client.patient.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    return patient?.id;
  }

  /**
   * Mirror the paid state onto the thing that was bought, so every screen that
   * already reads `paymentStatus` keeps working without knowing about Payment.
   */
  private async markTargetPaid(
    payment: { targetType: PaymentTargetType; targetId: string | null },
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const { targetType, targetId } = payment;
    if (!targetId) return;
    const data = { paymentStatus: PaymentStatus.confirmed };

    try {
      switch (targetType) {
        case PaymentTargetType.appointment:
          await tx.appointment.update({ where: { id: targetId }, data });
          break;
        case PaymentTargetType.quick_question:
          await tx.quickQuestion.update({ where: { id: targetId }, data });
          break;
        case PaymentTargetType.deliverable_order:
          await tx.deliverableOrder.update({ where: { id: targetId }, data });
          break;
        case PaymentTargetType.subscription:
          await tx.subscription.update({ where: { id: targetId }, data });
          break;
        case PaymentTargetType.material:
          // Paid materials have no order row yet — the Payment is the record.
          break;
      }
    } catch (e) {
      // The purchase was deleted between paying for it and the bank telling us.
      // Letting this throw would 500 the webhook, the bank would retry, and the
      // retry would throw again forever. The payment record is the source of
      // truth; the mirror is a convenience.
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        this.logger.warn(
          `paid ${targetType} ${targetId} no longer exists; payment recorded anyway`,
        );
        return;
      }
      throw e;
    }
  }
}
