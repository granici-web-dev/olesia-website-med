import { describe, expect, it } from 'vitest';
import type { WorkingHoursDto } from '@olesia/shared';

import {
  formatSla,
  formatSlaInHours,
  formatWorkingWeek,
  provisionalNote,
  withSla,
} from './working-hours';

/**
 * The opening hours and the EXPRESS promise are the two things on this site a
 * person plans around, and both are the client's to edit. What is pinned here
 * is that they read correctly in all three languages — a missing branch does
 * not throw, it silently shows Romanian to a Russian reader.
 */

const week = (
  days: {
    weekday: number;
    closed?: boolean;
    opensAt?: string;
    closesAt?: string;
  }[],
  extra: Partial<WorkingHoursDto> = {},
): WorkingHoursDto => ({
  timezone: 'Europe/Chisinau',
  days: days.map((d) => ({
    weekday: d.weekday,
    closed: d.closed ?? false,
    opensAt: d.opensAt ?? '09:00',
    closesAt: d.closesAt ?? '17:00',
  })),
  expressSlaMinutes: 60,
  isPlaceholder: false,
  updatedAt: '2026-09-11T00:00:00.000Z',
  ...extra,
});

const MON_FRI_9_17 = week([
  { weekday: 1 },
  { weekday: 2 },
  { weekday: 3 },
  { weekday: 4 },
  { weekday: 5 },
  { weekday: 6, closed: true },
  { weekday: 7, closed: true },
]);

describe('formatWorkingWeek', () => {
  it('collapses a run of identical days into one line', () => {
    expect(formatWorkingWeek('ro', MON_FRI_9_17)).toEqual([
      { days: 'Luni–Vineri', hours: '09:00–17:00', closed: false },
      { days: 'Sâmbătă–Duminică', hours: 'Închis', closed: true },
    ]);
  });

  it('names the days in each language', () => {
    expect(formatWorkingWeek('en', MON_FRI_9_17)[0].days).toBe('Monday–Friday');
    expect(formatWorkingWeek('ru', MON_FRI_9_17)[0].days).toBe(
      'Понедельник–Пятница',
    );
    expect(formatWorkingWeek('en', MON_FRI_9_17)[1].hours).toBe('Closed');
    expect(formatWorkingWeek('ru', MON_FRI_9_17)[1].hours).toBe('Закрыто');
  });

  it('keeps a day whose hours differ on its own line', () => {
    const rows = formatWorkingWeek(
      'ro',
      week([
        { weekday: 1 },
        { weekday: 2 },
        { weekday: 3, opensAt: '10:00', closesAt: '14:00' },
        { weekday: 4 },
        { weekday: 5 },
        { weekday: 6, closed: true },
        { weekday: 7, closed: true },
      ]),
    );
    expect(rows.map((r) => r.days)).toEqual([
      'Luni–Marți',
      'Miercuri',
      'Joi–Vineri',
      'Sâmbătă–Duminică',
    ]);
    expect(rows[1].hours).toBe('10:00–14:00');
  });

  it('reads days in weekday order however they arrive', () => {
    const scrambled = week([
      { weekday: 7, closed: true },
      { weekday: 1 },
      { weekday: 6, closed: true },
      { weekday: 2 },
      { weekday: 5 },
      { weekday: 3 },
      { weekday: 4 },
    ]);
    expect(formatWorkingWeek('ro', scrambled)).toEqual(
      formatWorkingWeek('ro', MON_FRI_9_17),
    );
  });

  it('collapses a week that is closed throughout into one line', () => {
    const closed = week(
      [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({ weekday, closed: true })),
    );
    expect(formatWorkingWeek('ro', closed)).toEqual([
      { days: 'Luni–Duminică', hours: 'Închis', closed: true },
    ]);
  });
});

describe('provisionalNote', () => {
  it('says so while the schedule is still ours', () => {
    const draft = week(MON_FRI_9_17.days, { isPlaceholder: true });
    expect(provisionalNote('ro', draft)).toContain('orientativ');
    expect(provisionalNote('en', draft)).toContain('Provisional');
    expect(provisionalNote('ru', draft)).toContain('Ориентировочный');
  });

  it('says nothing once the client has saved her own', () => {
    expect(provisionalNote('ro', MON_FRI_9_17)).toBeNull();
  });
});

describe('formatSla', () => {
  it('reads an hour as an hour in each language', () => {
    expect(formatSla('ro', 60)).toBe('~1 oră');
    expect(formatSla('en', 60)).toBe('~1 hour');
    expect(formatSla('ru', 60)).toBe('~1 час');
  });

  it('pluralizes whole hours', () => {
    expect(formatSla('ro', 180)).toBe('~3 ore');
    expect(formatSla('en', 180)).toBe('~3 hours');
    expect(formatSla('ru', 180)).toBe('~3 часа');
    expect(formatSla('ru', 300)).toBe('~5 часов');
  });

  it('stays in minutes below an hour and for a part-hour', () => {
    expect(formatSla('ro', 30)).toBe('~30 min');
    expect(formatSla('ru', 90)).toBe('~90 мин');
  });

  it('treats an unknown locale as Romanian', () => {
    expect(formatSla('de', 60)).toBe(formatSla('ro', 60));
  });
});

describe('formatSlaInHours', () => {
  it('attaches the condition the promise depends on', () => {
    expect(formatSlaInHours('ro', 60)).toBe('~1 oră în programul de lucru');
    expect(formatSlaInHours('en', 60)).toBe('~1 hour during working hours');
    expect(formatSlaInHours('ru', 60)).toBe('~1 час в рабочее время');
  });
});

describe('withSla', () => {
  it('fills every occurrence of the slot', () => {
    expect(withSla('Răspuns în {sla}, doar {sla}.', '~1 oră')).toBe(
      'Răspuns în ~1 oră, doar ~1 oră.',
    );
  });

  it('fills a named slot and leaves the others alone', () => {
    expect(
      withSla(
        '{slaInHours} · {sla}',
        '~1 oră în programul de lucru',
        'slaInHours',
      ),
    ).toBe('~1 oră în programul de lucru · {sla}');
  });
});
