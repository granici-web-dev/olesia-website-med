import { verifySync } from 'otplib';

/**
 * One 30s step of slack either way: phone clocks drift, and rejecting a code
 * the user can still read on screen reads as "broken".
 */
const EPOCH_TOLERANCE_SECONDS = 30;

/**
 * Whether a token is the account's current TOTP code.
 *
 * otplib THROWS on anything that is not 6 digits ("Token must be 6 digits"),
 * and the same input may legitimately be a recovery code — so a malformed token
 * is simply "not a valid TOTP code" here, and the caller moves on to the
 * recovery codes instead of blowing up with a 500.
 */
export function isValidTotpCode(
  secret: string,
  token: string,
  epochSeconds?: number,
): boolean {
  try {
    return verifySync({
      secret,
      token,
      epochTolerance: EPOCH_TOLERANCE_SECONDS,
      ...(epochSeconds === undefined ? {} : { epoch: epochSeconds }),
    }).valid;
  } catch {
    return false;
  }
}
