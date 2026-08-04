import { DeliverableProduct } from './enums.js';

/**
 * Group-C deliverable catalog (brief §2) — the personalized menus and written
 * protocols ordered from /pricing.
 *
 * This is the **server-side** source of truth: the public order form sends only
 * the product code, and the API stamps the label and the price onto the order
 * from here. A price that arrives in a request body is not a price.
 *
 * The public site keeps its own trilingual marketing copy for these products in
 * `apps/frontend/app/[locale]/pricing/page.tsx` (tag, title, description). Only
 * the Romanian label and the price are duplicated, and they must move together:
 * the back office shows what this file says was ordered.
 */
export interface DeliverableCatalogEntry {
  code: DeliverableProduct;
  /** Price in whole EUR at order time. */
  priceEur: number;
  /** Romanian label — the back office is Romanian-only. */
  titleRo: string;
}

export const DELIVERABLE_CATALOG: readonly DeliverableCatalogEntry[] = [
  { code: DeliverableProduct.Menu7, priceEur: 28, titleRo: 'Meniu personalizat · 7 zile' },
  { code: DeliverableProduct.Menu14, priceEur: 48, titleRo: 'Meniu personalizat · 14 zile' },
  { code: DeliverableProduct.Menu30, priceEur: 88, titleRo: 'Meniu personalizat · 30 zile' },
  {
    code: DeliverableProduct.ProtocolPedNutri,
    priceEur: 98,
    titleRo: 'Protocol individualizat pediatrico-nutrițional',
  },
  {
    code: DeliverableProduct.ProtocolComplementary,
    priceEur: 98,
    titleRo: 'Protocol individualizat · alimentație complementară (sugari)',
  },
] as const;

/**
 * Catalog entry for a product code, or `undefined` for an unknown code.
 *
 * Takes a plain string because the API calls it with Prisma's own generated
 * enum: the two enums carry identical values but are nominally distinct to
 * TypeScript, and a cast at every call site would hide real typos.
 */
export function deliverableEntry(
  code: string,
): DeliverableCatalogEntry | undefined {
  return DELIVERABLE_CATALOG.find((e) => e.code === code);
}
