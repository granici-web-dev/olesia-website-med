/**
 * Subscriptions — the "Monitorizare 3 luni" package (service 04, group B).
 *
 * The spec (module_calendly.md §3.2.4, §11) requires: list with status and
 * remaining video-call quota, plus manual payment confirmation. No explicit
 * model is given, so this is the inferred shape.
 * TODO(shared): move to `packages/shared` once it exists.
 */

export type SubscriptionStatus = 'active' | 'expired' | 'canceled';
export type PaymentStatus = 'pending' | 'confirmed';

export interface Subscription {
  id: string;
  clientName: string;
  clientEmail: string;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  startDate: string; // ISO
  endDate: string; // ISO
  /** Total video calls included in the cycle (e.g. 2/month × 3 months). */
  videoQuotaTotal: number;
  videoQuotaUsed: number;
  price: number; // lei
  createdAt: string;
}

export type StatusFilter = 'all' | SubscriptionStatus;
