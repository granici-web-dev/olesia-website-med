/**
 * maib spells the same fields two ways. The documented `GET /v2/checkouts/{id}`
 * schema capitalises `CompletedAt`, `FailedAt`, `CancelledAt` and `PaymentId`;
 * the sandbox sends all four in lower case (docs/payments-maib-checkout.md §18),
 * and the note says production may differ from sandbox in either direction.
 *
 * The stakes: `paidAt` is read off `completedAt` and a refund is keyed by
 * `paymentId`. Reading one spelling means a payment recorded as paid with no
 * date on it, or one that cannot be refunded — against a bank statement that
 * carries both.
 */
import { normalizeCheckout, type RawMaibCheckout } from './maib.service';

const BASE: RawMaibCheckout = {
  id: 'chk-1',
  status: 'Completed',
  amount: 8,
  currency: 'EUR',
};

describe('normalizeCheckout', () => {
  it('reads the documented capitalised payload', () => {
    const out = normalizeCheckout({
      ...BASE,
      CompletedAt: '2026-09-11T10:00:00Z',
      FailedAt: '2026-09-11T10:01:00Z',
      CancelledAt: '2026-09-11T10:02:00Z',
    });
    expect(out.completedAt).toBe('2026-09-11T10:00:00Z');
    expect(out.failedAt).toBe('2026-09-11T10:01:00Z');
    expect(out.cancelledAt).toBe('2026-09-11T10:02:00Z');
  });

  it('reads the sandbox lower-case payload into the same object', () => {
    const upper = normalizeCheckout({
      ...BASE,
      CompletedAt: '2026-09-11T10:00:00Z',
    });
    const lower = normalizeCheckout({
      ...BASE,
      completedAt: '2026-09-11T10:00:00Z',
    });
    expect(lower).toEqual(upper);
  });

  it('reads PaymentId and paymentId alike', () => {
    expect(
      normalizeCheckout({ ...BASE, payment: { PaymentId: 'pay-1' } }).payment
        ?.paymentId,
    ).toBe('pay-1');
    expect(
      normalizeCheckout({ ...BASE, payment: { paymentId: 'pay-1' } }).payment
        ?.paymentId,
    ).toBe('pay-1');
  });

  it('leaves a field with neither spelling absent, not "undefined"', () => {
    const out = normalizeCheckout(BASE);
    expect(out.completedAt).toBeUndefined();
    expect(out.failedAt).toBeUndefined();
    expect(out.cancelledAt).toBeUndefined();
    expect(`${out.completedAt ?? ''}`).toBe('');
  });

  it('does not invent a payment where the bank sent none', () => {
    expect(normalizeCheckout(BASE).payment).toBeUndefined();
    expect(normalizeCheckout({ ...BASE, payment: null }).payment).toBeNull();
  });

  it('keeps everything else it was given', () => {
    const out = normalizeCheckout({
      ...BASE,
      expiresAt: '2026-09-11T10:25:00Z',
      order: { id: 'quick_question-abc' },
    });
    expect(out.id).toBe('chk-1');
    expect(out.status).toBe('Completed');
    expect(out.amount).toBe(8);
    expect(out.expiresAt).toBe('2026-09-11T10:25:00Z');
    expect(out.order).toEqual({ id: 'quick_question-abc' });
  });
});
