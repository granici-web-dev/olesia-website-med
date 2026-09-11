/**
 * How the back office writes dates, times and money.
 *
 * These seven lived in thirteen `mock.ts` files, which is to say the panel's
 * production formatting was reached through the fixture module and shipped
 * because `export *` carried it along. Nothing in the bundle came from the
 * fixtures, but that was tree-shaking's decision rather than ours.
 *
 * Romanian conventions throughout: `15 sept. 2026`, `14:30`, `250 €`.
 */

const dateFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Day and time without the year, for lists of things that happened this week. */
const shortDateTimeFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFmt = new Intl.DateTimeFormat('ro-RO', {
  hour: '2-digit',
  minute: '2-digit',
});

/** An em dash for a date that is not set: a blank cell reads as a bug. */
const NOT_SET = '—';

export function formatDate(iso: string | null | undefined): string {
  return iso ? dateFmt.format(new Date(iso)) : NOT_SET;
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTimeFmt.format(new Date(iso)) : NOT_SET;
}

export function formatShortDateTime(iso: string | null | undefined): string {
  return iso ? shortDateTimeFmt.format(new Date(iso)) : NOT_SET;
}

export function formatTime(iso: string | null | undefined): string {
  return iso ? timeFmt.format(new Date(iso)) : NOT_SET;
}

/** Prices are whole euros; the symbol goes after the number in Romanian. */
export function formatPrice(eur: number): string {
  return `${new Intl.NumberFormat('ro-RO').format(eur)} €`;
}

/**
 * The bank settles in MDL but may charge in EUR, so the currency travels with
 * the amount rather than being assumed by the panel.
 */
export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Whole minutes between two instants, rounded the way a schedule reads. */
export function durationMinutes(startIso: string, endIso: string): number {
  return Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000,
  );
}
