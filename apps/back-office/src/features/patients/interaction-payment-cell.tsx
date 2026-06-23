import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  PaymentStatusMenu,
  type PaymentStatusValue,
} from '@/components/common/payment-status-menu';
import { setPaymentBySource } from '@/features/payments/set-payment-by-source';
import { patientTimelineQueryKey } from '@/features/patients/query-key';
import { ro } from '@/i18n/ro';
import type { PatientInteractionDto } from '@/features/patients/types';

/**
 * Inline payment switcher for a patient's linked interactions. The record may
 * be an appointment, subscription or quick-question, so the change is routed by
 * `interaction.source`; the patient timeline is refreshed afterwards.
 */
export function InteractionPaymentCell({
  interaction,
  patientId,
}: {
  interaction: PatientInteractionDto;
  patientId: string;
}) {
  const queryClient = useQueryClient();
  const t = ro.payment;

  const mutation = useMutation({
    mutationFn: (status: PaymentStatusValue) =>
      setPaymentBySource(interaction.source, interaction.sourceId, status),
    onSuccess: (_data, status) => {
      toast.success(
        status === 'confirmed' ? t.confirmedToast : t.revertedToast,
      );
      queryClient.invalidateQueries({
        queryKey: patientTimelineQueryKey(patientId),
      });
    },
    onError: () => toast.error(t.error),
  });

  return (
    <PaymentStatusMenu
      status={interaction.paymentStatus as PaymentStatusValue}
      pending={mutation.isPending}
      onChange={(s) => mutation.mutate(s)}
      align="end"
    />
  );
}
