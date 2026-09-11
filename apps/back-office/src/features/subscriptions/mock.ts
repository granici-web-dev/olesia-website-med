import type {
  Subscription,
  SubscriptionStatus,
} from '@/features/subscriptions/types';

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory store shaped like the real REST API.
 * ------------------------------------------------------------------ */

let store: Subscription[] = [
  {
    id: 'sub1',
    clientName: 'Irina Bejan',
    clientEmail: 'irina.bejan@gmail.com',
    status: 'active',
    paymentStatus: 'confirmed',
    startDate: '2026-05-01',
    endDate: '2026-08-01',
    videoQuotaTotal: 6,
    videoQuotaUsed: 2,
    price: 2400,
    createdAt: '2026-04-30T10:00:00+03:00',
  },
  {
    id: 'sub2',
    clientName: 'Mihai Olaru',
    clientEmail: 'mihai.olaru@outlook.com',
    status: 'active',
    paymentStatus: 'pending',
    startDate: '2026-06-05',
    endDate: '2026-09-05',
    videoQuotaTotal: 6,
    videoQuotaUsed: 0,
    price: 2400,
    createdAt: '2026-06-04T09:00:00+03:00',
  },
  {
    id: 'sub3',
    clientName: 'Carmen Dascălu',
    clientEmail: 'carmen.dascalu@gmail.com',
    status: 'active',
    paymentStatus: 'confirmed',
    startDate: '2026-04-20',
    endDate: '2026-07-20',
    videoQuotaTotal: 6,
    videoQuotaUsed: 5,
    price: 2400,
    createdAt: '2026-04-19T11:00:00+03:00',
  },
  {
    id: 'sub4',
    clientName: 'Tudor Pântea',
    clientEmail: 'tudor.pantea@gmail.com',
    status: 'active',
    paymentStatus: 'confirmed',
    startDate: '2026-06-18',
    endDate: '2026-09-18',
    videoQuotaTotal: 6,
    videoQuotaUsed: 0,
    price: 2700,
    createdAt: '2026-06-17T08:30:00+03:00',
  },
  {
    id: 'sub5',
    clientName: 'Laura Ungureanu',
    clientEmail: 'laura.ungureanu@yahoo.com',
    status: 'active',
    paymentStatus: 'confirmed',
    startDate: '2026-03-20',
    endDate: '2026-06-20',
    videoQuotaTotal: 6,
    videoQuotaUsed: 4,
    price: 2400,
    createdAt: '2026-03-19T14:00:00+03:00',
  },
  {
    id: 'sub6',
    clientName: 'Daniela Cîrlan',
    clientEmail: 'daniela.cirlan@gmail.com',
    status: 'expired',
    paymentStatus: 'confirmed',
    startDate: '2026-02-15',
    endDate: '2026-05-15',
    videoQuotaTotal: 6,
    videoQuotaUsed: 6,
    price: 2400,
    createdAt: '2026-02-14T10:00:00+03:00',
  },
  {
    id: 'sub7',
    clientName: 'George Maxim',
    clientEmail: 'george.maxim@outlook.com',
    status: 'canceled',
    paymentStatus: 'confirmed',
    startDate: '2026-03-01',
    endDate: '2026-06-01',
    videoQuotaTotal: 6,
    videoQuotaUsed: 3,
    price: 2400,
    createdAt: '2026-02-28T09:00:00+03:00',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function mutate(id: string, patch: Partial<Subscription>): Subscription {
  let updated: Subscription | undefined;
  store = store.map((s) => {
    if (s.id !== id) return s;
    updated = { ...s, ...patch };
    return updated;
  });
  if (!updated) throw new Error(`Subscription ${id} not found`);
  return updated;
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  await delay(550);
  // Active first, then by soonest end date.
  const rank: Record<SubscriptionStatus, number> = {
    active: 0,
    expired: 1,
    canceled: 2,
  };
  return store
    .slice()
    .sort(
      (a, b) =>
        rank[a.status] - rank[b.status] ||
        a.endDate.localeCompare(b.endDate),
    );
}

export async function logVideoCall(id: string): Promise<Subscription> {
  await delay(450);
  const sub = store.find((s) => s.id === id);
  if (!sub) throw new Error(`Subscription ${id} not found`);
  if (sub.videoQuotaUsed >= sub.videoQuotaTotal) {
    throw new Error('no_quota');
  }
  return mutate(id, { videoQuotaUsed: sub.videoQuotaUsed + 1 });
}

export async function cancelSubscription(id: string): Promise<Subscription> {
  await delay(450);
  return mutate(id, { status: 'canceled' });
}
