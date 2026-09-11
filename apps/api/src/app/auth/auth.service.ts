import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../../generated/prisma/client';
import type { AccessTokenPayload, RefreshTokenPayload } from './jwt.types';
import { decideRefresh, readRefreshToken } from './refresh-rules';
import { ttlToMs } from './token-ttl';

/**
 * An argon2 hash of a string nobody knows, verified against when the email
 * does not exist. Without it the "no such user" answer comes back in a few
 * milliseconds and the "wrong password" answer in thirty, which tells an
 * attacker which addresses have accounts.
 */
const ABSENT_USER_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$L/WYUUpgVrnwiuKoFWgfxg$Rt4wWCL7Y5XXZ5aYNeVXXbzejfEcpMvyaZ6IgbQT5NE';

const accessSecret = () => process.env.JWT_ACCESS_SECRET as string;
const refreshSecret = () => process.env.JWT_REFRESH_SECRET as string;
const refreshTtl = () => process.env.JWT_REFRESH_TTL ?? '7d';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Verify email + password; throws on bad/blocked credentials. */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user || !user.isActive) {
      await argon2.verify(ABSENT_USER_HASH, password);
      throw new UnauthorizedException('invalid_credentials');
    }
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedException('invalid_credentials');
    }
    return user;
  }

  /**
   * Issue an access token and a refresh token, recording the refresh token as
   * a session so it can be ended before it expires.
   */
  async issueTokens(
    user: Pick<User, 'id' | 'email' | 'role'>,
    /** `sessionId` is pre-allocated by `rotate`, which records it before the
     *  new session exists so that the hand-over is a single write. */
    context: { userAgent?: string; sessionId?: string } = {},
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await this.prisma.refreshSession.create({
      data: {
        id: context.sessionId,
        userId: user.id,
        expiresAt: new Date(Date.now() + ttlToMs(refreshTtl())),
        userAgent: context.userAgent?.slice(0, 200) ?? null,
      },
    });

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      jti: session.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: accessSecret(),
        expiresIn: (process.env.JWT_ACCESS_TTL ??
          '15m') as JwtSignOptions['expiresIn'],
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: refreshSecret(),
        expiresIn: refreshTtl() as JwtSignOptions['expiresIn'],
      }),
    ]);
    return { accessToken, refreshToken };
  }

  /**
   * Exchange a refresh token for a new pair, retiring the one presented.
   *
   * The retirement is a conditional update, so two requests carrying the same
   * token cannot both succeed. What the loser is treated as depends on how late
   * it is: inside `REFRESH_GRACE_MS` it is a second tab, after that it is a
   * replay and every session of the account goes.
   */
  async rotate(
    refreshToken: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    mustChangePassword: boolean;
  }> {
    const payload = readRefreshToken(this.jwt, refreshToken, refreshSecret());
    if (!payload) throw new UnauthorizedException('invalid_refresh');

    const nextSessionId = randomUUID();
    const claimed = await this.prisma.refreshSession.updateMany({
      where: {
        id: payload.jti,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { revokedAt: new Date(), replacedById: nextSessionId },
    });

    if (claimed.count === 0) {
      const session = await this.prisma.refreshSession.findUnique({
        where: { id: payload.jti },
      });
      const decision = decideRefresh(session, payload, new Date());
      if (decision === 'refresh_reused') {
        await this.revokeAllSessions(session!.userId);
      }
      throw new UnauthorizedException(decision);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('invalid_refresh');
    }

    return {
      ...(await this.issueTokens(user, {
        userAgent,
        sessionId: nextSessionId,
      })),
      mustChangePassword: user.mustChangePassword,
    };
  }

  /** End the session behind a refresh token. Unknown tokens are not an error. */
  async endSession(refreshToken: string): Promise<void> {
    const payload = readRefreshToken(this.jwt, refreshToken, refreshSecret());
    // Logging out with a token we cannot read still clears the cookie; there is
    // nothing to revoke and nothing the caller could do about it.
    if (!payload) return;

    await this.prisma.refreshSession.updateMany({
      where: { id: payload.jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Change one's own password, then take every other session with it: the
   * reason to change a password is that somebody else might know the old one.
   * The caller keeps working, on a freshly issued pair.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await argon2.verify(user.passwordHash, currentPassword))) {
      throw new UnauthorizedException('invalid_credentials');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: await argon2.hash(newPassword),
          mustChangePassword: false,
        },
      }),
      this.prisma.refreshSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return this.issueTokens(user, { userAgent });
  }

  /**
   * Revoke every live session of a user, optionally sparing one. Called
   * wherever the password changes: the point of changing it is that whoever
   * had the old one is out.
   */
  async revokeAllSessions(userId: string, exceptId?: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptId ? { NOT: { id: exceptId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  }
}
