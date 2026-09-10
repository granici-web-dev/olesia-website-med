import { PaymentBadge } from '@/features/subscriptions/status-badges';
import type { Subscription } from '@/features/subscriptions/types';

/**
 * Payment state for the subscriptions table. Read-only — see
 * `AppointmentPaymentCell` for why.
 */
export function SubscriptionPaymentCell({
  subscription,
}: {
  subscription: Subscription;
}) {
  return <PaymentBadge status={subscription.paymentStatus} />;
}
