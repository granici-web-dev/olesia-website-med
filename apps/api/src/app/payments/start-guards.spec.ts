/**
 * The two decisions `PaymentsService.start()` makes before the bank is called.
 *
 * `checkoutAmount` stands between a price in the catalog and money leaving a
 * card: maib refuses anything at or below 1.00 and a service priced 0 is "on
 * request" rather than free, and both have to be refused in our own words
 * rather than as bank error 42007 on a hosted page.
 *
 * `resolveIntent` decides what a repeat submit gets. Getting it wrong in one
 * direction charges somebody twice; in the other it strands a person whose card
 * was declined with a dead link and no way to try again.
 */
import { PaymentState } from '../../generated/prisma/enums';
import { checkoutAmount, resolveIntent } from './payments.service';

describe('checkoutAmount', () => {
  it('refuses a service priced 0 as on-request, not as free', () => {
    expect(checkoutAmount(0)).toBe('price_on_request');
  });

  it("refuses maib's minimum, which is strictly greater than 1.00", () => {
    expect(checkoutAmount(1)).toBe('amount_below_minimum');
    expect(checkoutAmount(1.0)).toBe('amount_below_minimum');
    expect(checkoutAmount(0.5)).toBe('amount_below_minimum');
  });

  it('accepts a real price', () => {
    expect(checkoutAmount(1.01)).toBeNull();
    expect(checkoutAmount(8)).toBeNull();
    expect(checkoutAmount(600)).toBeNull();
  });
});

describe('resolveIntent', () => {
  const NOW = new Date('2026-09-11T12:00:00Z');
  const live = {
    state: PaymentState.created,
    checkoutUrl: 'https://bank/checkout/1',
    expiresAt: new Date('2026-09-11T12:25:00Z'),
  };

  it('opens a session when the key has never been seen', () => {
    expect(resolveIntent(null, NOW)).toEqual({ open: true });
  });

  it('hands back the session a live intent already opened', () => {
    expect(resolveIntent(live, NOW)).toEqual({
      reuse: 'https://bank/checkout/1',
    });
  });

  it('detaches the key from a session that is over, so a retry can pay', () => {
    for (const state of [
      PaymentState.failed,
      PaymentState.expired,
      PaymentState.abandoned,
      PaymentState.cancelled,
    ]) {
      expect(resolveIntent({ ...live, state }, NOW)).toEqual({ detach: true });
    }
  });

  it('detaches a paid one too: that purchase is finished', () => {
    expect(resolveIntent({ ...live, state: PaymentState.paid }, NOW)).toEqual({
      detach: true,
    });
  });

  it('detaches a session the bank has let expire, whatever its state says', () => {
    expect(
      resolveIntent(
        { ...live, expiresAt: new Date('2026-09-11T11:59:59Z') },
        NOW,
      ),
    ).toEqual({ detach: true });
  });

  it('detaches a row with no URL rather than handing back nothing', () => {
    expect(resolveIntent({ ...live, checkoutUrl: null }, NOW)).toEqual({
      detach: true,
    });
  });

  it('treats a session with no stated expiry as live', () => {
    expect(resolveIntent({ ...live, expiresAt: null }, NOW)).toEqual({
      reuse: 'https://bank/checkout/1',
    });
  });
});
