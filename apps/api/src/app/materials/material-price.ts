import { MaterialAccess } from '../../generated/prisma/enums';

/**
 * What a material costs, or why it cannot be sold.
 *
 * The seam between a `Material` row and an amount that reaches the bank. It
 * exists as a pure function for the same reason `checkoutAmount` does: this is
 * the last point at which a price is our own data, and the first at which
 * getting it wrong charges somebody the wrong money.
 *
 * Returns the amount, or the machine code of the problem — never both. The
 * caller hands the amount to `PaymentsService.start()`, which then applies
 * maib's own floor to it, so a material priced at 1 € is refused there rather
 * than here: one rule about the bank's minimum, in one place, for all three
 * purchases.
 */
export function materialPrice(material: {
  access: MaterialAccess;
  price: number | null;
}): { amount: number } | { refusal: string } {
  if (material.access !== MaterialAccess.paid) {
    return { refusal: 'material_not_for_sale' };
  }
  // `price: 0` is "on request" everywhere in this catalog, not "free": a free
  // material is `access: 'free'`, and the two must not be confused by a column
  // somebody left at its default.
  if (material.price === null || material.price === 0) {
    return { refusal: 'price_on_request' };
  }
  return { amount: material.price };
}
