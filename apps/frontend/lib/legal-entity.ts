/**
 * The legal identity behind the site — one place, because /gdpr and /terms
 * both need it and having it twice is how they end up disagreeing.
 *
 * ⚠ **Everything marked TODO below is still missing.** A privacy policy that
 * does not name its data controller, and terms that do not name the provider's
 * registered entity, are not merely incomplete — under GDPR the identity of the
 * controller is one of the things the notice exists to tell people. So the
 * pages render a visible draft banner while any required field is blank, rather
 * than looking finished and quietly failing the one job they have.
 *
 * Filling this in is a single edit. When the client sends the data:
 *   1. replace the empty strings below,
 *   2. bump `updated*`,
 *   3. the banner disappears on its own — nothing else to remember.
 */

export interface LegalEntity {
  /** Trading name shown to visitors. Known; the registered entity is not. */
  displayName: string;
  /** Registered legal entity, e.g. "ÎI Olesea Jalba" / "SRL …". ⛔ TODO. */
  registeredName: string;
  /** IDNO / fiscal code. ⛔ TODO. */
  idno: string;
  /** Registered address. ⛔ TODO — the practice address is also still pending. */
  address: string;
  /** Mailbox for data-protection requests. */
  email: string;
  /** Who to name as data controller, when it differs from the entity. ⛔ TODO. */
  dataController: string;
}

export const LEGAL_ENTITY: LegalEntity = {
  displayName: 'Dr. Olesea Jalba',
  registeredName: '',
  idno: '',
  address: '',
  // Her real address, confirmed in the brief. Whether data requests should go
  // to a dedicated mailbox instead is still open.
  email: 'oleseajalba@gmail.com',
  dataController: '',
};

/** Fields a published policy cannot legally do without. */
const REQUIRED: (keyof LegalEntity)[] = ['registeredName', 'idno', 'address'];

/**
 * True while the pages are still drafts. Derived rather than hand-set: a flag
 * somebody has to remember to flip is a flag that ships wrong.
 */
export const LEGAL_ENTITY_INCOMPLETE = REQUIRED.some(
  (key) => !LEGAL_ENTITY[key].trim(),
);

/** Last revision of the legal texts. Bump on every substantive change. */
export const LEGAL_UPDATED = {
  ro: '17 iunie 2026',
  en: '17 June 2026',
  ru: '17 июня 2026',
};
