import { CheckCircle2, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type {
  SubscriptionStatus,
  PaymentStatus,
} from '@/features/subscriptions/types';
import {
  statusBadgeVariant,
  paymentBadgeVariant,
} from '@/features/subscriptions/data';

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <Badge variant={statusBadgeVariant[status]}>
      {ro.subscriptions.status[status]}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const Icon = status === 'confirmed' ? CheckCircle2 : Clock;
  return (
    <Badge variant={paymentBadgeVariant[status]}>
      <Icon />
      {ro.subscriptions.payment[status]}
    </Badge>
  );
}
