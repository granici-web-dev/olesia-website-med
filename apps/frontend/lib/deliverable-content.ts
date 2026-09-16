/**
 * Per-product marketing copy for the group-C deliverables, keyed by product
 * code: the category tag and the paragraph under the title.
 *
 * Copywriting rather than data. Neither string carries a number, so neither
 * goes stale when the client changes a price, and both are read by `/pricing`
 * and the checkout page — which is why they live here rather than in one of
 * the two.
 *
 * The title is NOT here. It is a column on `DeliverableCatalog` and comes off
 * the API with the price, because the back office edits it (`PLAN.md` step 18)
 * and two sources for one string is how they drift apart.
 */
import type { DeliverableProduct } from '@olesia/shared';

import type { Bi } from './i18n-types';

export interface DeliverableCopy {
  tag: Bi;
  desc: Bi;
}

export const DELIVERABLE_COPY: Record<DeliverableProduct, DeliverableCopy> = {
  menu_7: {
    tag: { ro: 'Meniu', en: 'Menu', ru: 'Меню' },
    desc: {
      ro: 'Plan alimentar personalizat pe 7 zile, livrat în scris după un formular scurt.',
      en: 'A personalized 7-day meal plan, delivered in writing after a short form.',
      ru: 'Персональный план питания на 7 дней — присылается письменно после короткой формы.',
    },
  },
  menu_14: {
    tag: { ro: 'Meniu', en: 'Menu', ru: 'Меню' },
    desc: {
      ro: 'Plan alimentar personalizat pe 14 zile, cu variație și liste de cumpărături.',
      en: 'A personalized 14-day meal plan, with variety and shopping lists.',
      ru: 'Персональный план питания на 14 дней — с разнообразием и списками покупок.',
    },
  },
  menu_30: {
    tag: { ro: 'Meniu', en: 'Menu', ru: 'Меню' },
    desc: {
      ro: 'Plan alimentar personalizat pe 30 de zile, pentru obiective de durată.',
      en: 'A personalized 30-day meal plan, for longer-term goals.',
      ru: 'Персональный план питания на 30 дней — для долгосрочных целей.',
    },
  },
  protocol_pednutri: {
    tag: { ro: 'Protocol', en: 'Protocol', ru: 'Протокол' },
    desc: {
      ro: 'Protocol individualizat pe baza informațiilor și documentelor trimise, livrat în scris.',
      en: 'An individualized protocol built from the information and documents you send, delivered in writing.',
      ru: 'Индивидуальный протокол на основе присланных данных и документов — присылается письменно.',
    },
  },
  protocol_complementary: {
    tag: { ro: 'Protocol', en: 'Protocol', ru: 'Протокол' },
    desc: {
      ro: 'Protocol de diversificare individualizat pentru sugari, livrat în scris.',
      en: 'An individualized complementary-feeding protocol for infants, delivered in writing.',
      ru: 'Индивидуальный протокол введения прикорма для грудничков — присылается письменно.',
    },
  },
};
