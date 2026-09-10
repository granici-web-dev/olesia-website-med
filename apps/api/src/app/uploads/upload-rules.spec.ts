import {
  isLinkUsable,
  isPurgeableLink,
  retentionCutoff,
  safeFileName,
} from './upload-rules';

/**
 * The rules that decide who reaches a patient's analyses and when those
 * analyses stop existing. Both are cheap to get wrong in a way nobody notices
 * until it matters, so they are pinned here as pure functions — no database,
 * no Nest, in the shape `business-hours.spec.ts` established.
 */

const NOW = new Date('2026-09-10T12:00:00Z');
const days = (n: number) => new Date(NOW.getTime() + n * 24 * 60 * 60 * 1000);

describe('isLinkUsable', () => {
  it('accepts a link that has not expired and was not revoked', () => {
    expect(isLinkUsable({ expiresAt: days(1), revokedAt: null }, NOW)).toBe(true);
  });

  it('rejects an unknown token, which arrives as null', () => {
    expect(isLinkUsable(null, NOW)).toBe(false);
  });

  it('rejects an expired link', () => {
    expect(isLinkUsable({ expiresAt: days(-1), revokedAt: null }, NOW)).toBe(
      false,
    );
  });

  it('rejects a revoked link even while it is still in date', () => {
    expect(isLinkUsable({ expiresAt: days(30), revokedAt: NOW }, NOW)).toBe(
      false,
    );
  });

  it('rejects a link that expires exactly now', () => {
    expect(isLinkUsable({ expiresAt: NOW, revokedAt: null }, NOW)).toBe(false);
  });
});

describe('retention', () => {
  it('counts a document older than the retention period as past it', () => {
    const uploadedAt = days(-181);
    expect(uploadedAt.getTime()).toBeLessThan(retentionCutoff(NOW, 180).getTime());
  });

  it('leaves a document inside the retention period alone', () => {
    const uploadedAt = days(-179);
    expect(uploadedAt.getTime()).toBeGreaterThan(
      retentionCutoff(NOW, 180).getTime(),
    );
  });
});

describe('isPurgeableLink', () => {
  it('deletes a long-expired link that holds nothing', () => {
    expect(
      isPurgeableLink({ expiresAt: days(-181), documentCount: 0 }, NOW, 180),
    ).toBe(true);
  });

  it('keeps a long-expired link that still holds documents', () => {
    expect(
      isPurgeableLink({ expiresAt: days(-181), documentCount: 2 }, NOW, 180),
    ).toBe(false);
  });

  it('keeps an empty link that expired recently', () => {
    expect(
      isPurgeableLink({ expiresAt: days(-1), documentCount: 0 }, NOW, 180),
    ).toBe(false);
  });
});

describe('safeFileName', () => {
  it('keeps an ordinary name', () => {
    expect(safeFileName('analize-mai.pdf')).toBe('analize-mai.pdf');
  });

  it('neutralises path separators', () => {
    expect(safeFileName('../../etc/passwd')).toBe('.._.._etc_passwd');
    expect(safeFileName('C:\\Users\\ana\\analize.pdf')).toBe(
      'C:_Users_ana_analize.pdf',
    );
  });

  it('strips newlines, which would otherwise reach a response header', () => {
    expect(safeFileName('analize\r\nX-Injected: 1.pdf')).toBe(
      'analizeX-Injected:_1.pdf',
    );
  });

  it('strips the right-to-left override that disguises an extension', () => {
    expect(safeFileName('analize\u202Efdp.exe')).toBe('analizefdp.exe');
  });

  it('falls back when the name is missing or empties out', () => {
    expect(safeFileName(undefined)).toBe('document');
    expect(safeFileName('   ')).toBe('document');
    expect(safeFileName('\u0000')).toBe('document');
  });

  it('caps the length at 120 characters', () => {
    expect(safeFileName(`${'a'.repeat(300)}.pdf`)).toHaveLength(120);
  });
});
