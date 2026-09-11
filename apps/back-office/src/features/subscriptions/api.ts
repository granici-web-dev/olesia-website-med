import {
  SERVICE_CATALOG,
  ServiceCode,
  type SubscriptionDto,
} from '@olesia/shared';

import { http } from '@/api/http';
import { fetchEveryPage, MAX_PAGE_SIZE } from '@/api/list';
import type { Subscription } from '@/features/subscriptions/types';

/**
 * Real `subscriptions` endpoints (module_calendly.md §3.2.4) — the
 * "Monitorizare 3 luni" package (service 04). The DTO carries the quota and a
 * service id; the price comes from the catalog.
 *
 * The quota used to be multiplied by three here, because the API stored it per
 * month and nothing ever reset it — so the screen and the enforcement
 * disagreed by a factor of three. The API stores the total now (audit A5, F10)
 * and this passes it through.
 */

// Monitoring is being restructured into 4 subscription types × 1/2/3/6 months;
// catalog price is 0 ("on request") until the client provides the matrix.
const MONITORING_PRICE =
  SERVICE_CATALOG.find((s) => s.code === ServiceCode.Monitoring)?.price ?? 0;

function toView(d: SubscriptionDto): Subscription {
  return {
    id: d.id,
    clientName: d.clientName,
    clientEmail: d.clientEmail,
    phone: d.phone,
    notes: d.notes,
    // The UI has no "paused" state; treat it as active for display.
    status: (d.status === 'paused'
      ? 'active'
      : d.status) as Subscription['status'],
    paymentStatus: d.paymentStatus as Subscription['paymentStatus'],
    startDate: d.startsAt,
    endDate: d.endsAt,
    videoQuotaTotal: d.videoQuotaTotal,
    videoQuotaUsed: d.videoQuotaUsed,
    price: MONITORING_PRICE,
    createdAt: d.createdAt,
  };
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const rows = await fetchEveryPage<SubscriptionDto>((page) =>
    http.get(`/subscriptions?page=${page}&pageSize=${MAX_PAGE_SIZE}`),
  );
  return rows.map(toView);
}

export async function logVideoCall(id: string): Promise<Subscription> {
  return toView(
    await http.post<SubscriptionDto>(`/subscriptions/${id}/video-call`),
  );
}

export async function cancelSubscription(id: string): Promise<Subscription> {
  return toView(
    await http.patch<SubscriptionDto>(`/subscriptions/${id}`, {
      status: 'canceled',
    }),
  );
}
