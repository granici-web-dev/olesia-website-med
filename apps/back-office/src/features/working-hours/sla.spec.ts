import { describe, expect, it } from 'vitest';

import { formatSla } from '@/features/working-hours/sla';

/**
 * The EXPRESS promise as the tickets table prints it. The number is the
 * client's to set on the schedule page, so this is the one place that decides
 * how any value she types reads in Romanian.
 */
describe('formatSla', () => {
  it('keeps minutes under an hour as minutes', () => {
    expect(formatSla(45)).toBe('~45 min');
  });

  it('says one hour in the singular', () => {
    expect(formatSla(60)).toBe('~1 oră');
  });

  it('leaves an hour and a half in minutes, not "1,5 ore"', () => {
    expect(formatSla(90)).toBe('~90 min');
  });

  it('says whole hours in the plural', () => {
    expect(formatSla(120)).toBe('~2 ore');
  });

  /**
   * Zero is reachable: `expressSlaMinutes` accepts it, and the doctor typing
   * it means "as soon as it arrives". "~0 min" is arithmetic rather than a
   * promise, so it is spelled out.
   */
  it('reads zero as "imediat" rather than as "~0 min"', () => {
    expect(formatSla(0)).toBe('imediat');
  });
});
