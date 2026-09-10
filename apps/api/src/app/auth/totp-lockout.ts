/**
 * How long an account is barred from trying a second factor again.
 *
 * The login throttle counts per IP, which a six-digit code is worth spreading
 * across addresses to defeat: 8 tries a minute from each of a thousand hosts
 * walks the whole space in an afternoon. This counts per account instead, and
 * only the second factor — a locked-out phone must not lock out the password.
 */

const FREE_ATTEMPTS = 4;
const FIRST_DELAY_MS = 60_000;
const MAX_DELAY_MS = 15 * 60_000;

/** Delay after `failedCount` consecutive wrong codes. Zero means "go ahead". */
export function totpLockMs(failedCount: number): number {
  if (failedCount <= FREE_ATTEMPTS) return 0;
  const doublings = failedCount - FREE_ATTEMPTS - 1;
  return Math.min(FIRST_DELAY_MS * 2 ** doublings, MAX_DELAY_MS);
}
