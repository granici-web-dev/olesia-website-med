/**
 * Per-product copy for the group-C deliverables, keyed by product code.
 *
 * Copywriting rather than data: these are not fields on anything, nothing in
 * the back office edits them, and they are read by both `/pricing` and the
 * checkout page — which is why they live here rather than in one of the two.
 * The price is not among them: it comes from `DELIVERABLE_CATALOG`, the same
 * constant the API stamps onto an order, so no two screens can quote different
 * numbers. Making group C editable from the back office is a separate step
 * (`PLAN.md` 8c), and it is where these would go.
 */
import type { DeliverableProduct } from '@olesia/shared';

import type { Bi } from './i18n-types';

export interface DeliverableCopy {
  tag: Bi;
  title: Bi;
  desc: Bi;
}

export const DELIVERABLE_COPY: Record<DeliverableProduct, DeliverableCopy> = {
  menu_7: {
    tag: { ro: 'Meniu', en: 'Menu', ru: 'Меню' },
    title: {
      ro: 'Meniu personalizat · 7 zile',
      en: 'Personalized menu · 7 days',
      ru: 'Персональное меню · 7 дней',
    },
    desc: {
      ro: 'Plan alimentar personalizat pe 7 zile, livrat în scris după un formular scurt.',
      en: 'A personalized 7-day meal plan, delivered in writing after a short form.',
      ru: 'Персональный план питания на 7 дней — присылается письменно после короткой формы.',
    },
  },
  menu_14: {
    tag: { ro: 'Meniu', en: 'Menu', ru: 'Меню' },
    title: {
      ro: 'Meniu personalizat · 14 zile',
      en: 'Personalized menu · 14 days',
      ru: 'Персональное меню · 14 дней',
    },
    desc: {
      ro: 'Plan alimentar personalizat pe 14 zile, cu variație și liste de cumpărături.',
      en: 'A personalized 14-day meal plan, with variety and shopping lists.',
      ru: 'Персональный план питания на 14 дней — с разнообразием и списками покупок.',
    },
  },
  menu_30: {
    tag: { ro: 'Meniu', en: 'Menu', ru: 'Меню' },
    title: {
      ro: 'Meniu personalizat · 30 zile',
      en: 'Personalized menu · 30 days',
      ru: 'Персональное меню · 30 дней',
    },
    desc: {
      ro: 'Plan alimentar personalizat pe 30 de zile, pentru obiective de durată.',
      en: 'A personalized 30-day meal plan, for longer-term goals.',
      ru: 'Персональный план питания на 30 дней — для долгосрочных целей.',
    },
  },
  protocol_pednutri: {
    tag: { ro: 'Protocol', en: 'Protocol', ru: 'Протокол' },
    title: {
      ro: 'Protocol individualizat pediatrico-nutrițional',
      en: 'Individual pediatric-nutrition protocol',
      ru: 'Индивидуальный педиатрическо-нутрициологический протокол',
    },
    desc: {
      ro: 'Protocol individualizat pe baza informațiilor și documentelor trimise, livrat în scris.',
      en: 'An individualized protocol built from the information and documents you send, delivered in writing.',
      ru: 'Индивидуальный протокол на основе присланных данных и документов — присылается письменно.',
    },
  },
  protocol_complementary: {
    tag: { ro: 'Protocol', en: 'Protocol', ru: 'Протокол' },
    title: {
      ro: 'Protocol individualizat · alimentație complementară (sugari)',
      en: 'Individual complementary-feeding protocol (infants)',
      ru: 'Индивидуальный протокол прикорма (для грудничков)',
    },
    desc: {
      ro: 'Protocol de diversificare individualizat pentru sugari, livrat în scris.',
      en: 'An individualized complementary-feeding protocol for infants, delivered in writing.',
      ru: 'Индивидуальный протокол введения прикорма для грудничков — присылается письменно.',
    },
  },
};
