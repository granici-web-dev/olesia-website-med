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
 * How long after a rotation the predecessor is merely stale rather than stolen.
 *
 * Two tabs of the panel restored at the same moment both post the cookie they
 * were loaded with; one wins the conditional update and the other arrives a
 * network round trip later carrying a token that is, by then, rotated away.
 * Reading that as theft signed the doctor out of her phone because she had
 * opened a second tab, which is a false alarm with a real cost. A thief, by
 * contrast, replays a token he had to obtain first, and ten seconds is not a
 * window anyone can aim at. Inside it the request is refused — the caller still
 * has to log in again — but the account's other sessions stand.
 */
export const REFRESH_GRACE_MS = 10_000;

/**
 * A session that was rotated away and is presented again long after the fact
 * means the token was copied: either the thief is using it or the owner is, and
 * there is no way to tell which, so every session of that user goes.
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
    if (!session.replacedById) return 'invalid_refresh';
    const sinceRotation = now.getTime() - session.revokedAt.getTime();
    return sinceRotation > REFRESH_GRACE_MS
      ? 'refresh_reused'
      : 'invalid_refresh';
  }
  if (session.expiresAt.getTime() <= now.getTime()) return 'invalid_refresh';
  return 'rotate';
}
