import { describe, expect, it } from 'vitest';

import { describeLeadError, describeUploadError } from './form-errors';

/**
 * Every form answered every failure with the same sentence (audit A6, F14), so
 * what is pinned here is that the four cases a visitor can actually act on stay
 * distinguishable, in all three languages: wait a minute, reload for a fresh
 * captcha, fix the address, check the connection.
 *
 * The three-locale sweep is not ceremony. A missing branch does not throw — it
 * silently serves Romanian to a Russian reader, which is the failure mode
 * `AGENTS.md` R3 exists to prevent and the one nothing else here would catch.
 */
const LOCALES = ['ro', 'en', 'ru'] as const;

const distinctAcrossLocales = (of: (locale: string) => string) => {
  const said = LOCALES.map(of);
  expect(new Set(said).size).toBe(3);
  return said;
};

describe('describeLeadError', () => {
  it('says to wait after a rate limit, in each language', () => {
    const [ro, en, ru] = distinctAcrossLocales((l) => describeLeadError(429, '', l));
    expect(ro).toContain('minut');
    expect(en).toContain('minute');
    expect(ru).toContain('минут');
  });

  it('names the anti-spam check rather than a generic failure', () => {
    const [ro, en, ru] = distinctAcrossLocales((l) =>
      describeLeadError(403, 'captcha_failed', l),
    );
    expect(ro).toContain('spam');
    expect(en).toContain('spam');
    expect(ru).toContain('спам');
  });

  it('reads the code even when the status is an unexpected one', () => {
    expect(describeLeadError(400, 'captcha_failed', 'en')).toBe(
      describeLeadError(403, 'captcha_failed', 'en'),
    );
  });

  it('blames the connection only when the request never left', () => {
    const offline = describeLeadError(0, '', 'en');
    expect(offline).toContain('connection');
    expect(describeLeadError(500, '', 'en')).not.toBe(offline);
  });

  it('points at the fields on a rejected body', () => {
    expect(describeLeadError(400, '', 'en')).toContain('email address');
  });

  it('treats an unknown locale as Romanian', () => {
    expect(describeLeadError(429, '', 'de')).toBe(describeLeadError(429, '', 'ro'));
  });

  it('never answers with an empty string', () => {
    for (const status of [0, 400, 403, 404, 409, 429, 500, 502]) {
      for (const locale of LOCALES) {
        expect(describeLeadError(status, '', locale).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('describeUploadError', () => {
  it('names an oversized file from our own code', () => {
    expect(describeUploadError(400, 'file_too_large', 'ro')).toContain('prea mare');
  });

  it('names an oversized file from a proxy that only sent 413', () => {
    expect(describeUploadError(413, '', 'ro')).toBe(
      describeUploadError(400, 'file_too_large', 'ro'),
    );
  });

  it('names the wrong file type', () => {
    expect(describeUploadError(400, 'unsupported_file_type', 'en')).toContain('PDF');
  });

  it('names the file limit', () => {
    const [ro, en, ru] = distinctAcrossLocales((l) =>
      describeUploadError(400, 'too_many_files', l),
    );
    expect(ro).toContain('maxim');
    expect(en).toContain('maximum');
    expect(ru).toContain('лимит');
  });

  it('says the link is gone on 404', () => {
    expect(describeUploadError(404, '', 'en')).toContain('no longer valid');
  });

  it('asks for consent again on 403 rather than declaring the link dead', () => {
    expect(describeUploadError(403, 'consent_required', 'en')).not.toBe(
      describeUploadError(404, '', 'en'),
    );
    expect(describeUploadError(403, 'consent_required', 'en')).toContain('consent');
  });

  it('says to wait on 429', () => {
    expect(describeUploadError(429, '', 'en')).toContain('minute');
  });

  it('blames the connection when the request never left', () => {
    expect(describeUploadError(0, '', 'en')).toContain('connection');
  });

  it('never answers with an empty string', () => {
    for (const status of [0, 400, 403, 404, 413, 429, 500]) {
      for (const locale of LOCALES) {
        expect(describeUploadError(status, '', locale).length).toBeGreaterThan(0);
      }
    }
  });
});
