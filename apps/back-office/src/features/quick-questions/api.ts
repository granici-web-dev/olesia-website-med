import type {
  AnsweredQuickQuestionDto,
  Paginated,
  QuickQuestionDto,
} from '@olesia/shared';

import { http } from '@/api/http';
import type {
  AnsweredTicket,
  Ticket,
} from '@/features/quick-questions/types';

/**
 * Real `quick-questions` endpoints (module_calendly.md §3.2.5) — the SLA
 * tickets (service 05). The DTO carries a `closed` status the UI folds into
 * `answered`.
 */

function toView(d: QuickQuestionDto): Ticket {
  return {
    id: d.id,
    clientName: d.clientName,
    clientEmail: d.clientEmail,
    phone: d.phone,
    question: d.question,
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
): Promise<AnsweredTicket> {
  const d = await http.post<AnsweredQuickQuestionDto>(
    `/quick-questions/${id}/answer`,
    { answer },
  );
  return { ticket: toView(d), emailSent: d.emailSent };
}
