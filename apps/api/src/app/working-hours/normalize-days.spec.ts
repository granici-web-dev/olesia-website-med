/**
 * What the schedule becomes when the JSON column does not hold a schedule.
 *
 * `days` is a `Json` column, so nothing at the type level stops a bad write,
 * and every way of being wrong fails in the same direction: `intervalOn` reads
 * a day it cannot parse as closed, and a closed day pushes an EXPRESS deadline
 * the patient was promised in an hour into next week. These pin the fallback.
 */
import { PLACEHOLDER_DAYS } from './business-hours';
import { normalizeDays } from './working-hours.service';

const MONDAY = 1;
const SATURDAY = 6;

function monday(days: ReturnType<typeof normalizeDays>) {
  return days.find((d) => d.weekday === MONDAY)!;
}

describe('normalizeDays', () => {
  it('always returns the seven days, Monday first', () => {
    expect(normalizeDays([]).map((d) => d.weekday)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('falls back whole when the column holds something that is not a list', () => {
    for (const raw of [null, undefined, {}, 'Mon-Fri 9-17', 42]) {
      expect(normalizeDays(raw)).toEqual(PLACEHOLDER_DAYS);
    }
  });

  it('fills in a weekday the stored schedule never mentions', () => {
    const stored = [{ weekday: MONDAY, closed: false, opensAt: '08:00', closesAt: '16:00' }];
    const days = normalizeDays(stored);

    expect(monday(days)).toEqual(stored[0]);
    // The other six came from the placeholder rather than reading as closed.
    expect(days.find((d) => d.weekday === SATURDAY)).toEqual(
      PLACEHOLDER_DAYS.find((d) => d.weekday === SATURDAY),
    );
  });

  it('rejects a time that is not HH:MM and keeps the placeholder hour', () => {
    for (const opensAt of ['9:00', '25:00', '09:60', '09h00', '', 900, null]) {
      expect(monday(normalizeDays([{ weekday: MONDAY, closed: false, opensAt }])).opensAt)
        .toBe('09:00');
    }
  });

  it('keeps a well-formed time exactly as written', () => {
    const days = normalizeDays([
      { weekday: MONDAY, closed: false, opensAt: '00:00', closesAt: '23:59' },
    ]);
    expect(monday(days)).toMatchObject({ opensAt: '00:00', closesAt: '23:59' });
  });

  it('takes `closed` only when it is really a boolean', () => {
    expect(monday(normalizeDays([{ weekday: MONDAY, closed: true }])).closed).toBe(true);
    // `Boolean('false')` is true, which is how a string in this column used to
    // close a day that the client had opened.
    expect(monday(normalizeDays([{ weekday: MONDAY, closed: 'false' }])).closed).toBe(false);
  });

  it('matches a weekday written as a string, as older rows have it', () => {
    const days = normalizeDays([
      { weekday: '1', closed: false, opensAt: '10:00', closesAt: '18:00' },
    ]);
    expect(monday(days)).toMatchObject({ opensAt: '10:00', closesAt: '18:00' });
  });
});
