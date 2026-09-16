/**
 * The group-C catalog (brief §2): the personalized menus and written protocols
 * sold from /pricing.
 *
 * These five rows were `DELIVERABLE_CATALOG` in `packages/shared` until
 * `PLAN.md` step 18 moved them into the database, so the client can change a
 * price or a name without a deployment
 * (`docs/shape-deliverable-catalog.md`). Unlike the library catalog beside it,
 * none of this is placeholder copy: the prices are the ones the site has been
 * charging and the titles are the ones it has been showing, lifted from
 * `apps/frontend/lib/deliverable-content.ts`.
 *
 * The codes are the `DeliverableProduct` enum and are not seed data: a sixth
 * product is a schema change, a new page and a new checkout, which is what
 * decision 8c settled.
 */

export interface SeedDeliverable {
  code:
    | 'menu_7'
    | 'menu_14'
    | 'menu_30'
    | 'protocol_pednutri'
    | 'protocol_complementary';
  priceEur: number;
  titleRo: string;
  titleEn: string;
  titleRu: string;
  sortOrder: number;
}

export const DELIVERABLES: SeedDeliverable[] = [
  {
    code: 'menu_7',
    priceEur: 28,
    titleRo: 'Meniu personalizat · 7 zile',
    titleEn: 'Personalized menu · 7 days',
    titleRu: 'Персональное меню · 7 дней',
    sortOrder: 1,
  },
  {
    code: 'menu_14',
    priceEur: 48,
    titleRo: 'Meniu personalizat · 14 zile',
    titleEn: 'Personalized menu · 14 days',
    titleRu: 'Персональное меню · 14 дней',
    sortOrder: 2,
  },
  {
    code: 'menu_30',
    priceEur: 88,
    titleRo: 'Meniu personalizat · 30 zile',
    titleEn: 'Personalized menu · 30 days',
    titleRu: 'Персональное меню · 30 дней',
    sortOrder: 3,
  },
  {
    code: 'protocol_pednutri',
    priceEur: 98,
    titleRo: 'Protocol individualizat pediatrico-nutrițional',
    titleEn: 'Individual pediatric-nutrition protocol',
    titleRu: 'Индивидуальный педиатрическо-нутрициологический протокол',
    sortOrder: 4,
  },
  {
    code: 'protocol_complementary',
    priceEur: 98,
    titleRo: 'Protocol individualizat · alimentație complementară (sugari)',
    titleEn: 'Individual complementary-feeding protocol (infants)',
    titleRu: 'Индивидуальный протокол прикорма (для грудничков)',
    sortOrder: 5,
  },
];
