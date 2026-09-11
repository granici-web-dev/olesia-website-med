import { PaymentBadge } from '@/components/common/payment-badge';
import { ro } from '@/i18n/ro';
import type { Order } from '@/features/orders/types';

const t = ro.orders;

/**
 * Whether the money arrived, and — for an order that is not paid yet — what
 * that means.
 *
 * `paymentStatus` mirrors the payments ledger, so there is nothing to confirm
 * by hand here; what the column has to do instead is stop "Neachitată" from
 * reading as a problem. On an order the doctor is working on it is one: the
 * work is under way and the money is not in. On one that is still
 * `awaiting_payment` it is just the state of a form somebody has not finished,
 * and the row is a candidate for the purge rather than for a phone call.
 */
export function OrderPaymentCell({ order }: { order: Order }) {
  return (
    <div className="space-y-1">
      <PaymentBadge status={order.paymentStatus} />
      {order.status === 'awaiting_payment' && (
        <p className="text-xs text-muted-foreground">
          {t.payment.abandonedHint}
        </p>
      )}
    </div>
  );
}
