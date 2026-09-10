import { loc } from './api';

/**
 * Every price and duration string the public site renders (`PLAN.md` step 8,
 * `docs/shape-prices-from-api.md`).
 *
 * `null` means "the API did not tell us", and every caller renders nothing for
 * it. No caller substitutes a number: until 2026-09-10 the site kept its own
 * copies of the tariff in four places, so editing a price in the back office
 * changed nothing a visitor saw. An empty price is recoverable; a stale one
 * that looks authoritative is not.
 */

/** The price fields of `ServiceDto`, so a caller can pass a narrower object. */
export interface PricedService {
  price: number;
  priceLabelRo: string | null;
  priceLabelEn: string | null;
  priceLabelRu: string | null;
}

const NUMBER_LOCALE: Record<string, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  ro: 'ro-RO',
};

const ON_REQUEST: Record<string, string> = {
  ru: 'по запросу',
  en: 'on request',
  ro: 'la cerere',
};

const MINUTES: Record<string, string> = { ru: 'мин', en: 'min', ro: 'min' };
const HOURS: Record<string, string> = { ru: 'ч', en: 'h', ro: 'h' };

const forLocale = (table: Record<string, string>, locale: string): string =>
  table[locale] ?? table.ro;

export function formatEur(locale: string, amount: number): string {
  return `${new Intl.NumberFormat(forLocale(NUMBER_LOCALE, locale)).format(amount)} €`;
}

export function formatServicePrice(
  locale: string,
  service: PricedService,
): string {
  const label = loc(
    locale,
    service.priceLabelRo ?? '',
    service.priceLabelEn,
    service.priceLabelRu,
  );
  if (label.trim()) return label;
  if (service.price === 0) return forLocale(ON_REQUEST, locale);
  return formatEur(locale, service.price);
}

export function formatServiceDuration(
  locale: string,
  durationMin: number | null,
): string | null {
  if (durationMin === null) return null;
  if (durationMin < 120) return `${durationMin} ${forLocale(MINUTES, locale)}`;
  return `${durationMin / 60} ${forLocale(HOURS, locale)}`;
}

/**
 * One price for a tile that covers several services — the home page shows
 * children's and adults' nutrition as a single row. Identical prices read as
 * themselves; the day the client sets them apart, the tile says "from" rather
 * than picking one and being wrong about the other.
 */
const FROM: Record<string, string> = { ru: 'от', en: 'from', ro: 'de la' };

export function formatPriceRange(
  locale: string,
  services: PricedService[],
): string | null {
  if (services.length === 0) return null;
  if (services.length === 1) return formatServicePrice(locale, services[0]);

  const rendered = services.map((s) => formatServicePrice(locale, s));
  if (rendered.every((r) => r === rendered[0])) return rendered[0];

  const cheapest = services.reduce((a, b) => (a.price <= b.price ? a : b));
  return `${forLocale(FROM, locale)} ${formatServicePrice(locale, cheapest)}`;
}
