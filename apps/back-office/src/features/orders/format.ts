import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/components/ui/badge';
import type { OrderStatus } from '@/features/orders/types';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const statusBadgeVariant: Record<OrderStatus, BadgeVariant> = {
  // Muted on purpose: an unpaid order is not work waiting, it is a form
  // somebody abandoned. It should read as quieter than "Nouă", not louder.
  awaiting_payment: 'secondary',
  new: 'info',
  in_progress: 'warning',
  delivered: 'success',
  canceled: 'secondary',
};
