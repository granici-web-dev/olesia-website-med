import { describe, expect, it } from 'vitest';

import {
  confirmationText,
  parseManualAmount,
} from '@/features/payments/format';
import type { Payment } from '@/features/payments/types';

const PAID = {
  id: 'p1',
  orderId: 'ORD-2026-0042',
  targetType: 'appointment',
  amount: 700,
  currency: 'MDL',
  paidAt: '2026-09-11T09:30:00.000Z',
  createdAt: '2026-09-11T09:00:00.000Z',
} as Payment;

/**
 * The receipt the doctor pastes into her own mail client while there is no
 * SMTP. It goes to a client verbatim, so the four facts on it have to be the
 * ones the API's email template states.
 */
describe('confirmationText', () => {
  it('names the order, the service, the amount and when it was paid', () => {
    const text = confirmationText(PAID);
    expect(text).toContain('ORD-2026-0042');
    // `Intl` separates the amount from the currency with a non-breaking
    // space, which is correct typography and invisible in a diff.
    expect(text).toMatch(/Sumă: 700,00\sMDL/u);
    expect(text).toContain('11 sept. 2026');
  });

  /** A payment recorded by hand has no `paidAt`; the row's own date stands in. */
  it('falls back to the record date when there is no payment date', () => {
    const text = confirmationText({ ...PAID, paidAt: null } as Payment);
    expect(text).toContain('Data plății: 11 sept. 2026');
  });
});

/**
 * Money typed by hand. A Romanian keyboard puts a comma on the decimal key,
 * and this number is written into the ledger, so it is rounded to the cent
 * rather than stored as whatever fell out of the parse.
 */
describe('parseManualAmount', () => {
  it('reads a comma as the decimal separator', () => {
    expect(parseManualAmount('1200,50')).toBe(1200.5);
  });

  it('reads a dot too, and ignores surrounding space', () => {
    expect(parseManualAmount(' 1200.50 ')).toBe(1200.5);
  });

  it('rounds to two decimals', () => {
    expect(parseManualAmount('10,005')).toBe(10.01);
    expect(parseManualAmount('10,004')).toBe(10);
  });

  it('refuses anything that is not a positive amount', () => {
    expect(parseManualAmount('')).toBeNull();
    expect(parseManualAmount('0')).toBeNull();
    expect(parseManualAmount('-5')).toBeNull();
    expect(parseManualAmount('abc')).toBeNull();
  });
});
