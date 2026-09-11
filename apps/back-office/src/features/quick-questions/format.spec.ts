import { describe, expect, it } from 'vitest';

import { formatDuration } from '@/features/quick-questions/format';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The countdown beside an EXPRESS question. It is read at a glance while the
 * doctor decides what to answer next, so it drops to two units and never
 * shows seconds.
 */
describe('formatDuration', () => {
  it('shows minutes alone under the hour', () => {
    expect(formatDuration(12 * MINUTE)).toBe('12 m');
    expect(formatDuration(59 * MINUTE + 59_000)).toBe('59 m');
  });

  it('shows hours and minutes under the day', () => {
    expect(formatDuration(7 * HOUR + 20 * MINUTE)).toBe('7 h 20 m');
    expect(formatDuration(HOUR)).toBe('1 h 0 m');
  });

  it('drops to days and hours past a day', () => {
    expect(formatDuration(DAY + 4 * HOUR)).toBe('1 z 4 h');
    expect(formatDuration(3 * DAY + 30 * MINUTE)).toBe('3 z 0 h');
  });

  /** An overdue ticket carries a negative remainder; it reads as elapsed. */
  it('reads a negative remainder as a length of time', () => {
    expect(formatDuration(-(2 * HOUR + 5 * MINUTE))).toBe('2 h 5 m');
  });

  it('rounds down, so a deadline is never reported as further off', () => {
    expect(formatDuration(59_999)).toBe('0 m');
  });
});
