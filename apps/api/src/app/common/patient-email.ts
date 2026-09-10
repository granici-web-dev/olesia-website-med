/**
 * The one place an address becomes a patient key.
 *
 * Audit A3 (F4, F12): the same email reached `Patient.email` in four different
 * shapes — raw from the back-office form, raw from `fromLead`, lower-cased in
 * `findPatientId`, and `''` for a Calendly booking that carried no address at
 * all. Postgres unique is case-sensitive, so `Ana@Gmail.com` and
 * `ana@gmail.com` were two medical records for one child, and every anonymous
 * Calendly lead upserted onto the same `''` row until one dossier held the
 * history of everyone who ever booked without an email.
 *
 * `null` means "no usable address", which callers must handle rather than
 * store: an empty string is a legal value in a `String @unique` column, and
 * that is exactly how the merge happened.
 */
export function normalizePatientEmail(
  raw: string | null | undefined,
): string | null {
  const normalized = (raw ?? '').trim().toLowerCase();
  return normalized === '' ? null : normalized;
}
