/**
 * Shared child-age taxonomy (brief §8). One source of truth for the age filter
 * used across the Digital Library (materials) and, later, the blog/articles.
 * Keys are stable; labels are trilingual (RO default · EN · RU).
 */

import type { Bi } from './i18n-types';

export type { Bi };

export interface AgeGroup {
  key: string;
  label: Bi;
}

export const AGE_GROUPS: AgeGroup[] = [
  { key: '0-6m', label: { ro: '0–6 luni', en: '0–6 months', ru: '0–6 мес' } },
  {
    key: '6-12m',
    label: { ro: '6–12 luni', en: '6–12 months', ru: '6–12 мес' },
  },
  { key: '1-3y', label: { ro: '1–3 ani', en: '1–3 years', ru: '1–3 года' } },
  { key: '3-6y', label: { ro: '3–6 ani', en: '3–6 years', ru: '3–6 лет' } },
  {
    key: '6-12y',
    label: {
      ro: '6–12 ani (școlar)',
      en: '6–12 years (school)',
      ru: '6–12 лет (школа)',
    },
  },
  {
    key: 'adolescent',
    label: { ro: 'Adolescent', en: 'Teen', ru: 'Подросток' },
  },
];
