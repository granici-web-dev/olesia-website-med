import type {
  AnsweredQuickQuestionDto,
  Paginated,
  QuickQuestionDto,
} from '@olesia/shared';

import { http } from '@/api/http';
import type { AnsweredTicket, Ticket } from '@/features/quick-questions/types';

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
    status:
      d.status === 'awaiting_payment' || d.status === 'open'
        ? d.status
        : 'answered',
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

/**
 * Both lists, deliberately.
 *
 * `GET /quick-questions` leaves out `awaiting_payment` by default, so the
 * doctor's working queue is not padded with questions nobody bought. The panel
 * still has to show them — that is what the "Neachitate" tab is — so it asks
 * for them by name and merges the two, newest first.
 *
 * Two requests rather than one because the API's default is the right default
 * for every other caller, and a `status=all` escape hatch would be a way to
 * undo it by accident.
 */
export async function fetchTickets(): Promise<Ticket[]> {
  type Response = QuickQuestionDto[] | Paginated<QuickQuestionDto>;
  const [working, unpaid] = await Promise.all([
    http.get<Response>('/quick-questions?pageSize=200'),
    http.get<Response>('/quick-questions?pageSize=200&status=awaiting_payment'),
  ]);
  // The two answers are not one snapshot. A payment landing between them puts
  // the same question in both lists, and the doctor sees the row twice, once
  // as unpaid. The copy that is no longer awaiting payment is the later truth.
  const byId = new Map<string, QuickQuestionDto>();
  for (const row of [...asList(working), ...asList(unpaid)]) {
    const seen = byId.get(row.id);
    if (!seen || seen.status === 'awaiting_payment') byId.set(row.id, row);
  }
  return [...byId.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toView);
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
