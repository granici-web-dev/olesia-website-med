import type { ContactMessageDto, Paginated } from '@olesia/shared';

import { http } from '@/api/http';
import type { Message } from '@/features/messages/types';

/**
 * Real `contact-messages` endpoints — the back-office inbox for the public
 * Contact form. Messages are created by the public `/leads/contact` endpoint;
 * here we list them, mark them read, and delete them.
 */

const KNOWN_SUBJECTS: readonly Message['subject'][] = [
  'appointment',
  'payment',
  'how_it_works',
  'other',
];

function toView(d: ContactMessageDto): Message {
  return {
    id: d.id,
    name: d.name,
    email: d.email,
    // `Re: ${subjects[subject]}` goes into a mailto the doctor sends, and a
    // subject this build does not know would put `Re: undefined` in front of
    // the person who wrote in.
    subject: KNOWN_SUBJECTS.includes(d.subject as Message['subject'])
      ? (d.subject as Message['subject'])
      : 'other',
    message: d.message,
    status: d.status as Message['status'],
    readAt: d.readAt,
    reply: d.reply,
    repliedAt: d.repliedAt,
    createdAt: d.createdAt,
  };
}

function asList<T>(r: T[] | Paginated<T>): T[] {
  return Array.isArray(r) ? r : r.items;
}

export async function fetchMessages(): Promise<Message[]> {
  const r = await http.get<ContactMessageDto[] | Paginated<ContactMessageDto>>(
    '/contact-messages?pageSize=200',
  );
  return asList(r).map(toView);
}

export async function markRead(id: string): Promise<Message> {
  return toView(
    await http.patch<ContactMessageDto>(`/contact-messages/${id}`, {
      status: 'read',
    }),
  );
}

export async function deleteMessage(id: string): Promise<void> {
  await http.del<void>(`/contact-messages/${id}`);
}
