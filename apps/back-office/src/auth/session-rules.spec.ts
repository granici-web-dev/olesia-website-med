/**
 * The two things the login screen gets wrong when nobody is watching: where it
 * sends the doctor back to, and what it does with a lockout it cannot read.
 */
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/http';
import {
  remainingSeconds,
  returnPath,
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

describe('remainingSeconds', () => {
  it('counts down in whole seconds', () => {
    expect(remainingSeconds(10_000, 7_400)).toBe(3);
  });

  it('stops at zero rather than going negative', () => {
    expect(remainingSeconds(10_000, 12_000)).toBe(0);
  });
});
