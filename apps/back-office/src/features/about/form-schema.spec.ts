import { describe, expect, it } from 'vitest';

import { aboutFormSchema } from '@/features/about/form-schema';

const FILLED = {
  titleRo: 'Despre mine',
  titleEn: 'About me',
  titleRu: '',
  contentRo: '# Salut',
  contentEn: '',
  contentRu: '',
  images: ['/uploads/a.webp'],
  stats: [{ value: '12', labelRo: 'ani', labelEn: 'years' }],
  credentials: [{ ro: 'USMF', en: 'USMF' }],
};

/**
 * The one page on the site the doctor writes entirely herself. Only the
 * Romanian title is required: the site falls back RU → RO, and a page held
 * back until three translations exist is a page that never ships.
 */
describe('aboutFormSchema', () => {
  it('accepts a page with only the Romanian title filled in', () => {
    expect(aboutFormSchema.safeParse(FILLED).success).toBe(true);
  });

  it('refuses an empty Romanian title', () => {
    const result = aboutFormSchema.safeParse({ ...FILLED, titleRo: '' });
    expect(result.success).toBe(false);
  });

  it('refuses a Romanian title that is only whitespace', () => {
    expect(
      aboutFormSchema.safeParse({ ...FILLED, titleRo: '   ' }).success,
    ).toBe(false);
  });

  it('leaves the Russian fields optional throughout', () => {
    const result = aboutFormSchema.safeParse({
      ...FILLED,
      stats: [{ value: '12', labelRo: 'ani', labelEn: 'years' }],
      credentials: [{ ro: 'USMF', en: 'USMF' }],
    });
    expect(result.success).toBe(true);
  });

  it('refuses a stat missing its Romanian label', () => {
    const result = aboutFormSchema.safeParse({
      ...FILLED,
      stats: [{ value: '12', labelEn: 'years' }],
    });
    expect(result.success).toBe(false);
  });
});
