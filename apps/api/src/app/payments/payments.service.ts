import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { toE164, type PublicPaymentStatusDto } from '@olesia/shared';
import { Prisma } from '../../generated/prisma/client';
import {
  PaymentState,
  PaymentStatus,
  PaymentTargetType,
  QuickQuestionStatus,
  RefundState,
  ServiceCode,
} from '../../generated/prisma/enums';

import { PrismaService } from '../prisma/prisma.service';
import { WorkingHoursService } from '../working-hours/working-hours.service';
import { PatientNotificationsService } from '../mail/patient-notifications.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import {
  MaibService,
  type MaibCallbackBody,
  type MaibCheckout,
} from './maib.service';
import { toPaymentDto } from './payments.mapper';
import { activateTicketData } from '../quick-questions/quick-questions.service';

/**
 * What the caller needs to open a checkout for one payable thing.
 *
 * There is deliberately no `amount`: the price is read from the catalog by
 * whoever builds this input, never taken from a request body. A public route
 * that accepted an amount would sell an 8 € consultation for 1.01.
 */
export interface StartPaymentInput {
  targetType: PaymentTargetType;
  targetId?: string;
  /** In the currency below, already resolved from the catalog. */
  amount: number;
  currency: string;
  description: string;
  /** One line on the bank's hosted page. Defaults to `description`. */
  itemTitle?: string;
  locale: 'ro' | 'ru' | 'en';
  payerName?: string;
  payerEmail: string;
  /** As the payer typed it. Normalised to E.164 here, or omitted. */
  payerPhone?: string;
  payerIp?: string;
  payerUserAgent?: string;
  /**
   * The buyer's own idea of "this purchase". A repeat submit carrying the same
   * key is handed back the session it already opened.
   */
  intentKey?: string;
}

/**
 * Where to send the payer, and whether this is a session that already existed.
 *
 * `reused` is for the caller's benefit, not the payer's: the purchase row is
 * written before the session is opened, so a duplicate submit has something to
 * roll back.
 */
