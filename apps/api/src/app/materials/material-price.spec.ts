/**
 * What a material costs, and what refuses to be sold.
 *
 * Here because this is the arithmetic between a column the client edits in the
 * back office and an amount that leaves somebody's card. The composition with
 * `checkoutAmount` is tested too: the two rules — "0 means on request" and
 * "the bank refuses 1.00 or less" — live in different files on purpose, and
 * what matters is that a mispriced material meets one of them before it meets
 * the bank.
 */
import { MaterialAccess } from '../../generated/prisma/enums';
import { materialPrice } from './material-price';
import { checkoutAmount } from '../payments/payments.service';

describe('materialPrice', () => {
  it('refuses a free material offered for sale', () => {
    expect(
      materialPrice({ access: MaterialAccess.free, price: 9 }),
    ).toEqual({ refusal: 'material_not_for_sale' });
  });

  it('refuses a paid material with no price', () => {
    expect(
      materialPrice({ access: MaterialAccess.paid, price: null }),
    ).toEqual({ refusal: 'price_on_request' });
  });

  it('reads a price of zero as "on request", not as free', () => {
    expect(materialPrice({ access: MaterialAccess.paid, price: 0 })).toEqual({
      refusal: 'price_on_request',
    });
  });

  it('gives the amount for a priced paid material', () => {
    expect(materialPrice({ access: MaterialAccess.paid, price: 9 })).toEqual({
      amount: 9,
    });
  });

  it('lets the bank floor refuse a material priced at 1, before the bank does', () => {
    const price = materialPrice({ access: MaterialAccess.paid, price: 1 });
    expect(price).toEqual({ amount: 1 });
    expect(checkoutAmount((price as { amount: number }).amount)).toBe(
      'amount_below_minimum',
    );
  });

  it('lets a sane price through both rules', () => {
    const price = materialPrice({ access: MaterialAccess.paid, price: 12 });
    expect(checkoutAmount((price as { amount: number }).amount)).toBeNull();
  });
});
