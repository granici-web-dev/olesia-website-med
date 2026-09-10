import type { JwtService } from '@nestjs/jwt';

import type { RefreshTokenPayload } from './jwt.types';

/**
 * What a presented refresh token is allowed to do. Kept apart from the service
 * because the interesting cases (a token that was already rotated away, one
 * signed with a secret that is not ours, one whose session has expired) are
 * decided by rules, not by queries, and rules can be tested.
 */
export type RefreshDecision = 'rotate' | 'invalid_refresh' | 'refresh_reused';

/** The stored session, as far as the decision cares about it. */
export interface RefreshSessionFacts {
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  /** Set when the session was rotated into another one. */
  replacedById: string | null;
}

/** Read a refresh token, or null when it is expired, forged or malformed. */
export function readRefreshToken(
  jwt: JwtService,
  token: string,
  secret: string,
): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify<RefreshTokenPayload>(token, { secret });
    return payload.sub && payload.jti ? payload : null;
  } catch {
    return null;
  }
}

/**
 * A session that was rotated away and is presented again means the token was
 * copied: either the thief is using it or the owner is, and there is no way to
 * tell which, so every session of that user goes.
 *
 * A session revoked without a successor is a different story. It was ended on
 * purpose (logout, a password change), and replaying it must not take the
 * user's other devices down with it.
 */
export function decideRefresh(
  session: RefreshSessionFacts | null,
  payload: Pick<RefreshTokenPayload, 'sub'>,
  now: Date,
): RefreshDecision {
  if (!session || session.userId !== payload.sub) return 'invalid_refresh';
  if (session.revokedAt) {
    return session.replacedById ? 'refresh_reused' : 'invalid_refresh';
  }
  if (session.expiresAt.getTime() <= now.getTime()) return 'invalid_refresh';
  return 'rotate';
}
