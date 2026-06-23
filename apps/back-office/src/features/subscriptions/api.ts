import {
  SERVICE_CATALOG,
  ServiceCode,
  type Paginated,
  type SubscriptionDto,
} from '@olesia/shared';

import { http } from '@/api/http';
import type { Subscription } from '@/features/subscriptions/types';

/**
 * Real `subscriptions` endpoints (module_calendly.md §3.2.4) — the
 * "Monitorizare 3 luni" package (service 04). The DTO carries a monthly quota
 * and a service id; the UI uses a cycle total and a price, so we derive both.
 */

const MONITORING_PRICE =
  SERVICE_CATALOG.find((s) => s.code === ServiceCode.Monitoring)?.price ?? 2400;

const CYCLE_MONTHS = 3;

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
    videoQuotaTotal: d.videoQuotaPerMonth * CYCLE_MONTHS,
    videoQuotaUsed: d.videoQuotaUsed,
    price: MONITORING_PRICE,
    createdAt: d.createdAt,
  };
}

function asList<T>(r: T[] | Paginated<T>): T[] {
  return Array.isArray(r) ? r : r.items;
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const r = await http.get<SubscriptionDto[] | Paginated<SubscriptionDto>>(
    '/subscriptions?pageSize=200',
  );
  return asList(r).map(toView);
}

/** Manually set the payment status (both directions — payment is offline). */
export async function setPaymentStatus(
  id: string,
  paymentStatus: Subscription['paymentStatus'],
): Promise<Subscription> {
  return toView(
    await http.patch<SubscriptionDto>(`/subscriptions/${id}`, {
      paymentStatus,
    }),
  );
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
