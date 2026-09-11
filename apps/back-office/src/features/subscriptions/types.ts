import type { PaymentStatus } from '@/types';

/**
 * Subscriptions — the "Monitorizare 3 luni" package (service 04, group B).
 *
 * The spec (module_calendly.md §3.2.4, §11) requires: list with status and
 * remaining video-call quota, plus manual payment confirmation. No explicit
 * model is given, so this is the inferred shape.
 * `api.ts` maps `SubscriptionDto` from `@olesia/shared` into the view type
 * below, and folds the DTO's `paused` into `active` because this UI has no
 * paused state. Narrowing there is the point of the layer.
 */

export type SubscriptionStatus = 'active' | 'expired' | 'canceled';

export interface Subscription {
  id: string;
  clientName: string;
  clientEmail: string;
  /** Lead contact phone + message (public intake; absent for older records). */
  phone?: string | null;
  notes?: string | null;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  startDate: string; // ISO
  endDate: string; // ISO
  /** Total video calls included in the cycle (e.g. 2/month × 3 months). */
  videoQuotaTotal: number;
  videoQuotaUsed: number;
  price: number; // EUR
  createdAt: string;
}

export type StatusFilter = 'all' | SubscriptionStatus;
