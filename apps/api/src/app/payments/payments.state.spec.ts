import { PaymentState } from '../../generated/prisma/enums';
import { resolvePaymentState, toPaymentState } from './payments.service';

/**
 * The state map is where four undocumented sandbox behaviours are absorbed
 * (docs/payments-maib-checkout.md §11), so it is pinned rather than trusted:
 * the bank returns `Waitingforinit` where the docs promise `WaitingForInit`,
 * ships a `Refunded` payment status that appears in no documented enum, and
 * answers some rejections with HTTP 200. Getting any of these wrong reads as
 * "the money never arrived".
 */
describe('toPaymentState', () => {
  const cases: [string, Parameters<typeof toPaymentState>, PaymentState][] = [
    // The casing the sandbox actually returns, not the documented spelling.
    [
      'sandbox casing of a fresh session',
      ['Waitingforinit'],
      PaymentState.created,
    ],
    [
      'documented casing of a fresh session',
      ['WaitingForInit'],
      PaymentState.created,
    ],
    ['payer opened the link', ['Initialized'], PaymentState.pending],
    ['payer picked a method', ['PaymentMethodSelected'], PaymentState.pending],
    ['completed checkout, no payment yet', ['Completed'], PaymentState.paid],
    ['expired', ['Expired'], PaymentState.expired],
    ['never opened', ['Abandoned'], PaymentState.abandoned],
    ['cancelled by us', ['Cancelled'], PaymentState.cancelled],
    ['american spelling of cancelled', ['Canceled'], PaymentState.cancelled],
    ['failed checkout', ['Failed'], PaymentState.failed],

    ['executed payment', ['Completed', 'Executed'], PaymentState.paid],
    [
      'failed payment beats the checkout status',
      ['Completed', 'Failed'],
      PaymentState.failed,
    ],

    // `Refunded` is not in the documented payment-status enum.
    [
      'undocumented Refunded status',
      ['Completed', 'Refunded'],
      PaymentState.refunded,
    ],
    [
      'fully refunded by amount',
      ['Completed', 'Executed', 160, 160],
      PaymentState.refunded,
    ],
    [
      'refunded slightly over, rounding at the bank',
      ['Completed', 'Executed', 160, 160.01],
      PaymentState.refunded,
    ],
    [
      'partially refunded',
      ['Completed', 'Executed', 1200, 400],
      PaymentState.partially_refunded,
    ],
    [
      'zero refund is not a refund',
      ['Completed', 'Executed', 1200, 0],
      PaymentState.paid,
    ],

    // Anything we cannot classify is still a payment we must not lose.
    ['unknown checkout status', ['SomethingNew'], PaymentState.pending],
    ['missing checkout status', [undefined], PaymentState.pending],
    ['null checkout status', [null], PaymentState.pending],
  ];

  it.each(cases)('%s', (_name, args, expected) => {
    expect(toPaymentState(...args)).toBe(expected);
  });
});

/**
 * The guard that stops a late duplicate of the original success notification
 * from walking a refunded payment back to paid.
 */
describe('resolvePaymentState', () => {
  it('does not roll a refunded payment back to paid', () => {
    expect(resolvePaymentState(PaymentState.refunded, PaymentState.paid)).toBe(
      PaymentState.refunded,
    );
  });

  it('does not roll a partially refunded payment back to paid', () => {
    expect(
      resolvePaymentState(PaymentState.partially_refunded, PaymentState.paid),
    ).toBe(PaymentState.partially_refunded);
  });

  it.each([PaymentState.pending, PaymentState.created])(
    'does not roll a paid payment back to %s',
    (incoming) => {
      expect(resolvePaymentState(PaymentState.paid, incoming)).toBe(
        PaymentState.paid,
      );
    },
  );

  it('lets a paid payment become refunded', () => {
    expect(resolvePaymentState(PaymentState.paid, PaymentState.refunded)).toBe(
      PaymentState.refunded,
    );
  });

  it('lets a partial refund become a full one', () => {
    expect(
      resolvePaymentState(
        PaymentState.partially_refunded,
        PaymentState.refunded,
      ),
    ).toBe(PaymentState.refunded);
  });

  it('lets an open session progress and fail', () => {
    expect(
      resolvePaymentState(PaymentState.created, PaymentState.pending),
    ).toBe(PaymentState.pending);
    expect(resolvePaymentState(PaymentState.pending, PaymentState.paid)).toBe(
      PaymentState.paid,
    );
    expect(resolvePaymentState(PaymentState.pending, PaymentState.failed)).toBe(
      PaymentState.failed,
    );
  });
});
