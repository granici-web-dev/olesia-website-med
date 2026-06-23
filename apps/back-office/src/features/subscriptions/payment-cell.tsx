import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  PaymentStatusMenu,
  type PaymentStatusValue,
} from '@/components/common/payment-status-menu';
import { setPaymentStatus } from '@/features/subscriptions/data';
import { subscriptionsQueryKey } from '@/features/subscriptions/query-key';
import { ro } from '@/i18n/ro';
import type { Subscription } from '@/features/subscriptions/types';

/** Inline payment switcher for the subscriptions table. */
export function SubscriptionPaymentCell({
  subscription,
}: {
  subscription: Subscription;
}) {
  const queryClient = useQueryClient();
  const t = ro.subscriptions.toast;

  const mutation = useMutation({
    mutationFn: (status: PaymentStatusValue) =>
      setPaymentStatus(subscription.id, status),
    onSuccess: (_data, status) => {
      toast.success(
        status === 'confirmed' ? t.paymentConfirmed : t.paymentReverted,
      );
      queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey });
    },
    onError: () => toast.error(t.error),
  });

  return (
    <PaymentStatusMenu
      status={subscription.paymentStatus}
      pending={mutation.isPending}
      onChange={(s) => mutation.mutate(s)}
    />
  );
}
