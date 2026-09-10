/**
 * `slugify` lives in `packages/shared` because three copies of it did not
 * agree (audit A4, F12) — materials and FAQ in this API, and a third in the
 * back office that folded `â` but not the cedilla `ş`, so the panel previewed
 * one slug and the server stored another. The spec sits here because the API's
 * Jest is the only runner in the tree that sees the shared package.
 */
import { SLUG_PATTERN, slugify } from '@olesia/shared';

describe('slugify', () => {
  it('folds both spellings of every Romanian diacritic', () => {
    expect(slugify('Urgențe pediatrice')).toBe('urgente-pediatrice');
    expect(slugify('Urgenţe pediatrice')).toBe('urgente-pediatrice');
    expect(slugify('Alimentație și somn')).toBe('alimentatie-si-somn');
    expect(slugify('Întrebări câștigate')).toBe('intrebari-castigate');
  });

  it('collapses runs of separators into one hyphen', () => {
    expect(slugify('Somn  —  copii / adulți')).toBe('somn-copii-adulti');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  ...Nutriție!  ')).toBe('nutritie');
  });

  it('returns nothing for a title we cannot transliterate', () => {
    expect(slugify('Питание и сон')).toBe('');
  });

  it('returns the caller-supplied fallback instead of nothing', () => {
    expect(slugify('Питание и сон', 'categorie')).toBe('categorie');
  });

  it('leaves a slug that is already one alone', () => {
    expect(slugify('ghid-diversificare')).toBe('ghid-diversificare');
  });

  it('produces what the stored-slug pattern accepts', () => {
    for (const title of [
      'Urgențe pediatrice',
      '  ...Nutriție!  ',
      'Somn  —  copii / adulți',
    ]) {
      expect(SLUG_PATTERN.test(slugify(title))).toBe(true);
    }
  });

  it('rejects the shapes the pattern exists to keep out', () => {
    for (const bad of [
      '../../etc/passwd',
      'Ghid Nou',
      '-leading',
      'trailing-',
    ]) {
      expect(SLUG_PATTERN.test(bad)).toBe(false);
    }
  });
});
