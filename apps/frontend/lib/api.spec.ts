import { describe, expect, it } from 'vitest';
import type { PublicServiceDto } from '@olesia/shared';

import { serviceTag } from './api';

/**
 * `serviceTag` knew two languages and the site has three (audit A6, F11), so a
 * Russian reader was shown Romanian category tags above Russian titles. Every
 * branch is checked in every language for that reason, not for coverage.
 */
const service = (
  code: PublicServiceDto['code'],
  group: PublicServiceDto['group'] = 'A_booking',
): PublicServiceDto =>
  ({ code, group }) as PublicServiceDto;

describe('serviceTag', () => {
  const CODES: PublicServiceDto['code'][] = [
    'pediatric',
    'nutrition_copii',
    'nutrition_adulti',
    'integrative',
    'monitoring',
    'quick_question',
  ];

  it('answers in Russian for a Russian reader, on every code', () => {
    for (const code of CODES) {
      const ru = serviceTag('ru', service(code));
      expect(ru).not.toBe(serviceTag('ro', service(code)));
      expect(ru).toMatch(/[А-Яа-я]/);
    }
  });

  it('answers in English for an English reader, on every code', () => {
    for (const code of CODES) {
      expect(serviceTag('en', service(code))).not.toBe(
        serviceTag('ro', service(code)),
      );
    }
  });

  it('separates the two nutrition audiences in each language', () => {
    for (const locale of ['ro', 'en', 'ru']) {
      expect(serviceTag(locale, service('nutrition_copii'))).not.toBe(
        serviceTag(locale, service('nutrition_adulti')),
      );
    }
  });

  it('falls back on the group for a code it does not know', () => {
    expect(serviceTag('ru', service('free_consult', 'A_booking'))).toBe(
      'Видеоконсультация',
    );
    expect(serviceTag('ru', service('free_consult', 'B_portal'))).toBe(
      'Сопровождение',
    );
  });

  it('treats an unknown locale as Romanian', () => {
    expect(serviceTag('de', service('pediatric'))).toBe('Pediatrie');
  });
});
