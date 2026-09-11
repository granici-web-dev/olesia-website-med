/**
 * Rendering the practice schedule (`GET /working-hours`).
 *
 * The site said "~1 h" for the EXPRESS answer in six places and knew nothing
 * about opening hours at all, while the back office had a `Program de lucru`
 * page editing both (audit A6, F12). Everything a visitor is told about when
 * the practice answers now comes from that row.
 *
 * Pure functions, so the three-language formatting can be pinned by a test.
 */

import type { WorkingDayDto, WorkingHoursDto } from './api';

type Tri = readonly [ro: string, en: string, ru: string];

const pick = (t: Tri, locale: string): string =>
  locale === 'ru' ? t[2] : locale === 'en' ? t[1] : t[0];

/** Monday first, matching `WorkingDayDto.weekday` (1 = Monday … 7 = Sunday). */
const DAY_NAMES: Tri[] = [
  ['Luni', 'Monday', 'Понедельник'],
  ['Marți', 'Tuesday', 'Вторник'],
  ['Miercuri', 'Wednesday', 'Среда'],
  ['Joi', 'Thursday', 'Четверг'],
  ['Vineri', 'Friday', 'Пятница'],
  ['Sâmbătă', 'Saturday', 'Суббота'],
  ['Duminică', 'Sunday', 'Воскресенье'],
];

const CLOSED: Tri = ['Închis', 'Closed', 'Закрыто'];
const PROVISIONAL: Tri = [
  'Program orientativ, în curs de confirmare.',
  'Provisional hours, still being confirmed.',
  'Ориентировочный график, уточняется.',
];

/** One line of the opening-hours table: a day or a run of days, and its hours. */
export interface WorkingWeekRow {
  /** "Luni–Vineri", "Sâmbătă". */
  days: string;
  /** "09:00–17:00" or the localized "closed". */
  hours: string;
  closed: boolean;
}

const sameHours = (a: WorkingDayDto, b: WorkingDayDto): boolean =>
  a.closed === b.closed &&
  (a.closed || (a.opensAt === b.opensAt && a.closesAt === b.closesAt));

/**
 * The week as a reader wants it: consecutive days that share their hours
 * collapse into one line, so a normal schedule is two rows rather than seven.
 */
export function formatWorkingWeek(
  locale: string,
  hours: WorkingHoursDto,
): WorkingWeekRow[] {
  const days = [...hours.days].sort((a, b) => a.weekday - b.weekday);
  const rows: WorkingWeekRow[] = [];

  for (let i = 0; i < days.length; ) {
    let last = i;
    while (last + 1 < days.length && sameHours(days[last + 1], days[i])) last++;

    const name = (d: WorkingDayDto) =>
      pick(DAY_NAMES[d.weekday - 1] ?? DAY_NAMES[0], locale);

    rows.push({
      days:
        last === i
          ? name(days[i])
          : `${name(days[i])}–${name(days[last])}`,
      hours: days[i].closed
        ? pick(CLOSED, locale)
        : `${days[i].opensAt}–${days[i].closesAt}`,
      closed: days[i].closed,
    });
    i = last + 1;
  }

  return rows;
}

/** The note shown while the schedule is still ours rather than the client's. */
export function provisionalNote(
  locale: string,
  hours: WorkingHoursDto,
): string | null {
  return hours.isPlaceholder ? pick(PROVISIONAL, locale) : null;
}

/**
 * The EXPRESS promise, as a duration a person reads: "~1 oră", "~90 min".
 *
 * Minutes below an hour stay minutes; a whole number of hours reads as hours,
 * and anything in between stays in minutes rather than becoming "1,5 ore",
 * which no one says about a deadline.
 */
export function formatSla(locale: string, minutes: number): string {
  if (minutes % 60 !== 0 || minutes < 60) {
    return `~${minutes} ${pick(['min', 'min', 'мин'], locale)}`;
  }
  const h = minutes / 60;
  if (locale === 'ru') return `~${h} ${h === 1 ? 'час' : h < 5 ? 'часа' : 'часов'}`;
  if (locale === 'en') return `~${h} ${h === 1 ? 'hour' : 'hours'}`;
  return `~${h} ${h === 1 ? 'oră' : 'ore'}`;
}

/** "~1 oră în programul de lucru" — the promise with the condition attached. */
export function formatSlaInHours(locale: string, minutes: number): string {
  const within: Tri = [
    'în programul de lucru',
    'during working hours',
    'в рабочее время',
  ];
  return `${formatSla(locale, minutes)} ${pick(within, locale)}`;
}

/**
 * Fill the `{sla}` slot a copy string leaves for the EXPRESS promise.
 *
 * The promise appears six times on `/quick-question` alone, in three
 * languages, and it was the literal "~1 oră" in every one of them while the
 * back office edited `expressSlaMinutes` (audit A6, F12). A slot keeps the
 * trilingual blocks readable side by side, which is what `AGENTS.md` R3 asks.
 */
export function withSla(text: string, value: string, slot = 'sla'): string {
  return text.split(`{${slot}}`).join(value);
}
