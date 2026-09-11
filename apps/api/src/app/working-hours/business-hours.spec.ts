import { addWorkingMinutes, isOpenAt, type Schedule } from './business-hours';

/**
 * The EXPRESS deadline is the one number a patient is told to expect, so the
 * arithmetic behind it is worth pinning down — especially around midnight,
 * weekends and the two nights a year Moldova moves its clocks.
 */

const TZ = 'Europe/Chisinau';

const MON_FRI_9_17: Schedule = {
  timezone: TZ,
  expressSlaMinutes: 60,
  days: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
    weekday,
    closed: weekday > 5,
    opensAt: '09:00',
    closesAt: '17:00',
  })),
};

/** Format an instant back to Chisinau wall clock, for readable expectations. */
function local(d: Date): string {
  return (
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .format(d)
      // ICU emits the weekday with or without a trailing comma by version.
      .replace(/,/g, '')
  );
}

/** Instant for a Chisinau wall-clock "YYYY-MM-DD HH:MM". */
function at(wallClock: string): Date {
  const [date, time] = wallClock.split(' ');
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm);
  const offset = (i: Date) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(i);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    return (
      Date.UTC(
        get('year'),
        get('month') - 1,
        get('day'),
        get('hour') % 24,
        get('minute'),
      ) -
      Math.floor(i.getTime() / 60_000) * 60_000
    );
  };
  let guess = new Date(naive - offset(new Date(naive)));
  guess = new Date(naive - offset(guess));
  return guess;
}

describe('addWorkingMinutes', () => {
  it('adds plain minutes inside the working day', () => {
    expect(
      local(addWorkingMinutes(at('2026-08-04 10:00'), 60, MON_FRI_9_17)),
    ).toBe('Tue 04 Aug 11:00');
  });

  it('carries the remainder into the next morning when the day closes', () => {
    expect(
      local(addWorkingMinutes(at('2026-08-04 16:30'), 60, MON_FRI_9_17)),
    ).toBe('Wed 05 Aug 09:30');
  });

  it('starts counting at opening time, not at arrival', () => {
    expect(
      local(addWorkingMinutes(at('2026-08-04 07:15'), 60, MON_FRI_9_17)),
    ).toBe('Tue 04 Aug 10:00');
  });

  it('skips the weekend — a Saturday-night question is due Monday', () => {
    expect(
      local(addWorkingMinutes(at('2026-08-08 23:40'), 60, MON_FRI_9_17)),
    ).toBe('Mon 10 Aug 10:00');
  });

  it('treats the closing instant as closed', () => {
    expect(
      local(addWorkingMinutes(at('2026-08-04 17:00'), 60, MON_FRI_9_17)),
    ).toBe('Wed 05 Aug 10:00');
  });

  it('spans several days for a long SLA', () => {
    expect(
      local(addWorkingMinutes(at('2026-08-04 16:00'), 60 * 10, MON_FRI_9_17)),
    ).toBe('Thu 06 Aug 10:00');
  });

  // The wall clock is what must be preserved across a DST change, not the UTC
  // offset — the practice opens at 09:00 by the clock on the wall either way.
  it('survives the spring-forward night', () => {
    expect(
      local(addWorkingMinutes(at('2026-03-27 18:00'), 60, MON_FRI_9_17)),
    ).toBe('Mon 30 Mar 10:00');
  });

  it('survives the fall-back night', () => {
    expect(
      local(addWorkingMinutes(at('2026-10-23 18:00'), 60, MON_FRI_9_17)),
    ).toBe('Mon 26 Oct 10:00');
  });

  // A schedule with nothing open must not hang or throw: the public intake
  // form has to keep working even if somebody ticks "closed" seven times.
  it('falls back to wall-clock minutes when every day is closed', () => {
    const closed: Schedule = {
      ...MON_FRI_9_17,
      days: MON_FRI_9_17.days.map((d) => ({ ...d, closed: true })),
    };
    expect(local(addWorkingMinutes(at('2026-08-04 10:00'), 60, closed))).toBe(
      'Tue 04 Aug 11:00',
    );
  });

  it('ignores a day whose closing time is not after its opening time', () => {
    const typo: Schedule = {
      ...MON_FRI_9_17,
      days: MON_FRI_9_17.days.map((d) =>
        d.weekday === 2 ? { ...d, opensAt: '17:00', closesAt: '09:00' } : d,
      ),
    };
    // Tuesday is unusable, so a Tuesday-morning question rolls to Wednesday.
    expect(local(addWorkingMinutes(at('2026-08-04 10:00'), 60, typo))).toBe(
      'Wed 05 Aug 10:00',
    );
  });
});

describe('isOpenAt', () => {
  it.each([
    ['2026-08-04 09:00', true],
    ['2026-08-04 08:59', false],
    ['2026-08-04 16:59', true],
    ['2026-08-04 17:00', false],
    ['2026-08-08 12:00', false],
  ])('%s → %s', (when, expected) => {
    expect(isOpenAt(at(when as string), MON_FRI_9_17)).toBe(expected);
  });
});
