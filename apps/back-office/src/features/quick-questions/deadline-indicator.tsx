import { AlarmClock, CheckCircle2, Timer } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';
import type { Ticket } from '@/features/quick-questions/types';
import {
  bucketOf,
  remainingMs,
  slaMet,
  formatDuration,
  formatDateTime,
} from '@/features/quick-questions/data';

const d = ro.quickQuestions.deadline;
const URGENT_MS = 6 * 60 * 60 * 1000;

/** Live SLA indicator: time left, overdue, or answered + SLA outcome. */
export function DeadlineIndicator({
  ticket,
  className,
}: {
  ticket: Ticket;
  className?: string;
}) {
  const bucket = bucketOf(ticket);

  if (bucket === 'answered') {
    const met = slaMet(ticket);
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs',
          met ? 'text-muted-foreground' : 'text-warning-foreground',
          className,
        )}
      >
        <CheckCircle2 className="size-3.5" />
        {ticket.answeredAt && formatDateTime(ticket.answeredAt)}
        <span className="text-muted-foreground/70">
          · {met ? d.withinSla : d.lateSla}
        </span>
      </span>
    );
  }

  const rem = remainingMs(ticket);

  // No deadline means none is owed yet: the ticket is unpaid, and the clock
  // starts when the money lands. Showing "0 minutes left" would be a promise.
  if (rem === null) return null;

  if (bucket === 'overdue') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium text-destructive',
          className,
        )}
      >
        <AlarmClock className="size-3.5" />
        {d.overdueBy} {formatDuration(rem)}
      </span>
    );
  }

  const urgent = rem < URGENT_MS;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs',
        urgent
          ? 'font-medium text-warning-foreground'
          : 'text-muted-foreground',
        className,
      )}
    >
      <Timer className="size-3.5" />
      {formatDuration(rem)} {d.left}
    </span>
  );
}
