import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import {
  PaymentStatusMenu,
  type PaymentStatusValue,
} from '@/components/common/payment-status-menu';
import { setPaymentStatus } from '@/features/appointments/data';
import { appointmentsQueryKey } from '@/features/appointments/query-key';
import { dashboardQueryKey } from '@/features/dashboard/query-key';
import { ro } from '@/i18n/ro';

/**
 * Inline payment switcher for the dashboard "upcoming appointments" list. Each
 * row is an appointment; changing it also refreshes the dashboard so the
 * "pending payments" metric stays in sync. Free consultations carry no payment,
 * so they show a static "Gratuit" tag instead.
 */
export function UpcomingPaymentCell({
  id,
  status,
  serviceCode,
}: {
  id: string;
  status: PaymentStatusValue;
  serviceCode: string;
}) {
  const queryClient = useQueryClient();
  const t = ro.payment;

  const mutation = useMutation({
    mutationFn: (next: PaymentStatusValue) => setPaymentStatus(id, next),
    onSuccess: (_data, next) => {
      toast.success(
        next === 'confirmed' ? t.confirmedToast : t.revertedToast,
      );
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKey });
    },
    onError: () => toast.error(t.error),
  });

  if (serviceCode === 'free_consult') {
    return <Badge variant="secondary">{t.free}</Badge>;
  }

  return (
    <PaymentStatusMenu
      status={status}
      pending={mutation.isPending}
      onChange={(s) => mutation.mutate(s)}
      align="end"
    />
  );
}
