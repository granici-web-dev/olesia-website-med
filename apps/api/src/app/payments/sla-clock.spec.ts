/**
 * Where the EXPRESS clock starts.
 *
 * The bank's callback has never been delivered (docs/payments-maib-checkout.md
 * §14), so what actually settles a payment here is the return page's poll or
 * the half-hourly reconcile sweep — either of which can run hours after the
 * card was charged. Counting the SLA from the moment we found out would hand
 * the practice back every one of those hours and quietly move a deadline the
 * patient was promised. `slaClockStart` picks the bank's moment instead;
 * `addWorkingMinutes` then does what it always did.
 *
 * The schedule below is in UTC so a wall clock and an ISO string are the same
 * thing — the timezone arithmetic itself is pinned in
 * `working-hours/business-hours.spec.ts` and is not what this file is about.
 */
import {
  addWorkingMinutes,
  type Schedule,
} from '../working-hours/business-hours';
import { slaClockStart } from './payments.service';

const MON_FRI_9_17: Schedule = {
  timezone: 'UTC',
  expressSlaMinutes: 60,
  days: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
    weekday,
    closed: weekday > 5,
    opensAt: '09:00',
    closesAt: '17:00',
  })),
};

/** Tuesday. */
const PAID_AT = new Date('2026-09-08T10:00:00Z');

function dueFrom(start: Date): string {
  return addWorkingMinutes(start, 60, MON_FRI_9_17).toISOString();
}

describe('slaClockStart', () => {
  it("takes the bank's moment over the moment we learned of it", () => {
    const learnedAt = new Date('2026-09-08T14:00:00Z');
    expect(slaClockStart({ paidAt: PAID_AT }, learnedAt)).toEqual(PAID_AT);
  });

  it('falls back to now when the bank said a payment completed but not when', () => {
    const learnedAt = new Date('2026-09-08T14:00:00Z');
    expect(slaClockStart({ paidAt: null }, learnedAt)).toEqual(learnedAt);
  });
});

describe('the deadline a late poll produces', () => {
  it('is four hours earlier when the poll is four hours late', () => {
    const learnedAt = new Date('2026-09-08T14:00:00Z');

    expect(dueFrom(slaClockStart({ paidAt: PAID_AT }, learnedAt))).toBe(
      '2026-09-08T11:00:00.000Z',
    );
    expect(dueFrom(slaClockStart({ paidAt: null }, learnedAt))).toBe(
      '2026-09-08T15:00:00.000Z',
    );
  });

  it('can already be overdue, and says so rather than granting a new hour', () => {
    // Charged half an hour before closing on Tuesday; nobody came back to the
    // tab, and the sweep settles it on Wednesday morning. The promise was
    // bought on Tuesday, so half of it is owed at Wednesday's opening.
    const paidAt = new Date('2026-09-08T16:30:00Z');
    const learnedAt = new Date('2026-09-09T09:15:00Z');

    expect(dueFrom(slaClockStart({ paidAt }, learnedAt))).toBe(
      '2026-09-09T09:30:00.000Z',
    );
    expect(dueFrom(slaClockStart({ paidAt: null }, learnedAt))).toBe(
      '2026-09-09T10:15:00.000Z',
    );
  });
});
