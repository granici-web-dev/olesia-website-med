/**
 * What a group-C product costs, and what refuses to be sold.
 *
 * Here for the reason `material-price.spec.ts` is: this is the arithmetic
 * between a column the client edits in the back office and an amount that
 * leaves somebody's card. The composition with `checkoutAmount` is pinned too
 * — the two rules, "0 means on request" and "the bank refuses 1.00 or less",
 * live in different files on purpose, and what matters is that a mispriced
 * menu meets one of them before it meets the bank.
 */
import { deliverablePrice } from './deliverable-price';
import { checkoutAmount } from '../payments/payments.service';

describe('deliverablePrice', () => {
  it('refuses a product the client has withdrawn', () => {
    expect(deliverablePrice({ active: false, priceEur: 28 })).toEqual({
      refusal: 'deliverable_not_for_sale',
    });
  });

  it('reads a price of zero as "on request", not as free', () => {
    expect(deliverablePrice({ active: true, priceEur: 0 })).toEqual({
      refusal: 'price_on_request',
    });
  });

  it('refuses a withdrawn product before it looks at the price', () => {
    expect(deliverablePrice({ active: false, priceEur: 0 })).toEqual({
      refusal: 'deliverable_not_for_sale',
    });
  });

  it('gives the amount for a priced product on sale', () => {
    expect(deliverablePrice({ active: true, priceEur: 28 })).toEqual({
      amount: 28,
    });
  });

  it('lets the bank floor refuse a product priced at 1, before the bank does', () => {
    const priced = deliverablePrice({ active: true, priceEur: 1 });
    expect(priced).toEqual({ amount: 1 });
    expect(checkoutAmount(1)).toBe('amount_below_minimum');
  });

  it('passes an ordinary menu price through both rules', () => {
    const priced = deliverablePrice({ active: true, priceEur: 48 });
    expect(priced).toEqual({ amount: 48 });
    expect(checkoutAmount(48)).toBeNull();
  });
});
