/**
 * What a purchase's `paymentStatus` says, given the ledger behind it.
 *
 * The field is documented as a mirror of `Payment` and three PATCH endpoints
 * wrote it by hand instead (audit A5, F3). This is the arithmetic that made
 * the documentation true, and it runs whenever a payment stops being paid —
 * the one direction where "it was confirmed, so leave it" would be wrong.
 */
import { PaymentState, PaymentStatus } from '../../generated/prisma/enums';
import { mirrorStatusFor } from './payments.service';

const paid = { state: PaymentState.paid };
const cancelled = { state: PaymentState.cancelled };
const failed = { state: PaymentState.failed };
const refunded = { state: PaymentState.refunded };

describe('mirrorStatusFor', () => {
  it('reads pending when nothing has been recorded at all', () => {
    expect(mirrorStatusFor([])).toBe(PaymentStatus.pending);
  });

  it('reads confirmed on a single paid payment', () => {
    expect(mirrorStatusFor([paid])).toBe(PaymentStatus.confirmed);
  });

  it('reads pending once the only payment is voided', () => {
    expect(mirrorStatusFor([cancelled])).toBe(PaymentStatus.pending);
  });

  it('stays confirmed when a second payment covers the voided one', () => {
    // The case that makes this a recount rather than a flag: a manual record
    // entered by mistake next to a real bank payment. Voiding the mistake must
    // not tell the doctor the client never paid.
    expect(mirrorStatusFor([cancelled, paid])).toBe(PaymentStatus.confirmed);
  });

  it('ignores the ways a checkout ends without money', () => {
    expect(mirrorStatusFor([failed, cancelled])).toBe(PaymentStatus.pending);
  });

  it('reads a fully refunded payment as unpaid, because the money went back', () => {
    expect(mirrorStatusFor([refunded])).toBe(PaymentStatus.pending);
  });
});
