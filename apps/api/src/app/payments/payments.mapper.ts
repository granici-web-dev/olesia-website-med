import type { PaymentDto, PaymentRefundDto } from '@olesia/shared';
import type { Payment, PaymentRefund } from '../../generated/prisma/client';

/** Prisma `Decimal` (or a raw string) to a plain number for the wire. */
const num = (v: unknown): number => Number(v ?? 0);

export function toPaymentRefundDto(r: PaymentRefund): PaymentRefundDto {
  return {
    id: r.id,
    refundId: r.refundId,
    state: r.state as PaymentRefundDto['state'],
    amount: num(r.amount),
    currency: r.currency,
    kind: r.kind,
    reason: r.reason,
    executedAt: r.executedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

/**
 * Shape a payment for the back office. `rawCallback` is dropped on purpose —
 * it is the verbatim bank payload kept for disputes, full of payer PII, and
 * nothing in the UI reads it.
 */
export function toPaymentDto(
  p: Payment & { refunds?: PaymentRefund[] },
): PaymentDto {
  return {
    id: p.id,
    checkoutId: p.checkoutId,
    paymentId: p.paymentId,
    orderId: p.orderId,
    state: p.state as PaymentDto['state'],
    amount: num(p.amount),
    currency: p.currency,
    refundedAmount: num(p.refundedAmount),
    method: p.method,
    targetType: p.targetType as PaymentDto['targetType'],
    targetId: p.targetId,
    payerName: p.payerName,
    payerEmail: p.payerEmail,
    payerPhone: p.payerPhone,
    patientId: p.patientId,
    rrn: p.rrn,
    approvalCode: p.approvalCode,
    cardMask: p.cardMask,
    threeDsResult: p.threeDsResult,
    terminalId: p.terminalId,
    expiresAt: p.expiresAt?.toISOString() ?? null,
    paidAt: p.paidAt?.toISOString() ?? null,
    failedAt: p.failedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    refunds: (p.refunds ?? []).map(toPaymentRefundDto),
  };
}
