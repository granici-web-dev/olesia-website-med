import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/components/ui/badge';
import type {
  PaymentStatus,
  Subscription,
  SubscriptionStatus,
} from '@/features/subscriptions/types';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const statusBadgeVariant: Record<SubscriptionStatus, BadgeVariant> = {
  active: 'success',
  expired: 'muted',
  canceled: 'destructive',
};

export const paymentBadgeVariant: Record<PaymentStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
};

const DAY = 86_400_000;

/** Whole days from today until `endIso` (negative once past). */
export function daysRemaining(endIso: string): number {
  const end = new Date(endIso);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end.getTime() - Date.now()) / DAY);
}

export function quotaRemaining(s: Subscription): number {
  return Math.max(0, s.videoQuotaTotal - s.videoQuotaUsed);
}
