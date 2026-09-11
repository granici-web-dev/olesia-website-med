import { UPLOAD_RETENTION_DAYS } from './uploads.constants';

/**
 * The rules of the patient-upload module that are worth deciding in one place:
 * whether a link still works, when data has outlived its retention, and what a
 * patient's filename is allowed to become on the way to the doctor's screen.
 *
 * They live here rather than inside the service because each one is a pure
 * function of its inputs, and because getting any of them wrong is expensive:
 * an over-permissive link check hands out medical files, an over-eager
 * retention rule deletes them early.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether a link may still be used. Unknown (`null`), revoked and expired are
 * all "no" — the caller answers all three with the same 404, so that a wrong
 * token cannot be told apart from a dead one.
 */
export function isLinkUsable<
  T extends { expiresAt: Date; revokedAt: Date | null },
>(link: T | null, now: Date): link is T {
  return (
    link !== null &&
    link.revokedAt === null &&
    link.expiresAt.getTime() > now.getTime()
  );
}

/** Anything stored before this moment has outlived the retention period. */
export function retentionCutoff(
  now: Date,
  retentionDays: number = UPLOAD_RETENTION_DAYS,
): Date {
  return new Date(now.getTime() - retentionDays * DAY_MS);
}

/**
 * Whether the link row itself can go. It carries the patient's name, email and
 * token, so it is deleted once it is long dead and holds nothing: while it
 * still has documents, the documents' own retention decides.
 */
export function isPurgeableLink(
  link: { expiresAt: Date; documentCount: number },
  now: Date,
  retentionDays: number = UPLOAD_RETENTION_DAYS,
): boolean {
  return (
    link.documentCount === 0 &&
    link.expiresAt.getTime() < retentionCutoff(now, retentionDays).getTime()
  );
}

/**
 * Keep the patient's filename for the doctor's benefit, minus anything that
 * could steer a path, a header, or the eye. Unicode control characters go too:
 * a right-to-left override (U+202E) makes "analize<RLO>exe.fdp" render as
 * "analizepdf.exe" reversed, so a document can wear another type's name in the
 * file list. The stored key is a UUID either way, so this only ever affects
 * what the download is called.
 */
export function safeFileName(name: string | undefined): string {
  // Trim before the separators are replaced: a name of nothing but spaces
  // should fall back, not become a row of underscores.
  const base = (name ?? 'document')
    .replace(/\p{C}/gu, '')
    .trim()
    .replace(/[/\\ ]/g, '_');
  return base.slice(0, 120) || 'document';
}
