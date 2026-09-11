import { PaymentBadge } from '@/components/common/payment-badge';
import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import { isFreeService } from '@/features/appointments/format';
import type { PaymentStatus } from '@/types';

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
  if (isFreeService(serviceCode)) {
    return <Badge variant="secondary">{ro.payment.free}</Badge>;
  }
  return <PaymentBadge status={status} />;
}
