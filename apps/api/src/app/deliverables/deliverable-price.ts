/**
 * What a group-C product costs, or why it cannot be sold.
 *
 * The seam between a `DeliverableCatalog` row the client edits in the back
 * office and an amount that reaches the bank — the same seam `materialPrice`
 * is for the library, written the same way for the same reason: this is the
 * last point at which a price is our own data and the first at which getting
 * it wrong charges somebody the wrong money.
 *
 * Returns the amount, or the machine code of the problem, never both. maib's
 * own floor is not applied here: `checkoutAmount` owns it, one rule about the
 * bank's minimum in one place for all three purchases.
 */
export function deliverablePrice(product: {
  active: boolean;
  priceEur: number;
}): { amount: number } | { refusal: string } {
  if (!product.active) return { refusal: 'deliverable_not_for_sale' };
  // `0` is "on request" across this schema, not "free". A product the client
  // has priced at nothing is one she has not priced yet.
  if (product.priceEur === 0) return { refusal: 'price_on_request' };
  return { amount: product.priceEur };
}
