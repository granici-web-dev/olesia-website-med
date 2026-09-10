import { totpLockMs } from './totp-lockout';

/**
 * The per-account brake on guessing a six-digit code. The login throttle counts
 * per IP, which is the thing an attacker with a thousand addresses does not
 * care about.
 */
describe('totpLockMs', () => {
  it('lets the first four mistakes through', () => {
    expect(totpLockMs(0)).toBe(0);
    expect(totpLockMs(4)).toBe(0);
  });

  it('costs a minute on the fifth', () => {
    expect(totpLockMs(5)).toBe(60_000);
  });

  it('doubles from there', () => {
    expect(totpLockMs(6)).toBe(120_000);
    expect(totpLockMs(7)).toBe(240_000);
    expect(totpLockMs(8)).toBe(480_000);
  });

  it('stops at a quarter of an hour', () => {
    expect(totpLockMs(9)).toBe(900_000);
    expect(totpLockMs(40)).toBe(900_000);
  });
});
