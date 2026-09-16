/**
 * What the site is allowed to know about a group-C product.
 *
 * One difference to pin: `active` is not in the public payload. It is the flag
 * audit A4 found four readers of `/services` supposed to filter on and three
 * ignoring, so a withdrawn product must not be able to reach a page that
 * forgot — it is absent from the payload rather than false in it.
 *
 * The three titles are asserted together because a menu the Russian reader
 * sees in Romanian is the defect the NOT NULL column exists to prevent.
 */
import type { DeliverableCatalog } from '../../generated/prisma/client';
import {
  toDeliverableCatalogDto,
  toPublicDeliverableCatalogDto,
} from './deliverables.mapper';

const MENU_7: DeliverableCatalog = {
  code: 'menu_7',
  priceEur: 28,
  titleRo: 'Meniu personalizat · 7 zile',
  titleEn: 'Personalized menu · 7 days',
  titleRu: 'Персональное меню · 7 дней',
  sortOrder: 1,
  active: true,
  updatedAt: new Date('2026-09-16T10:00:00.000Z'),
};

describe('toDeliverableCatalogDto', () => {
  it('gives the back office the whole row without the timestamp', () => {
    expect(toDeliverableCatalogDto(MENU_7)).toEqual({
      code: 'menu_7',
      priceEur: 28,
      titleRo: 'Meniu personalizat · 7 zile',
      titleEn: 'Personalized menu · 7 days',
      titleRu: 'Персональное меню · 7 дней',
      sortOrder: 1,
      active: true,
    });
  });

  it('keeps a withdrawn product visible to the back office', () => {
    expect(toDeliverableCatalogDto({ ...MENU_7, active: false }).active).toBe(
      false,
    );
  });
});

describe('toPublicDeliverableCatalogDto', () => {
  it('withholds `active` rather than serving it false', () => {
    const published = toPublicDeliverableCatalogDto(MENU_7);
    expect(published).not.toHaveProperty('active');
  });

  it('serves all three titles', () => {
    expect(toPublicDeliverableCatalogDto(MENU_7)).toEqual({
      code: 'menu_7',
      priceEur: 28,
      titleRo: 'Meniu personalizat · 7 zile',
      titleEn: 'Personalized menu · 7 days',
      titleRu: 'Персональное меню · 7 дней',
      sortOrder: 1,
    });
  });
});
