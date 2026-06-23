import type {
  Message,
  MessageStatus,
  StatusFilter,
} from '@/features/messages/types';
import type { badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

/* ----------------------------- presentation ----------------------------- */

export const statusBadgeVariant: Record<MessageStatus, BadgeVariant> = {
  new: 'info',
  read: 'secondary',
  replied: 'success',
};

/** Tab bucket: `new` is unread; `read` and `replied` are both "seen". */
export function bucketOf(message: Message): Exclude<StatusFilter, 'all'> {
  return message.status === 'new' ? 'new' : 'read';
}

const dateTimeFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

/* ------------------------------- mock data ------------------------------ */
/* Used only when `VITE_API_MOCKS !== 'false'`; the real API is in `api.ts`. */

const HOUR = 60 * 60 * 1000;

let store: Message[] = [
  {
    id: 'm1',
    name: 'Andreea Munteanu',
    email: 'andreea.m@example.com',
    subject: 'appointment',
    message:
      'Bună ziua! Aș dori să programez o consultație pediatrică pentru fiica mea de 4 ani. Care sunt pașii? Mulțumesc!',
    status: 'new',
    readAt: null,
    reply: null,
    repliedAt: null,
    createdAt: new Date(Date.now() - 2 * HOUR).toISOString(),
  },
  {
    id: 'm2',
    name: 'Mihai Popescu',
    email: 'mihai.popescu@example.com',
    subject: 'payment',
    message:
      'Am efectuat plata pentru abonamentul de monitorizare, dar nu am primit confirmarea. Puteți verifica?',
    status: 'new',
    readAt: null,
    reply: null,
    repliedAt: null,
    createdAt: new Date(Date.now() - 6 * HOUR).toISOString(),
  },
  {
    id: 'm3',
    name: 'Elena Rusu',
    email: 'elena.rusu@example.com',
    subject: 'how_it_works',
    message:
      'Cum funcționează consultațiile video? Este nevoie de o aplicație specială sau primesc un link?',
    status: 'read',
    readAt: new Date(Date.now() - 20 * HOUR).toISOString(),
    reply: null,
    repliedAt: null,
    createdAt: new Date(Date.now() - 26 * HOUR).toISOString(),
  },
];

function clone(m: Message): Message {
  return { ...m };
}

export async function fetchMessages(): Promise<Message[]> {
  return store.map(clone);
}

export async function markRead(id: string): Promise<Message> {
  store = store.map((m) =>
    m.id === id && m.status === 'new'
      ? { ...m, status: 'read', readAt: new Date().toISOString() }
      : m,
  );
  const found = store.find((m) => m.id === id);
  if (!found) throw new Error('not_found');
  return clone(found);
}

export async function deleteMessage(id: string): Promise<void> {
  store = store.filter((m) => m.id !== id);
}
