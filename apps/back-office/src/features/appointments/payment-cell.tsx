import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import {
  PaymentStatusMenu,
  type PaymentStatusValue,
} from '@/components/common/payment-status-menu';
import { setPaymentStatus, isFreeAppointment } from '@/features/appointments/data';
import { appointmentsQueryKey } from '@/features/appointments/query-key';
import { ro } from '@/i18n/ro';
import type { Appointment } from '@/features/appointments/types';

/** Inline payment switcher for the appointments table. */
export function AppointmentPaymentCell({ appointment }: { appointment: Appointment }) {
  const queryClient = useQueryClient();
  const t = ro.appointments.toast;

  const mutation = useMutation({
    mutationFn: (status: PaymentStatusValue) =>
      setPaymentStatus(appointment.id, status),
    onSuccess: (_data, status) => {
      toast.success(
        status === 'confirmed' ? t.paymentConfirmed : t.paymentReverted,
      );
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKey });
    },
    onError: () => toast.error(t.error),
  });

  // Free consultations carry no payment — show a static "Gratuit" tag.
  if (isFreeAppointment(appointment)) {
    return <Badge variant="secondary">{ro.payment.free}</Badge>;
  }

  return (
    <PaymentStatusMenu
      status={appointment.paymentStatus}
      pending={mutation.isPending}
      onChange={(s) => mutation.mutate(s)}
    />
  );
}
