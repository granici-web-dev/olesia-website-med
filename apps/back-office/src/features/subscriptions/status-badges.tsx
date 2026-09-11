import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type { SubscriptionStatus } from '@/features/subscriptions/types';
import { statusBadgeVariant } from '@/features/subscriptions/format';

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <Badge variant={statusBadgeVariant[status]}>
      {ro.subscriptions.status[status]}
    </Badge>
  );
}
