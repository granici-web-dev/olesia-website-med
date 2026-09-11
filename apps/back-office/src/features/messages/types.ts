/**
 * Contact-form messages — the public Contact page ("Mesaje" in the back office).
 * Non-medical questions only (medical ones go through "Întrebare EXPRESS"), so
 * the record carries no clinical data. `reply`/`repliedAt` are reserved for the
 * email-reply step that lands once SMTP is configured.
 *
 * Shapes mirror `ContactMessageDto` in `packages/shared`.
 */

export type MessageStatus = 'new' | 'read' | 'replied';
export type MessageSubject =
  | 'appointment'
  | 'payment'
  | 'how_it_works'
  | 'other';

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: MessageSubject;
  message: string;
  status: MessageStatus;
  readAt: string | null;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string; // ISO
}

/** Tab filter. A `new` message is unread; everything else is `read`. */
export type StatusFilter = 'all' | 'new' | 'read';
