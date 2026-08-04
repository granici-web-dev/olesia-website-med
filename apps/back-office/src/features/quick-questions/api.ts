import type { Paginated, QuickQuestionDto } from '@olesia/shared';

import { http } from '@/api/http';
import type { Ticket } from '@/features/quick-questions/types';

/**
 * Real `quick-questions` endpoints (module_calendly.md §3.2.5) — 48h SLA
 * tickets (service 05). The DTO carries attachments as plain URLs and a
 * `closed` status the UI folds into `answered`.
 */

function fileName(url: string): string {
  return url.split('/').pop() || url;
}

function toView(d: QuickQuestionDto): Ticket {
  return {
    id: d.id,
    clientName: d.clientName,
    clientEmail: d.clientEmail,
    phone: d.phone,
    question: d.question,
    attachments: d.attachments.map((url, i) => ({
      id: `${d.id}-${i}`,
      name: fileName(url),
      sizeKb: 0,
    })),
    // The UI has no "closed" bucket; a closed ticket has an answer → "answered".
    status: d.status === 'open' ? 'open' : 'answered',
    answer: d.answer,
    answeredAt: d.answeredAt,
    paymentStatus: d.paymentStatus as Ticket['paymentStatus'],
    dueAt: d.dueAt,
    createdAt: d.createdAt,
  };
}

function asList<T>(r: T[] | Paginated<T>): T[] {
  return Array.isArray(r) ? r : r.items;
}

export async function fetchTickets(): Promise<Ticket[]> {
  const r = await http.get<QuickQuestionDto[] | Paginated<QuickQuestionDto>>(
    '/quick-questions?pageSize=200',
  );
  return asList(r).map(toView);
}

export async function answerTicket(
  id: string,
  answer: string,
): Promise<Ticket> {
  return toView(
    await http.post<QuickQuestionDto>(`/quick-questions/${id}/answer`, {
      answer,
    }),
  );
}

/** Manually set the payment status (both directions — payment is offline). */
export async function setPaymentStatus(
  id: string,
  paymentStatus: Ticket['paymentStatus'],
): Promise<Ticket> {
  return toView(
    await http.patch<QuickQuestionDto>(`/quick-questions/${id}`, {
      paymentStatus,
    }),
  );
}
