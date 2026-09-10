/**
 * Online payments taken through maib e-Commerce Checkout.
 *
 * Nothing here is editable. A payment is what the bank says happened, and the
 * only thing the back office can change about it is to send money back. Even
 * the amount is history: it is what was charged, not what the price list says
 * today.
 *
 * Shapes mirror `PaymentDto` in `packages/shared`. The states are spelled out
 * as a local union rather than reused from the shared enum for the same reason
 * every other feature does it — the view layer wants plain string literals.
 */

export type PaymentState =
  | 'created'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'abandoned'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PaymentTargetType =
  | 'appointment'
  | 'quick_question'
  | 'deliverable_order'
  | 'subscription'
  | 'material';

export type RefundState = 'created' | 'accepted' | 'failed';

export interface PaymentRefund {
  id: string;
  /** Null while the refund is reserved in our ledger but not yet acknowledged. */
  refundId: string | null;
  state: RefundState;
  amount: number;
  currency: string;
  /** `Full` | `Partial`, as the bank reports it. */
  kind: string | null;
  reason: string;
  executedAt: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  checkoutId: string;
  paymentId: string | null;
  /** Our own order reference, the one shown to the client and the bank. */
  orderId: string;
  state: PaymentState;
  amount: number;
  currency: string;
  refundedAmount: number;
  method: string | null;
  targetType: PaymentTargetType;
  targetId: string | null;
  payerName: string | null;
  payerEmail: string;
  payerPhone: string | null;
  /** Set only when a patient with the payer's email already exists. */
  patientId: string | null;
  rrn: string | null;
  approvalCode: string | null;
  cardMask: string | null;
  threeDsResult: string | null;
  terminalId: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  createdAt: string; // ISO
  refunds: PaymentRefund[];
}

/**
 * Tab filter over the ledger. Not a straight state list: `refunded` covers
 * partial refunds too, and `failed` gathers every way a checkout can end
 * without money — the doctor thinks in "did it work", not in nine states.
 */
export type PaymentStateFilter =
  | 'all'
  | 'paid'
  | 'pending'
  | 'refunded'
  | 'failed';
