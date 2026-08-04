import { ServiceCode, ServiceGroup } from './enums.js';

/** A canonical entry in the service catalog. */
export interface ServiceCatalogEntry {
  code: ServiceCode;
  group: ServiceGroup;
  /** Slot length in minutes for group A; `null` for portal services. */
  durationMin: number | null;
  /** Base price in EUR (whole euros). `0` when the price is on request. */
  price: number;
}

/**
 * Canonical catalog of the consultation services. Source of truth for DB
 * seeding and a safe fallback for the public site. Calendly maps a booking to a
 * service by `event_type` URI only — never by the editable `a1` answer.
 */
export const SERVICE_CATALOG: readonly ServiceCatalogEntry[] = [
  { code: ServiceCode.Pediatric, group: ServiceGroup.Booking, durationMin: 30, price: 28 },
  // Two entries with identical length and price: the audience is the whole
  // difference, and it is the difference the booking calendar is split on.
  { code: ServiceCode.NutritionCopii, group: ServiceGroup.Booking, durationMin: 60, price: 38 },
  { code: ServiceCode.NutritionAdulti, group: ServiceGroup.Booking, durationMin: 60, price: 38 },
  { code: ServiceCode.Integrative, group: ServiceGroup.Booking, durationMin: 90, price: 58 },
  // Monitoring is being restructured into 4 subscription types × 1/2/3/6 months;
  // prices pending the client → 0 (shown as "on request") until that lands.
  { code: ServiceCode.Monitoring, group: ServiceGroup.Portal, durationMin: null, price: 0 },
  { code: ServiceCode.QuickQuestion, group: ServiceGroup.Portal, durationMin: null, price: 8 },
] as const;
