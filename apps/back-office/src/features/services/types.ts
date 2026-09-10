/**
 * Services / pricing (the 01–05 cards shown publicly on the site).
 *
 * The wire shapes are the DTOs in `@olesia/shared`; `api.ts` maps them into
 * the view types below. That layer is deliberate, not a placeholder — it is
 * where a shared enum gets narrowed to what this UI actually renders.
 * Mirrors the `Service` model in module_calendly.md §6.
 */

export type ServiceCode =
  | 'pediatric'
  | 'nutrition_copii'
  | 'nutrition_adulti'
  | 'integrative'
  | 'monitoring'
  | 'quick_question'
  | 'free_consult';

/** A = calendar-backed video slot; B = portal-only (no Calendly). */
export type ServiceGroup = 'A_booking' | 'B_portal';

export interface Service {
  id: string;
  code: ServiceCode;
  group: ServiceGroup;
  titleRo: string;
  titleEn: string;
  /** RU is optional — the catalog stays saveable while a translation is missing. */
  titleRu: string | null;
  descriptionRo: string;
  descriptionEn: string;
  descriptionRu: string | null;
  durationMin: number | null; // group A only
  price: number; // EUR (whole euros; 0 = on request)
  priceLabelRo: string | null;
  priceLabelEn: string | null;
  priceLabelRu: string | null;
  calendlyEventTypeUri: string | null; // group A only — webhook mapping
  calendlySchedulingUrl: string | null; // group A only — public booking link
  sortOrder: number;
  active: boolean;
}

/** Editable payload (everything except the server-owned id). */
export type ServiceInput = Omit<Service, 'id'>;
