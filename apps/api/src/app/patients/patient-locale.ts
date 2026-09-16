/**
 * The language to write to a patient in.
 *
 * `Patient` has no locale; the four tables a person reaches us through each
 * record the one they wrote in. The most recent of them wins, because a family
 * that booked in Romanian a year ago and asked an EXPRESS question in Russian
 * last week reads Russian now. Null when the dossier was created by hand and
 * nothing links to it: the caller decides the fallback, and the back office
 * shows it as a choice rather than as a fact.
 */
import type { Locale } from '../../generated/prisma/enums';

export interface LeadLocale {
  locale: Locale;
  createdAt: Date;
}

export function lastKnownLocale(
  /** The newest row of each lead table, or null where there is none. */
  newestPerTable: (LeadLocale | null)[],
): Locale | null {
  let newest: LeadLocale | null = null;
  for (const row of newestPerTable) {
    if (row && (!newest || row.createdAt > newest.createdAt)) newest = row;
  }
  return newest?.locale ?? null;
}
