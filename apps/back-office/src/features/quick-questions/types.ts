/**
 * Quick-question tickets — the "Întrebare EXPRESS" service (05, group B):
 * a written answer within ~1 working hour, with optional attachments.
 *
 * The deadline is `dueAt`, computed by the API from the practice schedule at
 * the moment the question arrived (§11.5) — it is NOT derivable from
 * `createdAt` here, because the clock only runs during working hours. This UI
 * displays what the server decided; it never recomputes it.
 * TODO(shared): move to `packages/shared` once it exists.
 */

export type TicketStatus = 'open' | 'answered';
export type PaymentStatus = 'pending' | 'confirmed';

/** Derived bucket: an open ticket past its deadline is `overdue`. */
export type TicketBucket = 'open' | 'overdue' | 'answered';

export interface Attachment {
  id: string;
  name: string;
  sizeKb: number;
}

export interface Ticket {
  id: string;
  clientName: string;
  clientEmail: string;
  /** Lead contact phone (public intake; absent for older records). */
  phone?: string | null;
  question: string;
  attachments: Attachment[];
  status: TicketStatus;
  answer: string | null;
  answeredAt: string | null;
  paymentStatus: PaymentStatus;
  /** Server-computed SLA deadline, in working hours. ISO. */
  dueAt: string;
  createdAt: string; // ISO
}

export type StatusFilter = 'all' | TicketBucket;
