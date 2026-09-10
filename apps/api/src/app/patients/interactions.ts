/**
 * The dossier's timeline of things the person bought, merged from the four
 * tables that carry a client's name and address.
 *
 * A pure function over rows, rather than four inline `.map`s in the service,
 * because the branch that was missing is exactly the kind that goes unnoticed:
 * group-C orders had no patient relation at all until audit A5 (F12), so a
 * dossier showed the consultations, the monitoring and the EXPRESS tickets and
 * silently omitted the menus and protocols the same person had ordered.
 */
import type { PatientInteractionDto } from '@olesia/shared';

type PaymentStatusValue = PatientInteractionDto['paymentStatus'];

interface LeadRow {
  id: string;
  status: string;
  paymentStatus: string;
}

export interface AppointmentRow extends LeadRow {
  reason: string | null;
  startTime: Date;
}

export interface SubscriptionRow extends LeadRow {
  startsAt: Date;
}

export interface QuickQuestionRow extends LeadRow {
  createdAt: Date;
}

export interface DeliverableOrderRow extends LeadRow {
  titleRo: string;
  createdAt: Date;
}

export interface PatientLeadRows {
  appointments: AppointmentRow[];
  subscriptions: SubscriptionRow[];
  quickQuestions: QuickQuestionRow[];
  deliverableOrders: DeliverableOrderRow[];
}

/**
 * Each kind is dated by the moment that matters to the doctor: an appointment
 * by when it happens, a subscription by when it starts, and the two that are
 * requests rather than events by when they came in.
 */
export function toInteractions(rows: PatientLeadRows): PatientInteractionDto[] {
  const paymentStatus = (value: string) => value as PaymentStatusValue;

  return [
    ...rows.appointments.map((a) => ({
      source: 'appointment' as const,
      sourceId: a.id,
      label: a.reason ?? 'Consultație',
      occurredAt: a.startTime.toISOString(),
      status: a.status,
      paymentStatus: paymentStatus(a.paymentStatus),
    })),
    ...rows.subscriptions.map((s) => ({
      source: 'subscription' as const,
      sourceId: s.id,
      label: 'Monitorizare',
      occurredAt: s.startsAt.toISOString(),
      status: s.status,
      paymentStatus: paymentStatus(s.paymentStatus),
    })),
    ...rows.quickQuestions.map((q) => ({
      source: 'quick_question' as const,
      sourceId: q.id,
      label: 'Întrebare rapidă',
      occurredAt: q.createdAt.toISOString(),
      status: q.status,
      paymentStatus: paymentStatus(q.paymentStatus),
    })),
    // The order's own Romanian title rather than a generic label: unlike the
    // other three, a group-C order is a specific product ("Meniu 7 zile"), and
    // the dossier is where the doctor looks up which one she owes.
    ...rows.deliverableOrders.map((o) => ({
      source: 'deliverable_order' as const,
      sourceId: o.id,
      label: o.titleRo,
      occurredAt: o.createdAt.toISOString(),
      status: o.status,
      paymentStatus: paymentStatus(o.paymentStatus),
    })),
  ].sort((x, y) => y.occurredAt.localeCompare(x.occurredAt));
}
