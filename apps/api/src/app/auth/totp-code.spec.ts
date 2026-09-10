import { generateSync } from 'otplib';

import { isValidTotpCode } from './totp-code';

/**
 * The tolerance window. Too narrow and a code the user can still read on screen
 * is refused; too wide and a code stays usable long after it was shoulder-read.
 * Both failures are invisible without a test that pins the seconds.
 */

const SECRET = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP';
const AT = 1_789_000_000; // a fixed second, so the assertions do not drift
const STEP = 30;

const codeAt = (epoch: number) => generateSync({ secret: SECRET, epoch });

describe('isValidTotpCode', () => {
  it('accepts the code for the current step', () => {
    expect(isValidTotpCode(SECRET, codeAt(AT), AT)).toBe(true);
  });

  it('accepts the previous step: the user started typing before it rolled', () => {
    expect(isValidTotpCode(SECRET, codeAt(AT - STEP), AT)).toBe(true);
  });

  it('accepts the next step, for a phone whose clock runs fast', () => {
    expect(isValidTotpCode(SECRET, codeAt(AT + STEP), AT)).toBe(true);
  });

  it('refuses a code two steps old', () => {
    expect(isValidTotpCode(SECRET, codeAt(AT - 2 * STEP), AT)).toBe(false);
  });

  it('refuses a code two steps ahead', () => {
    expect(isValidTotpCode(SECRET, codeAt(AT + 2 * STEP), AT)).toBe(false);
  });

  it('refuses a code minted from another secret', () => {
    const other = generateSync({
      secret: 'KRSXG5CTMVRXEZLUKRSXG5CTMVRXEZLU',
      epoch: AT,
    });
    expect(isValidTotpCode(SECRET, other, AT)).toBe(false);
  });

  it('treats a recovery code as simply not a TOTP code, rather than throwing', () => {
    // otplib rejects anything that is not six digits by throwing, and the same
    // input may legitimately be a recovery code the caller checks next.
    expect(isValidTotpCode(SECRET, 'bd53870c75', AT)).toBe(false);
    expect(isValidTotpCode(SECRET, '', AT)).toBe(false);
  });
});
