import {
  Ban,
  Check,
  CircleDot,
  Clock,
  Loader,
  PackageCheck,
  Wallet,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type { OrderPayment, OrderStatus } from '@/features/orders/types';
import {
  statusBadgeVariant,
  paymentBadgeVariant,
} from '@/features/orders/data';

const STATUS_ICON = {
  awaiting_payment: Wallet,
  new: CircleDot,
  in_progress: Loader,
  delivered: PackageCheck,
  canceled: Ban,
} as const;

const PAYMENT_ICON = {
  pending: Clock,
  confirmed: Check,
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

export function PaymentBadge({ payment }: { payment: OrderPayment }) {
  const Icon = PAYMENT_ICON[payment];
  return (
    <Badge variant={paymentBadgeVariant[payment]}>
      <Icon />
      {ro.orders.payment[payment]}
    </Badge>
  );
}
