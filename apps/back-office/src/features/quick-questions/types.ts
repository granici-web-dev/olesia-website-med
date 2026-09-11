/**
 * Quick-question tickets — the "Întrebare EXPRESS" service (05, group B):
 * a written answer within ~1 working hour.
 *
 * The deadline is `dueAt`, computed by the API from the practice schedule at
 * the moment the question was **paid for** — it is NOT derivable from
 * `createdAt` here, because the clock only runs during working hours and only
 * starts once the money has arrived. This UI
 * displays what the server decided; it never recomputes it.
 * The wire shapes are the DTOs in `@olesia/shared`; `api.ts` maps them into
 * the view types below. That layer is deliberate, not a placeholder — it is
 * where a shared enum gets narrowed to what this UI actually renders.
 */

export type TicketStatus = 'awaiting_payment' | 'open' | 'answered';
export type PaymentStatus = 'pending' | 'confirmed';

/**
 * Derived bucket: an open ticket past its deadline is `overdue`.
 *
 * `unpaid` is not derived from a date — it is the ticket's own status. An
 * EXPRESS question is written before it is paid for and is invisible to the
 * doctor until the money lands, so it has no deadline to be late against
 * (docs/shape-express-checkout.md).
 */
export type TicketBucket = 'unpaid' | 'open' | 'overdue' | 'answered';

export interface Ticket {
  id: string;
  clientName: string;
  clientEmail: string;
  /** Lead contact phone (public intake; absent for older records). */
  phone?: string | null;
  question: string;
  status: TicketStatus;
  answer: string | null;
  answeredAt: string | null;
  paymentStatus: PaymentStatus;
  /**
   * Server-computed SLA deadline, in working hours. ISO. Null while the ticket
   * is unpaid: the clock starts at payment, so an unpaid question is owed
   * nothing yet and must not count as overdue.
   */
  dueAt: string | null;
  createdAt: string; // ISO
}

export type StatusFilter = 'all' | TicketBucket;

/**
 * The result of answering: the ticket, plus whether the answer actually
 * reached the patient. Saving and sending are two things, and with no SMTP
 * only the first happens — the UI has to say which (audit A3, F2).
 */
export interface AnsweredTicket {
  ticket: Ticket;
  emailSent: boolean;
}
