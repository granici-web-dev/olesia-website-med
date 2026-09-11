import { PaymentBadge } from '@/features/quick-questions/status-badges';
import type { Ticket } from '@/features/quick-questions/types';

/**
 * Payment state for the quick-questions table. Read-only — see
 * `AppointmentPaymentCell` for why.
 */
export function TicketPaymentCell({ ticket }: { ticket: Ticket }) {
  return <PaymentBadge status={ticket.paymentStatus} />;
}
