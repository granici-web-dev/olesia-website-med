import { JwtService } from '@nestjs/jwt';

import { decideRefresh, readRefreshToken } from './refresh-rules';

/**
 * What a refresh token is allowed to do. The expensive mistakes here are quiet
 * ones: a forged token accepted, or a stolen one that nothing notices being
 * replayed, so both are pinned against a real JwtService with no Nest module
 * and no database behind it.
 */

const jwt = new JwtService({});
const SECRET = 'a-secret-long-enough-to-pass-the-boot-check';
const OTHER_SECRET = 'a-different-secret-long-enough-to-pass-too';

const sign = (payload: object, expiresIn = '7d') =>
  jwt.sign(payload, { secret: SECRET, expiresIn });

const NOW = new Date('2026-09-10T12:00:00Z');
const minutes = (n: number) => new Date(NOW.getTime() + n * 60_000);

describe('readRefreshToken', () => {
  it('reads a token we issued', () => {
    const token = sign({ sub: 'user-1', jti: 'session-1' });
    expect(readRefreshToken(jwt, token, SECRET)).toMatchObject({
      sub: 'user-1',
      jti: 'session-1',
    });
  });

  it('refuses a token signed with somebody else’s secret', () => {
    const forged = jwt.sign(
      { sub: 'user-1', jti: 'session-1' },
      { secret: OTHER_SECRET, expiresIn: '7d' },
    );
    expect(readRefreshToken(jwt, forged, SECRET)).toBeNull();
  });

  it('refuses an expired token', () => {
    const stale = sign({ sub: 'user-1', jti: 'session-1' }, '-1s');
    expect(readRefreshToken(jwt, stale, SECRET)).toBeNull();
  });

  it('refuses a token from before sessions existed, which carries no jti', () => {
    expect(readRefreshToken(jwt, sign({ sub: 'user-1' }), SECRET)).toBeNull();
  });

  it('refuses something that is not a token at all', () => {
    expect(readRefreshToken(jwt, 'olesia_rt=nonsense', SECRET)).toBeNull();
  });
});

describe('decideRefresh', () => {
  const live = {
    userId: 'user-1',
    expiresAt: minutes(60),
    revokedAt: null,
    replacedById: null,
  };

  it('rotates a live session', () => {
    expect(decideRefresh(live, { sub: 'user-1' }, NOW)).toBe('rotate');
  });

  it('rejects a token whose session is unknown', () => {
    expect(decideRefresh(null, { sub: 'user-1' }, NOW)).toBe('invalid_refresh');
  });

  it('rejects a session belonging to another user', () => {
    expect(decideRefresh(live, { sub: 'user-2' }, NOW)).toBe('invalid_refresh');
  });

  it('rejects a session that has expired', () => {
    expect(
      decideRefresh({ ...live, expiresAt: minutes(-1) }, { sub: 'user-1' }, NOW),
    ).toBe('invalid_refresh');
  });

  it('calls a rotated-away session reuse', () => {
    expect(
      decideRefresh(
        { ...live, revokedAt: minutes(-5), replacedById: 'session-2' },
        { sub: 'user-1' },
        NOW,
      ),
    ).toBe('refresh_reused');
  });

  it('does not call a logged-out session reuse: it has no successor', () => {
    // Otherwise signing out on one device would end the sessions on all the
    // others the moment the dead cookie was replayed.
    expect(
      decideRefresh(
        { ...live, revokedAt: minutes(-5) },
        { sub: 'user-1' },
        NOW,
      ),
    ).toBe('invalid_refresh');
  });
});
