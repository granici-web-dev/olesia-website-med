import type { LegalEntityDto } from '@olesia/shared';

/**
 * The registered entity behind the practice, read from the environment.
 *
 * Env-owned rather than a table, because these three fields are not content the
 * client edits — they are her incorporation, they change once, and the acquirer
 * checks them against the company register. Env-owned rather than compiled into
 * the site, because /gdpr, /terms and the bank's payment receipt all name the
 * same entity and two copies of it is how they end up disagreeing
 * (docs/shape-express-checkout.md, decision 3).
 *
 * Deliberately **not** in `REQUIRED_IN_PRODUCTION`. The API boots without them:
 * the client's legal entity does not exist yet, and holding the whole site
 * hostage to it would be a worse answer than the one already in place — the
 * draft banner on /gdpr and /terms derives itself from this emptiness, and the
 * checkout route is the single thing that refuses, with `legal_entity_missing`.
 */
export function legalEntity(): LegalEntityDto {
  return {
    registeredName: process.env.LEGAL_ENTITY_NAME ?? '',
    idno: process.env.LEGAL_ENTITY_IDNO ?? '',
    address: process.env.LEGAL_ENTITY_ADDRESS ?? '',
  };
}

/** Whether anything may be sold yet. All three fields, or none. */
export function canSell(): boolean {
  const entity = legalEntity();
  return Boolean(
    entity.registeredName.trim() && entity.idno.trim() && entity.address.trim(),
  );
}
