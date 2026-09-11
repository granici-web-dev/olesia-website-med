import { PaymentBadge } from '@/components/common/payment-badge';
import { Badge } from '@/components/ui/badge';
import { isFreeService } from '@/features/appointments/format';
import { ro } from '@/i18n/ro';
import type { Appointment } from '@/features/appointments/types';

/**
 * Payment state for the appointments table. Read-only: `paymentStatus` mirrors
 * the payments ledger, and a payment that arrived outside the bank is recorded
 * in the detail sheet, where it gets a sum, a date and a note. The switcher
 * that used to live here wrote the mirror and recorded none of that.
 */
export function AppointmentPaymentCell({
  appointment,
}: {
  appointment: Appointment;
}) {
  // Free consultations carry no payment — show a static "Gratuit" tag.
  if (isFreeService(appointment.service)) {
    return <Badge variant="secondary">{ro.payment.free}</Badge>;
  }
  return <PaymentBadge status={appointment.paymentStatus} />;
}
