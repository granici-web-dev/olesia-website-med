/**
 * Who may have a paid material's file, and for how long.
 *
 * Three pure seams, no database and no Nest test module — the
 * `business-hours.spec.ts` model. Each one decides something that is expensive
 * to get wrong in the same direction: a grant that outlives its purchase, a
 * repeat purchase that invalidates a link already in somebody's inbox, or a
 * capability check that can be passed by guessing.
 */
import {
  GRANT_MAX_DOWNLOADS,
  GRANT_TTL_DAYS,
  extendGrant,
  grantUsable,
  intentMatches,
} from './material-grants.service';

const NOW = new Date('2026-09-11T10:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

const live = {
  expiresAt: new Date(NOW.getTime() + 10 * DAY_MS),
  downloadCount: 2,
  maxDownloads: GRANT_MAX_DOWNLOADS,
};

describe('grantUsable', () => {
  it('lets a live grant with downloads left through', () => {
    expect(grantUsable(live, NOW)).toBe(true);
  });

  it('refuses one that has expired', () => {
    expect(
      grantUsable({ ...live, expiresAt: new Date(NOW.getTime() - 1) }, NOW),
    ).toBe(false);
  });

  it('refuses one expiring exactly now', () => {
    expect(grantUsable({ ...live, expiresAt: NOW }, NOW)).toBe(false);
  });

  it('refuses the eleventh download', () => {
    expect(
      grantUsable({ ...live, downloadCount: GRANT_MAX_DOWNLOADS }, NOW),
    ).toBe(false);
  });

  it('refuses a count that has somehow gone past the maximum', () => {
    expect(
      grantUsable({ ...live, downloadCount: GRANT_MAX_DOWNLOADS + 3 }, NOW),
    ).toBe(false);
  });

  it('allows the tenth', () => {
    expect(
      grantUsable({ ...live, downloadCount: GRANT_MAX_DOWNLOADS - 1 }, NOW),
    ).toBe(true);
  });
});

describe('extendGrant', () => {
  it('pushes the expiry thirty days out from now, not from the old one', () => {
    expect(extendGrant(NOW).expiresAt).toEqual(
      new Date(NOW.getTime() + GRANT_TTL_DAYS * DAY_MS),
    );
  });

  it('puts the download counter back to zero', () => {
    expect(extendGrant(NOW).downloadCount).toBe(0);
  });

  it('does not touch the token, so a link already sent keeps working', () => {
    expect(Object.keys(extendGrant(NOW))).not.toContain('token');
  });
});

describe('intentMatches', () => {
  const key = 'b7f3c1d2-4e5a-6b7c-8d9e-0f1a2b3c4d5e';

  it('matches the key the purchase was opened with', () => {
    expect(intentMatches(key, key)).toBe(true);
  });

  it('refuses a different key of the same length', () => {
    expect(intentMatches(key, key.replace(/^b/, 'c'))).toBe(false);
  });

  it('refuses a shorter key without throwing', () => {
    expect(intentMatches(key, key.slice(0, 8))).toBe(false);
  });

  it('refuses a longer key without throwing', () => {
    expect(intentMatches(key, `${key}x`)).toBe(false);
  });

  it('refuses when the payment has no key recorded at all', () => {
    expect(intentMatches(null, key)).toBe(false);
  });
});
