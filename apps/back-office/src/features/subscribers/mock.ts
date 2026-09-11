import type { Subscriber } from '@/features/subscribers/types';

/* ------------------------------- mock data ------------------------------ */
/* Used only when `VITE_API_MOCKS === 'true'`; the real API is in `api.ts`. */

const DAY = 24 * 60 * 60 * 1000;

const SUBSCRIBERS: Subscriber[] = [
  {
    id: 'sub-1',
    email: 'maria.popescu@example.md',
    locale: 'ro',
    source: 'library',
    consentAt: new Date(Date.now() - 2 * DAY).toISOString(),
    unsubscribedAt: null,
    createdAt: new Date(Date.now() - 2 * DAY).toISOString(),
  },
  {
    id: 'sub-2',
    email: 'elena.rusu@example.com',
    locale: 'ru',
    source: 'footer',
    consentAt: new Date(Date.now() - 9 * DAY).toISOString(),
    unsubscribedAt: null,
    createdAt: new Date(Date.now() - 9 * DAY).toISOString(),
  },
  {
    id: 'sub-3',
    email: 'anna.klein@example.com',
    locale: 'en',
    source: 'library',
    consentAt: new Date(Date.now() - 30 * DAY).toISOString(),
    unsubscribedAt: new Date(Date.now() - 4 * DAY).toISOString(),
    createdAt: new Date(Date.now() - 30 * DAY).toISOString(),
  },
];

export async function fetchSubscribers(): Promise<Subscriber[]> {
  return SUBSCRIBERS;
}
