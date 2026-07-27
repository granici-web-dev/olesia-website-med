/**
 * Contact blocks shown publicly on the site.
 *
 * TODO(shared): replace with DTOs/enums from `packages/shared` once it exists —
 * mirrors the `Contact` model in module_calendly.md §9.
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
