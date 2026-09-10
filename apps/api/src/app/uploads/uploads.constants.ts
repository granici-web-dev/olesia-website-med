/**
 * Patient upload policy (client answers v2 §11.14).
 *
 * Two of these numbers are **placeholders pending the client's own policy**:
 * how long a link stays usable, and how long the medical files themselves are
 * kept. The retention period in particular is a legal question — it is the one
 * item §11.14 calls a non-negotiable and `questions.md` #26 still has no answer
 * for. The default below is deliberately short rather than generous: keeping
 * special-category data longer than needed is the failure mode that matters.
 */

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** How long an upload link works before it stops accepting files. */
export const UPLOAD_LINK_TTL_DAYS = envInt('UPLOAD_LINK_TTL_DAYS', 30);

/**
 * How long an uploaded medical file is kept before the purge job deletes it —
 * row and bytes both. ⚠ PLACEHOLDER: confirm with the client and their lawyer.
 */
export const UPLOAD_RETENTION_DAYS = envInt('MEDICAL_UPLOAD_RETENTION_DAYS', 180);

/** Cap per link. Enough for a full set of analyses, not an upload host. */
export const UPLOAD_MAX_FILES = envInt('UPLOAD_MAX_FILES', 15);

// The consent wording and its version live in `@olesia/shared`
// (`patient-consent.ts`): the API records the version, the public page renders
// the text, and a version that could drift from its text would record nothing.
