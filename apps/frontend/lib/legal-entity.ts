import type { LegalEntityDto } from '@olesia/shared';

/**
 * The identity behind the site, split by who owns which half.
 *
 * The **registered entity** — name, IDNO, address — moved to the API on
 * 2026-09-11 (`docs/shape-express-checkout.md`, decision 3). Those are the three
 * fields the acquirer's compliance review checks, and they appear on /gdpr, on
 * /terms and on the payment confirmation email the bank requires; a copy
 * compiled into this bundle would have been a second source of truth for
 * exactly that data. They are environment variables on the API, served by
 * `GET /contacts/legal-entity`, and read here through `api.legalEntity()`.
 *
 * What stays is what the API has no opinion about: the trading name a visitor
 * reads, the mailbox to write to, and the revision date of the legal texts.
 */

export type { LegalEntityDto };

export const SITE_IDENTITY = {
  /** Trading name shown to visitors. */
  displayName: 'Dr. Olesea Jalba',
  // Her real address, confirmed in the brief. Whether data requests should go
  // to a dedicated mailbox instead is still open.
  email: 'oleseajalba@gmail.com',
};

/** Fields a published policy cannot legally do without. */
const REQUIRED: (keyof LegalEntityDto)[] = [
  'registeredName',
  'idno',
  'address',
];

/**
 * True while the legal pages are still drafts.
 *
 * Derived from the entity itself rather than hand-set: a flag somebody has to
 * remember to flip is a flag that ships wrong. It is the same derivation the
 * API uses to decide whether anything may be sold, so the draft banner and the
 * checkout's `legal_entity_missing` can never disagree.
 */
export function legalEntityIncomplete(entity: LegalEntityDto): boolean {
  return REQUIRED.some((key) => !entity[key].trim());
}

/** Last revision of the legal texts. Bump on every substantive change. */
export const LEGAL_UPDATED = {
  ro: '11 septembrie 2026',
  en: '11 September 2026',
  ru: '11 сентября 2026',
};
