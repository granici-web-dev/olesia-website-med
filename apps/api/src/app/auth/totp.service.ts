import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { generateSecret, generateURI, verifySync } from 'otplib';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import * as QRCode from 'qrcode';

import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../../generated/prisma/client';

/**
 * Two-factor authentication with TOTP (client answers v2 §10:
 * "autentificare în doi pași pentru contul de administrator").
 *
 * Shape of the flow:
 *   1. `startEnrolment` mints a secret and returns an otpauth:// URI + QR —
 *      the secret is stored but `totpEnabled` stays false, so a half-finished
 *      enrolment can never lock anyone out.
 *   2. `confirmEnrolment` requires a code from the app before flipping the
 *      flag, which proves the authenticator actually works, and returns the
 *      recovery codes **once**.
 *   3. At login, `verify` accepts either a 6-digit code or an unused recovery
 *      code; a used recovery code is deleted.
 *
 * Recovery codes are stored as argon2 hashes, never in clear: a database leak
 * must not hand over a way around the second factor.
 */

const ISSUER = 'Dr. Olesea Jalba';
const RECOVERY_CODE_COUNT = 8;
/** One 30s step of slack either way: phone clocks drift, and rejecting a code
 *  the user can still read on screen reads as "broken". */
const EPOCH_TOLERANCE_SECONDS = 30;

/**
 * otplib THROWS on anything that is not 6 digits ("Token must be 6 digits"),
 * and the same input may legitimately be a recovery code — so a malformed token
 * is simply "not a valid TOTP code" here, and the caller moves on to the
 * recovery codes instead of blowing up with a 500.
 */
const isValidCode = (secret: string, token: string): boolean => {
  try {
    return verifySync({ secret, token, epochTolerance: EPOCH_TOLERANCE_SECONDS }).valid;
  } catch {
    return false;
  }
};

export interface EnrolmentStart {
  /** Base32 secret, shown for manual entry when a QR cannot be scanned. */
  secret: string;
  otpauthUrl: string;
  /** PNG data URL, ready for an <img src>. */
  qrDataUrl: string;
}

@Injectable()
export class TotpService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Start (or restart) enrolment. Restarting an account that already has 2FA on
   * requires a current code: this method turns the flag off, so without that
   * check a stolen session could strip the second factor in one request.
   */
  async startEnrolment(userId: string, code?: string): Promise<EnrolmentStart> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('user_not_found');

    if (user.totpEnabled) {
      if (!code) throw new BadRequestException('totp_code_required');
      if (!(await this.verify(user, code))) {
        throw new BadRequestException('totp_invalid_code');
      }
    }

    const secret = generateSecret();
    const otpauthUrl = generateURI({ issuer: ISSUER, label: user.email, secret });

    await this.prisma.user.update({
      where: { id: userId },
      // The old recovery codes belong to the old secret; leaving them behind
      // would keep a way in that the new enrolment never handed out.
      data: { totpSecret: secret, totpEnabled: false, totpRecoveryCodes: [] },
    });

    return { secret, otpauthUrl, qrDataUrl: await QRCode.toDataURL(otpauthUrl) };
  }

  /**
   * @returns the recovery codes, in clear, for the only time they are ever
   * shown. Only their hashes are kept.
   */
  async confirmEnrolment(userId: string, code: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.totpSecret) {
      throw new BadRequestException('totp_not_started');
    }
    if (!isValidCode(user.totpSecret, code.trim())) {
      throw new BadRequestException('totp_invalid_code');
    }

    const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () =>
      randomBytes(5).toString('hex'),
    );
    const hashes = await Promise.all(codes.map((c) => argon2.hash(c)));

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpEnabled: true,
        totpEnabledAt: new Date(),
        totpRecoveryCodes: hashes,
      },
    });

    return codes;
  }

  /** Turn 2FA off. Requires a current code — a stolen session must not suffice. */
  async disable(userId: string, code: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.totpEnabled) throw new BadRequestException('totp_not_enabled');
    if (!(await this.verify(user, code))) {
      throw new BadRequestException('totp_invalid_code');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpEnabled: false,
        totpSecret: null,
        totpEnabledAt: null,
        totpRecoveryCodes: [],
      },
    });
  }

  /**
   * Accepts a TOTP code or a single-use recovery code. Consuming a recovery
   * code removes it, so it cannot be replayed.
   */
  async verify(user: User, code: string): Promise<boolean> {
    const candidate = code.replace(/\s+/g, '');
    if (!user.totpSecret) return false;

    if (isValidCode(user.totpSecret, candidate)) return true;

    for (const hash of user.totpRecoveryCodes) {
      if (await argon2.verify(hash, candidate.toLowerCase())) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            totpRecoveryCodes: user.totpRecoveryCodes.filter((h) => h !== hash),
          },
        });
        return true;
      }
    }

    return false;
  }

  /** Guard helper for the login flow. */
  async assertCode(user: User, code: string | undefined): Promise<void> {
    if (!code) throw new UnauthorizedException('totp_required');
    if (!(await this.verify(user, code))) {
      throw new UnauthorizedException('totp_invalid_code');
    }
  }
}
