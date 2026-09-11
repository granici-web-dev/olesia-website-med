import type { AnsweredTicket, Ticket } from '@/features/quick-questions/types';
import { deadlineMs } from '@/features/quick-questions/format';

/**
 * Mock-only: a flat offset used to give the sample tickets a spread of
 * deadlines. The real `dueAt` comes from the API, which counts working hours
 * against the practice schedule (§11.5) — it is not `createdAt + N`.
 *
 * One hour, matching the default `WorkingHours.expressSlaMinutes` and what the
 * public site promises. It was 48 hours, from the original spec, so the mocked
 * panel and the live site disagreed by a factor of forty-eight (audit A6, F25).
 */
const MOCK_SLA_HOURS = 1;

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
    dueAt: afterCreate(created1, MOCK_SLA_HOURS),
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
    dueAt: afterCreate(created2, MOCK_SLA_HOURS),
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
    dueAt: afterCreate(created3, MOCK_SLA_HOURS),
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
    dueAt: afterCreate(created4, MOCK_SLA_HOURS),
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
    dueAt: afterCreate(created5, MOCK_SLA_HOURS),
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
    dueAt: afterCreate(created6, MOCK_SLA_HOURS),
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
    dueAt: afterCreate(created7, MOCK_SLA_HOURS),
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
    if (aOpen) return (deadlineMs(a) ?? 0) - (deadlineMs(b) ?? 0);
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
