/**
 * Quick-question tickets — the "Întrebare EXPRESS" service (05, group B):
 * a written answer within 48h, with optional attachments.
 *
 * The spec (module_calendly.md §3.2.5, §11, §15) requires: ticket list, 48h
 * deadline / SLA, an answer, and manual payment confirmation. No explicit model
 * is given, so this is the inferred shape.
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
  createdAt: string; // ISO
}

export type StatusFilter = 'all' | TicketBucket;
