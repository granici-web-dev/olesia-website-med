import { describe, expect, it } from 'vitest';

import { appointmentsDelta } from '@/features/dashboard/format';

describe('appointmentsDelta', () => {
  it('states the percentage against the previous period', () => {
    expect(appointmentsDelta(12, 10)).toEqual({ value: '+20%', trend: 'up' });
    expect(appointmentsDelta(8, 10)).toEqual({ value: '-20%', trend: 'down' });
    expect(appointmentsDelta(10, 10)).toEqual({ value: '0%', trend: 'flat' });
  });

  /**
   * A first month has nothing to compare against, so the count is the answer.
   * Zero against zero has to carry the unit: "0" beside "+12 %" on the same
   * card reads as twelve fewer appointments rather than as no change.
   */
  it('carries the unit when there is nothing on either side', () => {
    expect(appointmentsDelta(0, 0)).toEqual({ value: '0 %', trend: 'flat' });
  });

  it('states the count when the previous period was empty', () => {
    expect(appointmentsDelta(7, 0)).toEqual({ value: '+7', trend: 'up' });
  });
});
