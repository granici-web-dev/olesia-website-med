/**
 * The group-C catalog: the five personalized menus and protocols sold from
 * /pricing (`docs/shape-deliverable-catalog.md`).
 *
 * The set of codes is fixed and the rows are never created or deleted, so
 * there is no `DeliverableInput` covering a whole row here — only the fields
 * the edit sheet sends.
 */

export type DeliverableCode =
  | 'menu_7'
  | 'menu_14'
  | 'menu_30'
  | 'protocol_pednutri'
  | 'protocol_complementary';

export interface Deliverable {
  code: DeliverableCode;
  /** EUR, whole euros. 0 = on request, and refuses a checkout. */
  priceEur: number;
  titleRo: string;
  titleEn: string;
  /** Required, unlike a service's: these five are ours to write, not hers. */
  titleRu: string;
  sortOrder: number;
  active: boolean;
}

/** What the edit sheet sends. `active` travels alone, from the list toggle. */
export type DeliverableInput = Omit<Deliverable, 'code' | 'active'>;
