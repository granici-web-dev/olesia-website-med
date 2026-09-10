import type { PostStatus } from '../../generated/prisma/enums';

/**
 * Whether a post is one the public may read.
 *
 * `status: 'published'` was the whole test until 2026-09-10 (audit A4, F2), so
 * a post scheduled for next spring was already on the site — and sorted to the
 * top of it, because `publishedAt DESC` puts NULL and the far future first.
 * Deferred publication existed in the editor and nowhere else.
 *
 * The rule is here rather than inline because two callers have to agree on it
 * (the list and the single-post route) and because "exactly now" is the kind
 * of boundary that is worth writing a test against.
 */
export function isPubliclyVisible(
  status: PostStatus,
  publishedAt: Date | null,
  now: Date,
): boolean {
  return (
    status === 'published' &&
    publishedAt !== null &&
    publishedAt.getTime() <= now.getTime()
  );
}
