import { describe, expect, it } from 'vitest';

import {
  formatEur,
  formatPriceRange,
  formatServiceDuration,
  formatServicePrice,
  type PricedService,
} from './service-price';

const priced = (
  price: number,
  labels: Partial<
    Pick<PricedService, 'priceLabelRo' | 'priceLabelEn' | 'priceLabelRu'>
  > = {},
): PricedService => ({
  price,
  priceLabelRo: null,
  priceLabelEn: null,
  priceLabelRu: null,
  ...labels,
});

/** The catalog as seeded, so a change to it shows up here first. */
const PEDIATRIC = priced(28);
const NUTRITION = priced(38);
const INTEGRATIVE = priced(58);
const EXPRESS = priced(8);
const MONITORING = priced(0, {
  priceLabelRo: 'Preț la cerere',
  priceLabelEn: 'Price on request',
  priceLabelRu: 'Цена по запросу',
});

describe('formatEur', () => {
  it('renders every catalog price in all three locales', () => {
    for (const locale of ['ro', 'en', 'ru']) {
      expect(formatEur(locale, 8)).toBe('8 €');
      expect(formatEur(locale, 28)).toBe('28 €');
      expect(formatEur(locale, 38)).toBe('38 €');
      expect(formatEur(locale, 58)).toBe('58 €');
      expect(formatEur(locale, 0)).toBe('0 €');
    }
  });
});

describe('formatServicePrice', () => {
  it('renders a plain price as a number in euro', () => {
    expect(formatServicePrice('ro', PEDIATRIC)).toBe('28 €');
    expect(formatServicePrice('en', NUTRITION)).toBe('38 €');
    expect(formatServicePrice('ru', INTEGRATIVE)).toBe('58 €');
  });

  it('says "on request" in each language when the price is zero and unlabelled', () => {
    const free = priced(0);
    expect(formatServicePrice('ro', free)).toBe('la cerere');
    expect(formatServicePrice('en', free)).toBe('on request');
    expect(formatServicePrice('ru', free)).toBe('по запросу');
  });

  it('prefers the label the client typed over anything we would compile in', () => {
    expect(formatServicePrice('ro', MONITORING)).toBe('Preț la cerere');
    expect(formatServicePrice('en', MONITORING)).toBe('Price on request');
    expect(formatServicePrice('ru', MONITORING)).toBe('Цена по запросу');
  });

  it('falls back to Romanian when the client left the Russian label blank', () => {
    const partial = priced(0, {
      priceLabelRo: 'Preț la cerere',
      priceLabelEn: 'Price on request',
      priceLabelRu: null,
    });
    expect(formatServicePrice('ru', partial)).toBe('Preț la cerere');
  });

  it('treats a blank label as no label, the way the back office writes one', () => {
    const blank = priced(28, {
      priceLabelRo: '   ',
      priceLabelEn: '',
      priceLabelRu: '',
    });
    expect(formatServicePrice('ro', blank)).toBe('28 €');
    expect(formatServicePrice('en', blank)).toBe('28 €');
  });

  it('shows EXPRESS as a price, not as a duration', () => {
    expect(formatServicePrice('ro', EXPRESS)).toBe('8 €');
    expect(formatServicePrice('ru', EXPRESS)).toBe('8 €');
  });

  it('falls back to Romanian for a locale it does not know', () => {
    expect(formatServicePrice('de', priced(0))).toBe('la cerere');
    expect(formatServicePrice('de', PEDIATRIC)).toBe('28 €');
  });
});

describe('formatServiceDuration', () => {
  it('renders nothing when the service has no length', () => {
    expect(formatServiceDuration('ro', null)).toBeNull();
    expect(formatServiceDuration('ru', null)).toBeNull();
  });

  it('renders minutes in each language', () => {
    expect(formatServiceDuration('ro', 30)).toBe('30 min');
    expect(formatServiceDuration('en', 60)).toBe('60 min');
    expect(formatServiceDuration('ru', 90)).toBe('90 мин');
  });

  it('switches to hours at two hours', () => {
    expect(formatServiceDuration('ro', 120)).toBe('2 h');
    expect(formatServiceDuration('en', 180)).toBe('3 h');
    expect(formatServiceDuration('ru', 120)).toBe('2 ч');
  });

  it('falls back to Romanian for a locale it does not know', () => {
    expect(formatServiceDuration('de', 30)).toBe('30 min');
  });
});

describe('formatPriceRange', () => {
  it('renders the shared price when the merged services agree', () => {
    expect(formatPriceRange('ro', [NUTRITION, priced(38)])).toBe('38 €');
    expect(formatPriceRange('ru', [NUTRITION, priced(38)])).toBe('38 €');
  });

  it('says "from" the cheaper one once they diverge', () => {
    expect(formatPriceRange('ro', [priced(38), priced(45)])).toBe('de la 38 €');
    expect(formatPriceRange('en', [priced(45), priced(38)])).toBe('from 38 €');
    expect(formatPriceRange('ru', [priced(45), priced(38)])).toBe('от 38 €');
  });

  it('renders nothing when the API returned no services', () => {
    expect(formatPriceRange('ro', [])).toBeNull();
  });

  it('renders a single service as itself', () => {
    expect(formatPriceRange('ro', [PEDIATRIC])).toBe('28 €');
  });
});
