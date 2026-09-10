/**
 * Contact blocks shown publicly on the site.
 *
 * The wire shapes are the DTOs in `@olesia/shared`; `api.ts` maps them into
 * the view types below. That layer is deliberate, not a placeholder — it is
 * where a shared enum gets narrowed to what this UI actually renders.
 * Mirrors the `Contact` model in module_calendly.md §9.
 */

export type ContactType = 'phone' | 'email' | 'address' | 'social' | 'other';

export interface Contact {
  id: string;
  type: ContactType;
  labelRo: string;
  labelEn: string;
  labelRu: string | null;
  value: string;
  sortOrder: number;
  active: boolean;
}

export type ContactInput = Omit<Contact, 'id'>;
