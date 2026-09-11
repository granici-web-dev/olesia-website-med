import { ApiError } from '@/api/http';

/**
 * The decisions the login and session screens make, kept apart from the
 * components so they can be checked without rendering anything.
 */

/** Where to send someone back to after they sign in again. */
export function returnPath(location: {
  pathname: string;
  search: string;
  hash: string;
}): string {
  // The whole address, not just the path: a patient list reached through
  // `?search=…` is a different screen from the patient list, and dropping the
  // query sent the doctor back to page one of everything.
  return `${location.pathname}${location.search}${location.hash}`;
}

/**
 * Seconds the account is barred from trying another code, or null when the
 * error is something else.
 *
 * The API answers a locked account with 429 `totp_locked` and the remaining
 * time; without reading it the panel said "Cod incorect", so the doctor typed
 * fresh codes into a form that was never going to accept one, and each attempt
 * pushed the lock further out.
 */
export function totpLockSeconds(error: unknown): number | null {
  if (!(error instanceof ApiError) || error.status !== 429) return null;
  if (!error.message.includes('totp_locked')) return null;
  const seconds = (error.details as { retryAfterSeconds?: unknown } | undefined)
    ?.retryAfterSeconds;
  return typeof seconds === 'number' && seconds > 0 ? Math.ceil(seconds) : 1;
}

/** Whole seconds left of a lock, floored at zero. */
export function remainingSeconds(untilMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((untilMs - nowMs) / 1000));
}