export interface StartedPayment {
  checkoutUrl: string;
  orderId: string;
  reused: boolean;
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
  if (
    pay === 'refunded' ||
    (refundedAmount && amount && refundedAmount >= amount)
  ) {
    return PaymentState.refunded;
  }
  if (refundedAmount && refundedAmount > 0)
    return PaymentState.partially_refunded;
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

/**
 * What a purchase's `paymentStatus` should read, given every payment recorded
 * against it.
 *
 * `confirmed` the moment one of them is `paid`, `pending` otherwise. A refund
 * therefore reads as unpaid, which is the honest answer: the money went back.
 * A purchase can carry more than one payment — a manual record and a bank one,
 * or a retry after a failure — so voiding any single row must not be allowed
 * to conclude anything on its own (audit A5, F3).
 */
export function mirrorStatusFor(
  payments: { state: PaymentState }[],
): PaymentStatus {
  return payments.some((p) => p.state === PaymentState.paid)
    ? PaymentStatus.confirmed
    : PaymentStatus.pending;
}

/**
 * `method` on a payment the bank never saw. The bank's own values are `Card`,
 * `MiaQr` and so on, so this cannot collide with one, and it is what
 * `voidManual` checks before it agrees to cancel a row.
 */
const MANUAL_METHOD = 'manual';

/**
 * maib refuses an amount at or below 1.00 (docs/payments-maib-checkout.md §18),
 * and a service priced 0 is "on request" rather than free. Both are refused
 * here, before the bank is called, so the buyer reads our sentence instead of
 * error 42007.
 *
 * Returns the machine code of the problem, or null when the amount can be
 * charged. Exported because it is the one piece of arithmetic between a price
 * in the catalog and money leaving somebody's card.
 */
export function checkoutAmount(price: number): string | null {
  if (price === 0) return 'price_on_request';
  if (price <= MAIB_MINIMUM_AMOUNT) return 'amount_below_minimum';
  return null;
}

/** maib's floor. Strictly greater than, not at least. */
const MAIB_MINIMUM_AMOUNT = 1.0;

/**
 * What to do with the payment an intent key already points at.
 *
 * A person who double-clicks submit, or reloads the checkout page and sends
 * the form again, must not end up with two tickets and two bank sessions. The
 * key is minted by the page and kept for the length of the tab, so the second
 * request arrives carrying the first one's key.
 *
 *  - nothing recorded: open a session.
 *  - a session still live: hand back the URL it already has.
 *  - a session that is over (paid, failed, expired, cancelled): the key has
 *    done its job. Detach it so it can be reused, and open a fresh session —
 *    somebody whose card was declined is trying again, and must be able to.
 */
export function resolveIntent(
  existing: {
    state: PaymentState;
    checkoutUrl: string | null;
    expiresAt: Date | null;
  } | null,
  now: Date = new Date(),
): { reuse: string } | { detach: true } | { open: true } {
  if (!existing) return { open: true };
  if (TERMINAL.includes(existing.state)) return { detach: true };
  if (existing.expiresAt && existing.expiresAt <= now) return { detach: true };
  if (!existing.checkoutUrl) return { detach: true };
  return { reuse: existing.checkoutUrl };
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

  /**
   * `WorkingHoursService` and `PatientNotificationsService` are both `@Global()`,
   * so fulfilment lives inside the transaction that records the payment without
   * a new module import and without a risk of an import cycle. That is the whole
   * reason there is no event bus here — see the shape's tradeoffs.
   */
  constructor(
    private readonly prisma: PrismaService,
    private readonly maib: MaibService,
    private readonly workingHours: WorkingHoursService,
    private readonly notifications: PatientNotificationsService,
  ) {}

  /* ---------------------------- starting ---------------------------- */

  /**
   * Open a hosted checkout and record it before the payer ever sees the page.
   * The row exists first on purpose: the bank's list endpoints are broken, so
   * a session we did not write down is unrecoverable.
   *
   * Every rule maib has about its input is enforced here rather than in the
   * callers (docs/payments-maib-checkout.md §18), so no caller ever learns that
   * the bank has opinions about phone formats or minimum amounts.
   */
  async start(input: StartPaymentInput): Promise<StartedPayment> {
    const amountProblem = checkoutAmount(input.amount);
    if (amountProblem) throw new BadRequestException(amountProblem);

    if (input.intentKey) {
      const reused = await this.reuseIntent(input.intentKey);
      // `reused` says the purchase the caller just wrote down is a duplicate of
      // one already in flight, so the caller can undo it. Without that, a double
      // click leaves a second ticket nobody can pay for.
      if (reused) return { ...reused, reused: true };
    }

    // The order reference is the only thing guarding the public status
    // endpoint, so it is drawn from the CSPRNG rather than Math.random. Not
    // uppercased: base64url is case-sensitive and folding it would throw away
    // half the alphabet.
    const orderId = `${input.targetType}-${randomBytes(9).toString('base64url')}`;

    const site = process.env.PUBLIC_SITE_URL ?? '';
    const api = process.env.PUBLIC_API_URL ?? '';

    // E.164 or nothing: a phone in any other shape is refused by maib with
    // error 42005, and it refuses the whole session rather than the field.
    const payerPhone = toE164(input.payerPhone, 'MD') ?? undefined;

    const session = await this.maib.createCheckout({
      amount: input.amount,
      currency: input.currency,
      language: input.locale,
      // Always explicit: omitting these makes maib fall back to the portal
      // config, and an unset callbackUrl means no callback is ever sent.
      callbackUrl: `${api}/payments/maib/callback`,
      successUrl: `${site}/${input.locale}/payment/success?order=${orderId}`,
      failUrl: `${site}/${input.locale}/payment/failed?order=${orderId}`,
      orderInfo: {
        id: orderId,
        description: input.description.slice(0, 125),
        date: new Date().toISOString(),
        // One line per purchase. Without it the hosted page shows an amount and
        // nothing about what it is for, which is the moment a card form loses
        // people.
        items: [
          {
            title: (input.itemTitle ?? input.description).slice(0, 125),
            amount: input.amount,
            currency: input.currency,
            quantity: 1,
          },
        ],
      },
      payerInfo: {
        name: input.payerName,
        email: input.payerEmail,
        phone: payerPhone,
        ip: input.payerIp,
        userAgent: input.payerUserAgent,
      },
    });

    try {
      await this.prisma.payment.create({
        data: {
          checkoutId: session.checkoutId,
          checkoutUrl: session.checkoutUrl,
          intentKey: input.intentKey,
          orderId,
          state: PaymentState.created,
          amount: new Prisma.Decimal(input.amount),
          currency: input.currency,
          targetType: input.targetType,
          targetId: input.targetId,
          payerName: input.payerName,
          payerEmail: input.payerEmail.toLowerCase(),
          payerPhone,
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

    return { checkoutUrl: session.checkoutUrl, orderId, reused: false };
  }

  /**
   * The session an intent key already opened, if it is still worth reusing.
   *
   * Returns null when a fresh session should be opened; in that case a stale
   * key has already been detached from its old row, so the unique index does
   * not refuse the new one.
   */
  private async reuseIntent(
    intentKey: string,
  ): Promise<{ checkoutUrl: string; orderId: string } | null> {
    const existing = await this.prisma.payment.findUnique({
      where: { intentKey },
      select: {
        id: true,
        orderId: true,
        state: true,
        checkoutUrl: true,
        expiresAt: true,
      },
    });

    if (!existing) return null;

    const verdict = resolveIntent(existing);
    if ('reuse' in verdict) {
      return { checkoutUrl: verdict.reuse, orderId: existing.orderId };
    }
    if ('detach' in verdict) {
      await this.prisma.payment.update({
        where: { id: existing.id },
        data: { intentKey: null },
      });
    }
    return null;
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
        !payment.failedAt && state === PaymentState.failed
          ? new Date()
          : undefined,
    });
  }

  /**
   * Ask the bank what really happened. This is the authority — the callback is
   * an optimisation, and maib does not promise one for every failure.
   */
  async syncFromBank(checkoutId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { checkoutId },
    });
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
      paymentId: pay?.paymentId ?? payment.paymentId,
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
        // A manual payment has no session at the bank, so there is nothing to
        // reconcile it against. It is also never non-terminal, which makes
        // this belt and braces rather than a filter that does work.
        checkoutId: { not: null },
      },
      select: { checkoutId: true },
      take: 100,
    });
    for (const s of stale) await this.syncFromBank(s.checkoutId!);
    return stale.length;
  }

  /* -------------------------- manual payments -------------------------- */

  /**
   * Record money that arrived outside the bank: cash at the practice, a
   * transfer, a card machine that is not ours.
   *
   * It is a `Payment` row like any other, and that is the point (audit A5,
   * F3). `paymentStatus` on an appointment, subscription, order or question is
   * documented as a mirror of this ledger, but three PATCH endpoints and three
   * back-office switches wrote it by hand — so "confirmed" meant either "the
   * bank told us" or "somebody clicked", with nothing recording which, how
   * much, or who. A row with `method: 'manual'` says all three.
   *
   * The payer is read off the purchase rather than taken from the request: the
   * name and address on the order are the record of who bought it, and letting
   * the caller supply a different one would put a second version of the truth
   * in the ledger.
   */
  async recordManual(input: {
    targetType: PaymentTargetType;
    targetId: string;
    amount: number;
    currency: string;
    note?: string;
    authorId: string;
  }) {
    const payer = await this.payerForTarget(input.targetType, input.targetId);

    // `MANUAL-` rather than the target type the checkout flow uses, so the
    // reference says at a glance that no bank was involved.
    const orderId = `MANUAL-${randomBytes(9).toString('base64url')}`;
    const paidAt = new Date();

    const created = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          checkoutId: null,
          orderId,
          state: PaymentState.paid,
          amount: new Prisma.Decimal(input.amount),
          currency: input.currency,
          method: MANUAL_METHOD,
          targetType: input.targetType,
          targetId: input.targetId,
          payerName: payer.name,
          payerEmail: payer.email.toLowerCase(),
          patientId: await this.findPatientId(payer.email, tx),
          note: input.note,
          authorId: input.authorId,
          paidAt,
        },
      });
      await this.markTargetPaid(payment, tx);
      return payment;
    });

    this.logger.log(
      `audit payment.manual paymentId=${created.id} target=${input.targetType}:${input.targetId} userId=${input.authorId}`,
    );
    return this.findOne(created.id);
  }

  /**
   * Undo a manual payment that was recorded in error.
   *
   * Only a manual one: a bank payment is undone by refunding it, which moves
   * real money, and a "void" that silently disagreed with maib would be the
   * worst kind of wrong. The row is cancelled rather than deleted — it is
   * evidence that somebody recorded a payment and somebody took it back.
   *
   * The mirror is then recomputed from the ledger rather than assumed: a
   * purchase can have been paid twice, once manually and once through the
   * bank, and voiding one of those must not mark it unpaid.
   */
  async voidManual(paymentRowId: string, authorId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentRowId },
    });
    if (!payment) throw new NotFoundException('payment_not_found');
    if (payment.method !== MANUAL_METHOD) {
      throw new BadRequestException('not_a_manual_payment');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentRowId },
        data: { state: PaymentState.cancelled },
      });
      await this.recomputeTargetMirror(payment, tx);
    });

    this.logger.log(
      `audit payment.void paymentId=${paymentRowId} userId=${authorId}`,
    );
    return this.findOne(paymentRowId);
  }

  /** Every payment recorded against one purchase, newest first. */
  async historyForTarget(targetType: PaymentTargetType, targetId: string) {
    const rows = await this.prisma.payment.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: 'desc' },
      include: { refunds: true },
    });
    return rows.map(toPaymentDto);
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
        {
          id: string;
          paymentId: string | null;
          checkoutId: string | null;
          currency: string;
        }[]
      >`SELECT "id", "paymentId", "checkoutId", "currency"
          FROM "Payment" WHERE "id" = ${paymentRowId} FOR UPDATE`;

      if (!locked) throw new NotFoundException('payment_not_found');
      // Also what refuses a manual payment: it never had a bank payment id,
      // and money the bank never took is not money the bank can send back.
      if (!locked.paymentId)
        throw new BadRequestException('payment_not_executed');
      if (!locked.checkoutId)
        throw new BadRequestException('payment_not_executed');

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
      return {
        rowId: row.id,
        payId: locked.paymentId,
        checkoutId: locked.checkoutId,
      };
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
        OR: [
          { patientId: patient.id },
          { payerEmail: patient.email.toLowerCase() },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { refunds: true },
    });
    return rows.map(toPaymentDto);
  }

  /**
   * Public, PII-free status for the return page.
   *
   * It gained `targetType`, `description` and `paidAt` with the checkout: a
   * person landing here has just been charged and needs to recognise the
   * purchase, and everything here is already printed on their card statement.
   * Still no payer, no card and no bank references — the `order` in the URL is
   * user-controllable and this answers on its strength alone.
   */
  async publicStatus(orderId: string): Promise<PublicPaymentStatusDto> {
    const p = await this.prisma.payment.findUnique({
      where: { orderId },
      select: { orderId: true, state: true, checkoutId: true },
    });
    if (!p) throw new NotFoundException('payment_not_found');

    // The redirect is user-controllable, so a return page hitting this while
    // the callback is still in flight must get the bank's answer, not ours.
    // A manual payment has no session to ask about.
    if (p.checkoutId && !TERMINAL.includes(p.state)) {
      await this.syncFromBank(p.checkoutId);
    }

    const fresh = await this.prisma.payment.findUniqueOrThrow({
      where: { orderId },
      select: {
        orderId: true,
        state: true,
        amount: true,
        currency: true,
        targetType: true,
        paidAt: true,
      },
    });

    return {
      orderId: fresh.orderId,
      state: fresh.state,
      amount: Number(fresh.amount),
      currency: fresh.currency,
      targetType: fresh.targetType,
      description: await this.describeTarget(fresh),
      paidAt: fresh.paidAt?.toISOString() ?? null,
    };
  }

  /* ---------------------------- internals ---------------------------- */

  /**
   * Write the payment, its late patient link and the mirror onto the purchase
   * as one unit. Before, a crash between the three left a paid payment whose
   * appointment still read `pending`, and no retry repaired it.
   */
  private async persist(id: string, data: Prisma.PaymentUpdateInput) {
    const isPaid = await this.prisma.$transaction(async (tx) => {
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
      } else {
        // The other direction, which nothing used to take: a refund moves a
        // payment out of `paid`, and before this the purchase went on reading
        // `confirmed` for money that had gone back. `recomputeTargetMirror`
        // reads the whole ledger rather than assuming, so a purchase paid
        // twice — once by hand, once by card — does not read as unpaid because
        // one of the two was refunded. It writes `paymentStatus` only: an
        // answered EXPRESS ticket keeps its answer and its status, and loses
        // just the claim that it was paid for.
        await this.recomputeTargetMirror(payment, tx);
      }
      return payment.state === PaymentState.paid;
    });

    // Outside the transaction: sending mail takes a network round-trip, and a
    // transaction held open across one holds the row lock for an SMTP server's
    // benefit. `deliverReceipt` is itself idempotent, so a redelivered callback
    // reaching this line again sends nothing.
    if (isPaid) await this.deliverReceipt(id);
  }

  /**
   * The payment confirmation maib's go-live checklist requires (§8).
   *
   * `confirmationSentAt` is stamped only when the message actually left. With
   * no SMTP configured nothing leaves, and the back office then shows the
   * payment as unconfirmed with a resend button — the same honesty the answer
   * and upload-link paths already practise (audit A3, F2). It is deliberately
   * not a throw: the money has arrived, the purchase is fulfilled, and failing
   * the callback over an email would make the bank retry a payment we have
   * already recorded.
   */
  private async deliverReceipt(id: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment || payment.confirmationSentAt) return;

    try {
      const { sent } = await this.notifications.paymentReceipt(
        {
          to: payment.payerEmail,
          locale: await this.localeForPayment(payment),
        },
        {
          clientName: payment.payerName ?? payment.payerEmail,
          orderId: payment.orderId,
          description: await this.describeTarget(payment),
          amount: Number(payment.amount),
          currency: payment.currency,
          paidAt: payment.paidAt ?? new Date(),
        },
      );
      if (sent) {
        await this.prisma.payment.update({
          where: { id },
          data: { confirmationSentAt: new Date() },
        });
      }
    } catch (e) {
      this.logger.error(
        `payment ${id} recorded, confirmation email failed: ${String(e)}`,
      );
    }
  }

  /**
   * Re-send the confirmation for a payment whose first attempt did not leave.
   * Clears the stamp first so a resend after a successful one is possible too —
   * the operator pressing this button has a reason we do not know.
   */
  async resendConfirmation(id: string, authorId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('payment_not_found');
    if (payment.state !== PaymentState.paid) {
      throw new BadRequestException('payment_not_paid');
    }

    await this.prisma.payment.update({
      where: { id },
      data: { confirmationSentAt: null },
    });
    await this.deliverReceipt(id);

    this.logger.log(
      `audit payment.resend-confirmation paymentId=${id} userId=${authorId}`,
    );
    return this.findOne(id);
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
   * The name and address on the purchase a manual payment is being recorded
   * against. Also proves the purchase exists before a `Payment` points at it.
   */
  private async payerForTarget(
    targetType: PaymentTargetType,
    targetId: string,
  ): Promise<{ name: string; email: string }> {
    const found = await this.loadPayer(targetType, targetId);
    if (!found) throw new NotFoundException('payment_target_not_found');
    return found;
  }

  private async loadPayer(
    targetType: PaymentTargetType,
    targetId: string,
  ): Promise<{ name: string; email: string } | null> {
    const select = { clientName: true, clientEmail: true } as const;
    const row =
      targetType === PaymentTargetType.appointment
        ? await this.prisma.appointment.findUnique({
            where: { id: targetId },
            select,
          })
        : targetType === PaymentTargetType.subscription
          ? await this.prisma.subscription.findUnique({
              where: { id: targetId },
              select,
            })
          : targetType === PaymentTargetType.quick_question
            ? await this.prisma.quickQuestion.findUnique({
                where: { id: targetId },
                select,
              })
            : targetType === PaymentTargetType.deliverable_order
              ? await this.prisma.deliverableOrder.findUnique({
                  where: { id: targetId },
                  select,
                })
              : // A paid material has no order row to read a payer off; the
                // checkout collects one, and there is nothing to record manually.
                null;
    return row ? { name: row.clientName, email: row.clientEmail } : null;
  }

  /**
   * Set the purchase's mirror from what the ledger now holds: confirmed if any
   * payment against it is `paid`, pending otherwise.
   *
   * Used when a payment stops being paid. `markTargetPaid` handles the other
   * direction and stays a one-way write, because that is the path the bank's
   * callback takes and it must stay cheap and idempotent.
   */
  private async recomputeTargetMirror(
    payment: { targetType: PaymentTargetType; targetId: string | null },
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const { targetType, targetId } = payment;
    if (!targetId) return;

    const recorded = await tx.payment.findMany({
      where: { targetType, targetId },
      select: { state: true },
    });
    const data = { paymentStatus: mirrorStatusFor(recorded) };

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
          break;
      }
    } catch (e) {
      // Same reasoning as markTargetPaid: the purchase can be gone, and the
      // payment record is the source of truth either way.
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        this.logger.warn(
          `voided ${targetType} ${targetId} no longer exists; payment cancelled anyway`,
        );
        return;
      }
      throw e;
    }
  }

  /**
   * Mirror the paid state onto the thing that was bought, so every screen that
   * already reads `paymentStatus` keeps working without knowing about Payment.
   *
   * An EXPRESS ticket does more than mirror: paying is what makes it exist for
   * the doctor. It moves out of `awaiting_payment` and its SLA clock starts
   * here, not at submission, because that is when the promise was bought.
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
          await this.activateTicket(targetId, tx);
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

  /**
   * Put a paid EXPRESS ticket in front of the doctor and start its clock.
   *
   * `updateMany` scoped to `awaiting_payment`, not `update`: maib may deliver
   * the same success notification more than once, and the reconcile sweep
   * writes the same transition from the other side. An unconditional write
   * would walk an already-answered ticket back to `open` and restart a deadline
   * that was already met. A ticket the condition does not match is a no-op,
   * which is also why a deleted one raises nothing here.
   *
   * The mirror is set in the same statement, so the two can never disagree.
   */
  private async activateTicket(
    ticketId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const ticket = await tx.quickQuestion.findUnique({
      where: { id: ticketId },
      select: { status: true },
    });
    if (!ticket) {
      this.logger.warn(
        `paid quick_question ${ticketId} no longer exists; payment recorded anyway`,
      );
      return;
    }

    const activation = activateTicketData(
      ticket.status,
      await this.workingHours.expressDueAt(),
    );

    await tx.quickQuestion.updateMany({
      // Scoped to the status we read, so a callback redelivered while the
      // doctor is answering cannot overwrite what she wrote.
      where: activation
        ? { id: ticketId, status: QuickQuestionStatus.awaiting_payment }
        : { id: ticketId },
      data: { paymentStatus: PaymentStatus.confirmed, ...activation },
    });
  }

  /** Which language to write the receipt in. */
  private async localeForPayment(payment: {
    targetType: PaymentTargetType;
    targetId: string | null;
  }): Promise<string | null> {
    if (
      payment.targetType !== PaymentTargetType.quick_question ||
      !payment.targetId
    ) {
      return null;
    }
    const ticket = await this.prisma.quickQuestion.findUnique({
      where: { id: payment.targetId },
      select: { locale: true },
    });
    return ticket?.locale ?? null;
  }

  /**
   * What the receipt calls the purchase. The bank's own `orderInfo.description`
   * is not stored, so this is reconstructed from the catalog — which is the
   * same source that priced it in the first place.
   */
  private async describeTarget(payment: {
    targetType: PaymentTargetType;
  }): Promise<string> {
    if (payment.targetType === PaymentTargetType.quick_question) {
      const service = await this.prisma.service.findUnique({
        where: { code: ServiceCode.quick_question },
        select: { titleRo: true },
      });
      return service?.titleRo ?? 'Întrebare EXPRESS';
    }
    return payment.targetType;
  }
}
