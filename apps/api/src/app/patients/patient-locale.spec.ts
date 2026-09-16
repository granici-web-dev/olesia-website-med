import { Locale } from '../../generated/prisma/enums';

import { lastKnownLocale } from './patient-locale';

const at = (iso: string) => new Date(iso);

describe('lastKnownLocale', () => {
  it('takes the newest lead across all four tables', () => {
    expect(
      lastKnownLocale([
        { locale: Locale.ro, createdAt: at('2025-09-01T10:00:00Z') },
        null,
        { locale: Locale.ru, createdAt: at('2026-09-10T08:00:00Z') },
        { locale: Locale.en, createdAt: at('2026-03-01T08:00:00Z') },
      ]),
    ).toBe(Locale.ru);
  });

  it('does not depend on which table comes first', () => {
    expect(
      lastKnownLocale([
        null,
        null,
        { locale: Locale.ro, createdAt: at('2025-01-01T00:00:00Z') },
        { locale: Locale.en, createdAt: at('2026-01-01T00:00:00Z') },
      ]),
    ).toBe(Locale.en);
  });

  it('is null for a dossier nothing links to', () => {
    expect(lastKnownLocale([null, null, null, null])).toBeNull();
    expect(lastKnownLocale([])).toBeNull();
  });
});
