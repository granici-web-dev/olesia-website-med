/**
 * Deferred publication existed only in the editor's head until 2026-09-10
 * (audit A4, F2): the public list asked for `status: 'published'` and nothing
 * else, so an article dated next spring was already on the site and, because
 * NULL and the far future both sort first under `publishedAt DESC`, at the top
 * of it. This pins the boundary, "exactly now" included.
 */
import { isPubliclyVisible } from './post-visibility';

const NOW = new Date('2026-09-10T12:00:00.000Z');

describe('a post the public may read', () => {
  it('is published and dated in the past', () => {
    expect(
      isPubliclyVisible('published', new Date('2026-09-01T00:00:00.000Z'), NOW),
    ).toBe(true);
  });

  it('is visible at the exact moment it is due', () => {
    expect(isPubliclyVisible('published', new Date(NOW), NOW)).toBe(true);
  });

  it('is not visible one millisecond early', () => {
    expect(
      isPubliclyVisible('published', new Date(NOW.getTime() + 1), NOW),
    ).toBe(false);
  });

  it('is not visible while its date is in the future', () => {
    expect(
      isPubliclyVisible('published', new Date('2030-01-01T00:00:00.000Z'), NOW),
    ).toBe(false);
  });

  it('is not visible with no date at all', () => {
    expect(isPubliclyVisible('published', null, NOW)).toBe(false);
  });

  it('is not visible while it is a draft, whatever its date says', () => {
    expect(
      isPubliclyVisible('draft', new Date('2020-01-01T00:00:00.000Z'), NOW),
    ).toBe(false);
  });
});
