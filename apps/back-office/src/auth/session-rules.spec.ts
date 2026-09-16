/**
 * The two things the login screen gets wrong when nobody is watching: where it
 * sends the doctor back to, and what it does with a lockout it cannot read.
 */
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/http';
import {
  remainingSeconds,
  returnPath,
  throttleSeconds,
  totpLockSeconds,
} from '@/auth/session-rules';

describe('returnPath', () => {
  it('keeps the query and the fragment, not just the path', () => {
    expect(
      returnPath({
        pathname: '/pacienti',
        search: '?search=ionescu',
        hash: '',
      }),
    ).toBe('/pacienti?search=ionescu');
  });

  it('is the bare path when there is nothing else', () => {
    expect(returnPath({ pathname: '/plati', search: '', hash: '' })).toBe(
      '/plati',
    );
  });
});

describe('totpLockSeconds', () => {
  const locked = (retryAfterSeconds: unknown) =>
    new ApiError(429, 'totp_locked', {
      message: 'totp_locked',
      retryAfterSeconds,
    });

  it('reads the remaining time the API reported', () => {
    expect(totpLockSeconds(locked(120))).toBe(120);
  });

  it('still reports a lock when the API sent no number', () => {
    // Better a one-second countdown than a "wrong code" the code was not.
    expect(totpLockSeconds(locked(undefined))).toBe(1);
  });

  it('ignores a rejected code, which is not a lock', () => {
    expect(totpLockSeconds(new ApiError(400, 'totp_invalid_code'))).toBeNull();
  });

  it('ignores anything that is not an API answer', () => {
    expect(totpLockSeconds(new Error('network_error'))).toBeNull();
  });
});

describe('throttleSeconds', () => {
  /**
   * The route's own limiter: eight attempts a minute per IP, refused on the
   * password step before any code is asked for. It reports the wait in
   * `Retry-After` — which the API has to expose through CORS for the panel to
   * see it at all — and says nothing in the body.
   */
  const throttled = (retryAfterSeconds?: number) =>
    new ApiError(
      429,
      'ThrottlerException: Too Many Requests',
      { statusCode: 429, message: 'ThrottlerException: Too Many Requests' },
      retryAfterSeconds,
    );

  it('reads the wait off the Retry-After header', () => {
    expect(throttleSeconds(throttled(60))).toBe(60);
  });

  it('still reports a throttle when the header never arrived', () => {
    // The likeliest cause is CORS eating the header, and a one-second
    // countdown that ends in another 429 beats "Încearcă din nou" on a form
    // that will refuse for another minute.
    expect(throttleSeconds(throttled())).toBe(1);
  });

  it('prefers a number the body reported over the header', () => {
    const error = new ApiError(429, 'too_many', { retryAfterSeconds: 45 }, 60);
    expect(throttleSeconds(error)).toBe(45);
  });

  it('leaves a locked account to totpLockSeconds', () => {
    // Both are 429s and they are read in this order, so a lock must not be
    // answered with the throttler's sentence.
    const locked = new ApiError(429, 'totp_locked', {
      message: 'totp_locked',
      retryAfterSeconds: 120,
    });
    expect(throttleSeconds(locked)).toBeNull();
    expect(totpLockSeconds(locked)).toBe(120);
  });

  it('ignores a rejected password, which is not a throttle', () => {
    expect(throttleSeconds(new ApiError(401, 'Unauthorized'))).toBeNull();
  });

  it('ignores anything that is not an API answer', () => {
    expect(throttleSeconds(new Error('network_error'))).toBeNull();
  });
});

describe('remainingSeconds', () => {
  it('counts down in whole seconds', () => {
    expect(remainingSeconds(10_000, 7_400)).toBe(3);
  });

  it('stops at zero rather than going negative', () => {
    expect(remainingSeconds(10_000, 12_000)).toBe(0);
  });
});
