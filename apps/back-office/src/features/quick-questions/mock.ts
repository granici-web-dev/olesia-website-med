import type {
  Ticket,
  TicketBucket,
  PaymentStatus,
} from '@/features/quick-questions/types';
import type { badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const SLA_MS = 48 * 60 * 60 * 1000;

export const bucketBadgeVariant: Record<TicketBucket, BadgeVariant> = {
  open: 'info',
  overdue: 'destructive',
  answered: 'success',
};

export const paymentBadgeVariant: Record<PaymentStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
};

export function deadlineMs(ticket: Ticket): number {
  return new Date(ticket.createdAt).getTime() + SLA_MS;
}

export function remainingMs(ticket: Ticket): number {
  return deadlineMs(ticket) - Date.now();
}

export function bucketOf(ticket: Ticket): TicketBucket {
  if (ticket.status === 'answered') return 'answered';
  return remainingMs(ticket) < 0 ? 'overdue' : 'open';
}

/** Whether an answered ticket beat its 48h deadline. */
export function slaMet(ticket: Ticket): boolean {
  return (
    ticket.status === 'answered' &&
    ticket.answeredAt !== null &&
    new Date(ticket.answeredAt).getTime() <= deadlineMs(ticket)
  );
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

/** Compact duration like "1 z 4 h", "7 h 20 m" or "12 m". */
export function formatDuration(ms: number): string {
  const totalMin = Math.floor(Math.abs(ms) / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const min = totalMin % 60;
  if (d > 0) return `${d} z ${h} h`;
  if (h > 0) return `${h} h ${min} m`;
  return `${min} m`;
}

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory store shaped like the eventual REST API.
 * Timestamps are relative to load time so the 48h countdowns stay live.
 * TODO(api): replace with HTTP calls to /quick-questions (list + answer +
 * manual payment confirmation). PII/attachments are GDPR-sensitive (§15).
 * ------------------------------------------------------------------ */

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const afterCreate = (createdAt: string, h: number) =>
  new Date(new Date(createdAt).getTime() + h * 60 * 60 * 1000).toISOString();

const created1 = hoursAgo(8);
const created2 = hoursAgo(42);
const created3 = hoursAgo(55);
const created4 = hoursAgo(80);
const created5 = hoursAgo(100);
const created6 = hoursAgo(2);
const created7 = hoursAgo(50);

let store: Ticket[] = [
  {
    id: 'qq1',
    clientName: 'Alina Crețu',
    clientEmail: 'alina.cretu@gmail.com',
    question:
      'Bună ziua! Bebelușul meu de 7 luni refuză legumele la diversificare. Cum putem proceda fără să forțăm, dar fără să renunțăm?',
    attachments: [{ id: 'f1', name: 'jurnal-alimentar.pdf', sizeKb: 240 }],
    status: 'open',
    answer: null,
    answeredAt: null,
    paymentStatus: 'pending',
    createdAt: created1,
  },
  {
    id: 'qq2',
    clientName: 'Bogdan Marin',
    clientEmail: 'bogdan.marin@outlook.com',
    question:
      'Copilul are 3 ani și tușește seara de câteva zile, fără febră. Atașez analizele recente. Este nevoie de o consultație sau pot urmări acasă?',
    attachments: [
      { id: 'f2', name: 'analize-sange.pdf', sizeKb: 512 },
      { id: 'f3', name: 'radiografie.jpg', sizeKb: 1840 },
    ],
    status: 'open',
    answer: null,
    answeredAt: null,
    paymentStatus: 'confirmed',
    createdAt: created2,
  },
  {
    id: 'qq3',
    clientName: 'Cristina Lupu',
    clientEmail: 'cristina.lupu@gmail.com',
    question:
      'Ce supliment de vitamina D recomandați pentru un sugar alăptat exclusiv și ce doză?',
    attachments: [],
    status: 'open',
    answer: null,
    answeredAt: null,
    paymentStatus: 'confirmed',
    createdAt: created3,
  },
  {
    id: 'qq4',
    clientName: 'Denis Albu',
    clientEmail: 'denis.albu@gmail.com',
    question:
      'Putem începe diversificarea la 5 luni dacă bebelușul stă bine sprijinit și arată interes?',
    attachments: [],
    status: 'answered',
    answer:
      'Recomandarea este să așteptați împlinirea a 6 luni. Semnele de interes sunt importante, dar maturitatea digestivă contează cel mai mult. Urmăriți încă 2-3 săptămâni.',
    answeredAt: afterCreate(created4, 30),
    paymentStatus: 'confirmed',
    createdAt: created4,
  },
  {
    id: 'qq5',
    clientName: 'Elena Tofan',
    clientEmail: 'elena.tofan@yahoo.com',
    question:
      'Cât timp se poate păstra laptele matern în frigider și se poate reîncălzi de două ori?',
    attachments: [],
    status: 'answered',
    answer:
      'Laptele matern se păstrează până la 4 zile în frigider (4 °C). Nu se reîncălzește de două ori — porționați în cantități mici și folosiți o singură dată după încălzire.',
    answeredAt: afterCreate(created5, 60),
    paymentStatus: 'confirmed',
    createdAt: created5,
  },
  {
    id: 'qq6',
    clientName: 'Florin Roșu',
    clientEmail: 'florin.rosu@gmail.com',
    question:
      'La ce interval este normal să se trezească noaptea un copil de 10 luni care doarme în camera lui?',
    attachments: [],
    status: 'open',
    answer: null,
    answeredAt: null,
    paymentStatus: 'pending',
    createdAt: created6,
  },
  {
    id: 'qq7',
    clientName: 'Gabriela Sava',
    clientEmail: 'gabriela.sava@outlook.com',
    question: 'Ce alimente sunt cele mai frecvent alergene la diversificare?',
    attachments: [{ id: 'f4', name: 'istoric-alergii.pdf', sizeKb: 180 }],
    status: 'answered',
    answer:
      'Principalele alergene: ou, arahide, lapte de vacă, pește, fructe de mare, soia, grâu și nuci. Se introduc pe rând, câte unul la 3-4 zile, observând reacțiile.',
    answeredAt: afterCreate(created7, 20),
    paymentStatus: 'confirmed',
    createdAt: created7,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function mutate(id: string, patch: Partial<Ticket>): Ticket {
  let updated: Ticket | undefined;
  store = store.map((t) => {
    if (t.id !== id) return t;
    updated = { ...t, ...patch };
    return updated;
  });
  if (!updated) throw new Error(`Ticket ${id} not found`);
  return updated;
}

export async function fetchTickets(): Promise<Ticket[]> {
  await delay(550);
  // Open tickets first (soonest deadline at top), then answered (newest first).
  return store.slice().sort((a, b) => {
    const aOpen = a.status === 'open';
    const bOpen = b.status === 'open';
    if (aOpen !== bOpen) return aOpen ? -1 : 1;
    if (aOpen) return deadlineMs(a) - deadlineMs(b);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function answerTicket(
  id: string,
  answer: string,
): Promise<Ticket> {
  await delay(550);
  return mutate(id, {
    status: 'answered',
    answer: answer.trim(),
    answeredAt: new Date().toISOString(),
  });
}

export async function setPaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
): Promise<Ticket> {
  await delay(450);
  return mutate(id, { paymentStatus });
}
