import { Ban, CircleDot, Loader, PackageCheck, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type { OrderStatus } from '@/features/orders/types';
import { statusBadgeVariant } from '@/features/orders/format';

const STATUS_ICON = {
  awaiting_payment: Wallet,
  new: CircleDot,
  in_progress: Loader,
  delivered: PackageCheck,
  canceled: Ban,
} as const;

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge variant={statusBadgeVariant[status]}>
      <Icon />
      {ro.orders.status[status]}
    </Badge>
  );
}
