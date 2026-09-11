import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

import { TotpService } from './totp.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { User } from '../../generated/prisma/client';

/**
 * The order of the two refusals `assertCode` can hand back at login.
 *
 * A locked account used to be told `totp_required` when it had not yet sent a
 * code, because the lock was only tested inside `verify`. The panel reads the
 * 429 and its `retryAfterSeconds` to show a counting-down timer; reading a 401
 * instead it opened an empty code field, so the doctor typed fresh codes into a
 * form that could not accept one and every attempt pushed the lock further out.
 *
 * The lock is decided from a column the caller already holds, so this path must
 * not reach the database. A client that throws on any access is what makes that
 * part of the assertion rather than a claim in a comment — and it is the reason
 * the cast below is here, not a mocked Prisma (`TESTING.md`).
 */
const noDatabase = new Proxy(
  {},
  {
    get() {
      throw new Error('the lock decision must not touch the database');
    },
  },
) as unknown as PrismaService;

function userWith(overrides: Partial<User>): User {
  return {
    id: 'aa0e8400-e29b-41d4-a716-446655440000',
    email: 'doctor@example.test',
    passwordHash: 'argon2-hash',
    name: 'Olesea',
    role: 'admin',
    isActive: true,
    mustChangePassword: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    totpSecret: 'JBSWY3DPEHPK3PXP',
    totpEnabled: true,
    totpEnabledAt: new Date('2026-01-01T00:00:00Z'),
    totpRecoveryCodes: [],
    totpFailedCount: 5,
    totpLockedUntil: null,
    ...overrides,
  };
}

describe('TotpService.assertCode', () => {
  const totp = new TotpService(noDatabase);

  it('reports the lock before asking for a code', async () => {
    const locked = userWith({ totpLockedUntil: new Date(Date.now() + 42_000) });

    await expect(totp.assertCode(locked, undefined)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
      response: { message: 'totp_locked', retryAfterSeconds: 42 },
    });
  });

  it('reports the lock rather than a wrong code when one was sent', async () => {
    const locked = userWith({ totpLockedUntil: new Date(Date.now() + 42_000) });

    await expect(totp.assertCode(locked, '000000')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('asks for a code once the lock has run out', async () => {
    const free = userWith({ totpLockedUntil: new Date(Date.now() - 1_000) });

    await expect(totp.assertCode(free, undefined)).rejects.toThrow(
      new UnauthorizedException('totp_required'),
    );
  });

  it('asks for a code when the account was never locked', async () => {
    await expect(totp.assertCode(userWith({}), undefined)).rejects.toThrow(
      new UnauthorizedException('totp_required'),
    );
  });
});
