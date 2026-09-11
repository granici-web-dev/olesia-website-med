import type {
  AnsweredTicket,
  Ticket,
  TicketBucket,
  PaymentStatus,
} from '@/features/quick-questions/types';
import type { badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

/**
 * Mock-only: a flat offset used to give the sample tickets a spread of
 * deadlines. The real `dueAt` comes from the API, which counts working hours
 * against the practice schedule (§11.5) — it is not `createdAt + N`.
 */
export const MOCK_SLA_MS = 48 * 60 * 60 * 1000;

export const bucketBadgeVariant: Record<TicketBucket, BadgeVariant> = {
  open: 'info',
  overdue: 'destructive',
  answered: 'success',
};

export const paymentBadgeVariant: Record<PaymentStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
};

/**
 * The deadline is whatever the API computed at intake — working hours, not
 * `createdAt + 48h`. Recomputing it here used to disagree with the server the
 * moment the SLA changed, and would now be wrong for every question that
 * arrives outside opening hours.
 */
export function deadlineMs(ticket: Ticket): number {
  return new Date(ticket.dueAt).getTime();
}

export function remainingMs(ticket: Ticket): number {
  return deadlineMs(ticket) - Date.now();
}

export function bucketOf(ticket: Ticket): TicketBucket {
  if (ticket.status === 'answered') return 'answered';
  return remainingMs(ticket) < 0 ? 'overdue' : 'open';
}

/** Whether an answered ticket beat its deadline. */
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
 * Timestamps are relative to load time so the countdowns stay live.
 * PII is GDPR-sensitive (module_calendly.md §15).
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
    status: 'open',
    answer: null,
    answeredAt: null,
    paymentStatus: 'pending',
    dueAt: afterCreate(created1, 48),
    createdAt: created1,
  },
  {
    id: 'qq2',
    clientName: 'Bogdan Marin',
    clientEmail: 'bogdan.marin@outlook.com',
    question:
      'Copilul are 3 ani și tușește seara de câteva zile, fără febră. Atașez analizele recente. Este nevoie de o consultație sau pot urmări acasă?',
    status: 'open',
    answer: null,
    answeredAt: null,
    paymentStatus: 'confirmed',
    dueAt: afterCreate(created2, 48),
    createdAt: created2,
  },
  {
    id: 'qq3',
    clientName: 'Cristina Lupu',
    clientEmail: 'cristina.lupu@gmail.com',
    question:
      'Ce supliment de vitamina D recomandați pentru un sugar alăptat exclusiv și ce doză?',
    status: 'open',
    answer: null,
    answeredAt: null,
    paymentStatus: 'confirmed',
    dueAt: afterCreate(created3, 48),
    createdAt: created3,
  },
  {
    id: 'qq4',
    clientName: 'Denis Albu',
    clientEmail: 'denis.albu@gmail.com',
    question:
      'Putem începe diversificarea la 5 luni dacă bebelușul stă bine sprijinit și arată interes?',
    status: 'answered',
    answer:
      'Recomandarea este să așteptați împlinirea a 6 luni. Semnele de interes sunt importante, dar maturitatea digestivă contează cel mai mult. Urmăriți încă 2-3 săptămâni.',
    answeredAt: afterCreate(created4, 30),
    paymentStatus: 'confirmed',
    dueAt: afterCreate(created4, 48),
    createdAt: created4,
  },
  {
    id: 'qq5',
    clientName: 'Elena Tofan',
    clientEmail: 'elena.tofan@yahoo.com',
    question:
      'Cât timp se poate păstra laptele matern în frigider și se poate reîncălzi de două ori?',
    status: 'answered',
    answer:
      'Laptele matern se păstrează până la 4 zile în frigider (4 °C). Nu se reîncălzește de două ori — porționați în cantități mici și folosiți o singură dată după încălzire.',
    answeredAt: afterCreate(created5, 60),
    paymentStatus: 'confirmed',
    dueAt: afterCreate(created5, 48),
    createdAt: created5,
  },
  {
    id: 'qq6',
    clientName: 'Florin Roșu',
    clientEmail: 'florin.rosu@gmail.com',
    question:
      'La ce interval este normal să se trezească noaptea un copil de 10 luni care doarme în camera lui?',
    status: 'open',
    answer: null,
    answeredAt: null,
    paymentStatus: 'pending',
    dueAt: afterCreate(created6, 48),
    createdAt: created6,
  },
  {
    id: 'qq7',
    clientName: 'Gabriela Sava',
    clientEmail: 'gabriela.sava@outlook.com',
    question: 'Ce alimente sunt cele mai frecvent alergene la diversificare?',
    status: 'answered',
    answer:
      'Principalele alergene: ou, arahide, lapte de vacă, pește, fructe de mare, soia, grâu și nuci. Se introduc pe rând, câte unul la 3-4 zile, observând reacțiile.',
    answeredAt: afterCreate(created7, 20),
    paymentStatus: 'confirmed',
    dueAt: afterCreate(created7, 48),
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
): Promise<AnsweredTicket> {
  await delay(550);
  const ticket = mutate(id, {
    status: 'answered',
    answer: answer.trim(),
    answeredAt: new Date().toISOString(),
  });
  // Mock mode has no transport, which is also the real state until SMTP is
  // configured — so the UI shows its "saved but not sent" path by default.
  return { ticket, emailSent: false };
}

