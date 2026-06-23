import type { PaymentStatusValue } from '@/components/common/payment-status-menu';
import { setPaymentStatus as setAppointmentPayment } from '@/features/appointments/data';
import { setPaymentStatus as setSubscriptionPayment } from '@/features/subscriptions/data';
import { setPaymentStatus as setTicketPayment } from '@/features/quick-questions/data';

/** The three payment-bearing record kinds a patient interaction can point to. */
export type PaymentSource = 'appointment' | 'subscription' | 'quick_question';

/**
 * Set the payment status on whichever record a patient interaction references.
 * Routes to the matching module endpoint by `source`; returns nothing because
 * callers only need to invalidate their own list afterwards.
 */
export async function setPaymentBySource(
  source: PaymentSource,
  id: string,
  status: PaymentStatusValue,
): Promise<void> {
  if (source === 'appointment') {
    await setAppointmentPayment(id, status);
  } else if (source === 'subscription') {
    await setSubscriptionPayment(id, status);
  } else {
    await setTicketPayment(id, status);
  }
}
