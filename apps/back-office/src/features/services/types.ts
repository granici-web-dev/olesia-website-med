/**
 * Services / pricing (the 01–05 cards shown publicly on the site).
 *
 * TODO(shared): replace with DTOs/enums from `packages/shared` once it exists —
 * mirrors the `Service` model in module_calendly.md §6.
 */

export type ServiceCode =
  | 'pediatric'
  | 'nutrition'
  | 'integrative'
  | 'monitoring'
  | 'quick_question';

/** A = calendar-backed video slot; B = portal-only (no Calendly). */
export type ServiceGroup = 'A_booking' | 'B_portal';

export interface Service {
  id: string;
  code: ServiceCode;
  group: ServiceGroup;
  titleRo: string;
  titleEn: string;
  descriptionRo: string;
  descriptionEn: string;
  durationMin: number | null; // group A only
  price: number; // lei
  priceLabelRo: string | null;
  priceLabelEn: string | null;
  calendlyEventTypeUri: string | null; // group A only — webhook mapping
  calendlySchedulingUrl: string | null; // group A only — public booking link
  sortOrder: number;
  active: boolean;
}

/** Editable payload (everything except the server-owned id). */
export type ServiceInput = Omit<Service, 'id'>;
