import { Badge } from '@/components/ui/badge';
import { PaymentBadge } from '@/features/appointments/status-badges';
import { ro } from '@/i18n/ro';
import type { PaymentStatus } from '@/features/appointments/types';

/**
 * Payment state for the dashboard's "upcoming appointments" list. Read-only,
 * like the appointments table: the payment itself is recorded on the
 * appointment, not from a summary card.
 */
export function UpcomingPaymentCell({
  status,
  serviceCode,
}: {
  status: PaymentStatus;
  serviceCode: string;
}) {
  if (serviceCode === 'free_consult') {
    return <Badge variant="secondary">{ro.payment.free}</Badge>;
  }
  return <PaymentBadge status={status} />;
}
