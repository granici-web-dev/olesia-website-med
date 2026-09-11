import type { PaymentStatus } from '@/types';

/**
 * Appointments (Calendly group-A video consultations).
 *
 * The wire shapes are the DTOs in `@olesia/shared`; `api.ts` maps them into
 * the view types below. That layer is deliberate, not a placeholder — it is
 * where a shared enum gets narrowed to what this UI actually renders.
 * Mirrors the `Appointment` model in module_calendly.md §8.
 */

export type AppointmentStatus =
  'scheduled' | 'completed' | 'no_show' | 'canceled';

/** Group-A services only — the calendar-backed ones (incl. the free call). */
export type AppointmentServiceCode =
  | 'pediatric'
  | 'nutrition_copii'
  | 'nutrition_adulti'
  | 'integrative'
  | 'free_consult';

export interface Appointment {
  id: string;
  /** Idempotency key from Calendly (`scheduled_event.uri`). */
  calendlyEventUri: string;
  service: AppointmentServiceCode;
  clientName: string;
  clientEmail: string;
  reason: string | null;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  videoUrl: string | null;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  cancelUrl: string;
  rescheduleUrl: string;
  prepSentAt: string | null;
  /** Written treatment plan typed by the specialist. */
  planText: string | null;
  /** Filename of the optional plan attachment, or null. Downloaded via auth. */
  planFileName: string | null;
  planUploadedAt: string | null;
  /** The canceled appointment this one was rescheduled from, if any. */
  rescheduledFromId: string | null;
}

/** Status used by the segmented filter; `all` is the no-op selection. */
export type StatusFilter = 'all' | AppointmentStatus;
