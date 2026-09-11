import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/components/ui/badge';
import type {
  PaymentStatus,
  Ticket,
  TicketBucket,
} from '@/features/quick-questions/types';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const bucketBadgeVariant: Record<TicketBucket, BadgeVariant> = {
  unpaid: 'warning',
  open: 'info',
  overdue: 'destructive',
  answered: 'success',
};

export const paymentBadgeVariant: Record<PaymentStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
};

/**
 * The deadline is whatever the API computed at intake — working hours, not
 * `createdAt + N`. Recomputing it here used to disagree with the server the
 * moment the SLA changed, and would now be wrong for every question that
 * arrives outside opening hours.
 */
export function deadlineMs(ticket: Ticket): number | null {
  return ticket.dueAt ? new Date(ticket.dueAt).getTime() : null;
}

export function remainingMs(ticket: Ticket): number | null {
  const deadline = deadlineMs(ticket);
  return deadline === null ? null : deadline - Date.now();
}

export function bucketOf(ticket: Ticket): TicketBucket {
  if (ticket.status === 'awaiting_payment') return 'unpaid';
  if (ticket.status === 'answered') return 'answered';
  const remaining = remainingMs(ticket);
  return remaining !== null && remaining < 0 ? 'overdue' : 'open';
}

/** Whether an answered ticket beat its deadline. */
export function slaMet(ticket: Ticket): boolean {
  const deadline = deadlineMs(ticket);
  return (
    ticket.status === 'answered' &&
    ticket.answeredAt !== null &&
    deadline !== null &&
    new Date(ticket.answeredAt).getTime() <= deadline
  );
}

/** Compact duration like "1 z 4 h", "7 h 20 m" or "12 m". */
export function formatDuration(ms: number): string {
  const totalMin = Math.floor(Math.abs(ms) / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const min = totalMin % 60;
  if (d > 0) return `${d} z ${h} h`;
  if (h > 0) return `${h} h ${min} m`;
  return `${min} m`;
}
