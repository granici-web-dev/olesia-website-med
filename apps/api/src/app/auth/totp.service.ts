import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { generateSecret, generateURI } from 'otplib';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import * as QRCode from 'qrcode';

import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../../generated/prisma/client';
import { isValidTotpCode } from './totp-code';
import { totpLockMs } from './totp-lockout';

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

export interface EnrolmentStart {
  /** Base32 secret, shown for manual entry when a QR cannot be scanned. */
  secret: string;
  otpauthUrl: string;
  /** PNG data URL, ready for an <img src>. */
  qrDataUrl: string;
}

@Injectable()
export class TotpService {
  private readonly logger = new Logger(TotpService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Seconds until this account may try a code again; 0 when it may now. */
  lockRemainingSeconds(user: Pick<User, 'totpLockedUntil'>): number {
    if (!user.totpLockedUntil) return 0;
    const remaining = user.totpLockedUntil.getTime() - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

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
    if (!isValidTotpCode(user.totpSecret, code.trim())) {
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
   * code removes it, so it cannot be replayed, and the removal is conditional
   * on it still being there: two logins racing the same code leave only one
   * winner.
   *
   * Every path through here counts, so a wrong code is a wrong code whether it
   * arrived at login or at the 2FA settings page.
   */
  async verify(user: User, code: string): Promise<boolean> {
    this.assertNotLocked(user);
    if (!user.totpSecret) return false;

    const candidate = code.replace(/\s+/g, '');
    if (isValidTotpCode(user.totpSecret, candidate)) {
      await this.recordAttempt(user.id, true);
      return true;
    }

    for (const hash of user.totpRecoveryCodes) {
      if (!(await argon2.verify(hash, candidate.toLowerCase()))) continue;

      const consumed = await this.prisma.user.updateMany({
        where: { id: user.id, totpRecoveryCodes: { has: hash } },
        data: {
          totpRecoveryCodes: user.totpRecoveryCodes.filter((h) => h !== hash),
        },
      });
      if (consumed.count === 0) break;

      await this.recordAttempt(user.id, true);
      return true;
    }

    await this.recordAttempt(user.id, false);
    return false;
  }

  /**
   * Reset the second factor for someone who lost it. Admin-only, and never on
   * oneself: the point is that another person vouches for the recovery.
   */
  async resetFor(targetUserId: string, byUserId: string): Promise<void> {
    if (targetUserId === byUserId) {
      throw new BadRequestException('cannot_reset_own_totp');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) throw new BadRequestException('user_not_found');

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        totpEnabled: false,
        totpSecret: null,
        totpEnabledAt: null,
        totpRecoveryCodes: [],
        totpFailedCount: 0,
        totpLockedUntil: null,
      },
    });
    // Ids, not emails: this line ends up in whatever collects the logs.
    this.logger.warn(`2FA reset for user ${targetUserId} by ${byUserId}.`);
  }

  private async recordAttempt(userId: string, success: boolean): Promise<void> {
    if (success) {
      await this.prisma.user.updateMany({
        where: { id: userId, OR: [{ totpFailedCount: { gt: 0 } }, { totpLockedUntil: { not: null } }] },
        data: { totpFailedCount: 0, totpLockedUntil: null },
      });
      return;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { totpFailedCount: { increment: 1 } },
    });
    const delay = totpLockMs(user.totpFailedCount);
    if (delay > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { totpLockedUntil: new Date(Date.now() + delay) },
      });
    }
  }

  /**
   * Guard helper for the login flow.
   *
   * The lock is tested before the code is asked for. The other order answered a
   * locked account `totp_required`, so the panel opened an empty code field
   * with no timer and the doctor typed fresh codes into a form that could not
   * accept one — and every one of those attempts pushed the lock further out
   * (corrected 2026-09-11).
   */
  async assertCode(user: User, code: string | undefined): Promise<void> {
    this.assertNotLocked(user);
    if (!code) throw new UnauthorizedException('totp_required');
    if (!(await this.verify(user, code))) {
      throw new UnauthorizedException('totp_invalid_code');
    }
  }

  /**
   * 429 with the time the account has left to serve, or nothing when it may
   * try now. The status and the `retryAfterSeconds` field are what the panel
   * reads to show a counting-down timer instead of "wrong code".
   */
  private assertNotLocked(user: Pick<User, 'totpLockedUntil'>): void {
    const retryAfterSeconds = this.lockRemainingSeconds(user);
    if (retryAfterSeconds === 0) return;
    throw new HttpException(
      { statusCode: HttpStatus.TOO_MANY_REQUESTS, message: 'totp_locked', retryAfterSeconds },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
