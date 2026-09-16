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

/**
 * Seconds the whole login route is barred for, or null when the error is
 * something else.
 *
 * Two different 429s reach this screen. `totp_locked` is the per-account brake
 * on guessing codes and reports its wait in the body; this is the other one —
 * the route's own throttler, eight attempts a minute per IP, which reports its
 * wait in `Retry-After` and fires on the password step, before a code is ever
 * asked for. The panel used to answer it with "Autentificarea a eșuat.
 * Încearcă din nou", which is both wrong about what happened and an invitation
 * to do the one thing that cannot work yet (audit A13).
 *
 * `retryAfterSeconds` in the body is read too, so a future 429 that reports
 * its wait the way `totp_locked` does needs no second reader here.
 */
export function throttleSeconds(error: unknown): number | null {
  if (!(error instanceof ApiError) || error.status !== 429) return null;
  // A locked account is a different sentence with a different remedy.
  if (error.message.includes('totp_locked')) return null;
  const fromBody = (
    error.details as { retryAfterSeconds?: unknown } | undefined
  )?.retryAfterSeconds;
  const seconds =
    typeof fromBody === 'number' ? fromBody : error.retryAfterSeconds;
  // A throttler that reported no number still throttled: one second, so the
  // button re-enables and the next refusal carries the header.
  return typeof seconds === 'number' && seconds > 0 ? Math.ceil(seconds) : 1;
}

/** Whole seconds left of a lock, floored at zero. */
export function remainingSeconds(untilMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((untilMs - nowMs) / 1000));
}
