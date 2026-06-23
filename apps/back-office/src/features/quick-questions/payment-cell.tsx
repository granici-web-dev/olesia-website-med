import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  PaymentStatusMenu,
  type PaymentStatusValue,
} from '@/components/common/payment-status-menu';
import { setPaymentStatus } from '@/features/quick-questions/data';
import { ticketsQueryKey } from '@/features/quick-questions/query-key';
import { ro } from '@/i18n/ro';
import type { Ticket } from '@/features/quick-questions/types';

/** Inline payment switcher for the quick-questions table. */
export function TicketPaymentCell({ ticket }: { ticket: Ticket }) {
  const queryClient = useQueryClient();
  const t = ro.quickQuestions.toast;

  const mutation = useMutation({
    mutationFn: (status: PaymentStatusValue) =>
      setPaymentStatus(ticket.id, status),
    onSuccess: (_data, status) => {
      toast.success(
        status === 'confirmed' ? t.paymentConfirmed : t.paymentReverted,
      );
      queryClient.invalidateQueries({ queryKey: ticketsQueryKey });
    },
    onError: () => toast.error(t.error),
  });

  return (
    <PaymentStatusMenu
      status={ticket.paymentStatus}
      pending={mutation.isPending}
      onChange={(s) => mutation.mutate(s)}
    />
  );
}
