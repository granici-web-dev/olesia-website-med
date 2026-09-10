/**
 * Business-hours arithmetic for the EXPRESS SLA (client answers v2 §11.5).
 *
 * "~1 oră în timpul programului de lucru" means the clock only runs while the
 * practice is open. A question sent at 23:40 on Saturday is due one working
 * hour into Monday, not at 00:40 on Sunday.
 *
 * Everything here works in the practice's own IANA zone rather than in UTC or
 * in the server's local time. That is the whole point: the schedule is written
 * as wall-clock times ("09:00"), and Moldova moves its clocks twice a year, so
 * a fixed UTC offset would be wrong for half the year.
 */

export interface WorkingDay {
  /** ISO weekday: 1 = Monday … 7 = Sunday. */
  weekday: number;
  closed: boolean;
  /** "HH:MM" wall-clock, in the schedule's timezone. */
  opensAt: string;
  closesAt: string;
}

export interface Schedule {
  timezone: string;
  days: WorkingDay[];
  expressSlaMinutes: number;
}

/**
 * ⚠ PLACEHOLDER schedule. The client still owes us her `program de lucru`
 * (§11.5), and the alternative to a default is an EXPRESS deadline that cannot
 * be computed at all. Mon–Fri 09:00–17:00 is the ordinary case; `isPlaceholder`
 * on the row keeps it visibly provisional until she confirms.
 */
export const PLACEHOLDER_DAYS: WorkingDay[] = [1, 2, 3, 4, 5, 6, 7].map(
  (weekday) => ({
    weekday,
    closed: weekday > 5,
    opensAt: '09:00',
    closesAt: '17:00',
  }),
);

const MINUTE = 60_000;
/** Give up after this many days of finding nothing open — see `addWorkingMinutes`. */
const MAX_LOOKAHEAD_DAYS = 60;

/** Wall-clock parts of an instant, in a given zone. */
interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** ISO weekday, 1 = Monday. */
  weekday: number;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function partsInZone(instant: Date, timeZone: string): Parts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  });
  const p: Record<string, string> = {};
  for (const { type, value } of fmt.formatToParts(instant)) p[type] = value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    // "24" appears at midnight in some ICU versions; normalise it to 0.
    hour: Number(p.hour) % 24,
    minute: Number(p.minute),
    weekday: WEEKDAY_INDEX[p.weekday] ?? 1,
  };
}

/** The zone's offset from UTC, in ms, at a given instant. */
function offsetAt(instant: Date, timeZone: string): number {
  const p = partsInZone(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  // Seconds and ms are not in `parts`; drop them from the instant too.
  const truncated = Math.floor(instant.getTime() / MINUTE) * MINUTE;
  return asUtc - truncated;
}

/**
 * The instant at which a wall-clock time occurs in a zone.
 *
 * Two passes, because the offset depends on the answer: guess with the offset
 * at the naive UTC instant, then re-measure at the guess. That converges for
 * every real zone — the only inputs where it cannot is a wall-clock time that
 * does not exist (the hour skipped on the spring-forward night), and there the
 * second pass lands on the instant the clock jumps to, which is the sensible
 * reading of "09:00 on the day the clocks moved".
 */
function instantFromWallClock(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  let guess = new Date(naive - offsetAt(new Date(naive), timeZone));
  guess = new Date(naive - offsetAt(guess, timeZone));
  return guess;
}

function parseHHMM(value: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/** The open interval on a given calendar day, or null when closed. */
function intervalOn(
  p: Parts,
  schedule: Schedule,
): { start: Date; end: Date } | null {
  const day = schedule.days.find((d) => d.weekday === p.weekday);
  if (!day || day.closed) return null;

  const open = parseHHMM(day.opensAt);
  const close = parseHHMM(day.closesAt);
  if (!open || !close) return null;

  const start = instantFromWallClock(
    p.year,
    p.month,
    p.day,
    open.hour,
    open.minute,
    schedule.timezone,
  );
  const end = instantFromWallClock(
    p.year,
    p.month,
    p.day,
    close.hour,
    close.minute,
    schedule.timezone,
  );
  // A close time at or before the open time is not an overnight shift here —
  // it is a typo, and honouring it would produce a negative-length day.
  if (end.getTime() <= start.getTime()) return null;
  return { start, end };
}

/** Same calendar day, plus n days, as wall-clock parts in the zone. */
function partsPlusDays(p: Parts, n: number, timeZone: string): Parts {
  const noon = instantFromWallClock(p.year, p.month, p.day, 12, 0, timeZone);
  return partsInZone(new Date(noon.getTime() + n * 24 * 60 * MINUTE), timeZone);
}

/**
 * Add `minutes` of *working* time to `from`.
 *
 * Returns `from + minutes` unchanged if the schedule has no open day at all —
 * a public form must not fail because somebody ticked "closed" seven times,
 * and a deadline that is merely too optimistic is a far smaller problem than
 * a 500 on the intake endpoint.
 */
export function addWorkingMinutes(
  from: Date,
  minutes: number,
  schedule: Schedule,
): Date {
  if (minutes <= 0) return from;
  if (schedule.days.every((d) => d.closed)) {
    return new Date(from.getTime() + minutes * MINUTE);
  }

  let remaining = minutes * MINUTE;
  let cursor = from;
  let p = partsInZone(cursor, schedule.timezone);

  for (let i = 0; i <= MAX_LOOKAHEAD_DAYS; i += 1) {
    const interval = intervalOn(p, schedule);

    if (interval && cursor.getTime() < interval.end.getTime()) {
      // Before opening → the clock starts at opening, not now.
      const start =
        cursor.getTime() < interval.start.getTime() ? interval.start : cursor;
      const available = interval.end.getTime() - start.getTime();

      if (available >= remaining) {
        return new Date(start.getTime() + remaining);
      }
      remaining -= available;
      cursor = interval.end;
    }

    // Move to the start of the next calendar day in the practice's zone.
    p = partsPlusDays(p, 1, schedule.timezone);
    cursor = instantFromWallClock(p.year, p.month, p.day, 0, 0, schedule.timezone);
  }

  // Unreachable for any schedule with an open day; kept so the function is
  // total rather than falling off the end.
  return new Date(from.getTime() + minutes * MINUTE);
}

/** Whether the practice is open at a given instant. */
export function isOpenAt(instant: Date, schedule: Schedule): boolean {
  const interval = intervalOn(partsInZone(instant, schedule.timezone), schedule);
  if (!interval) return false;
  const t = instant.getTime();
  return t >= interval.start.getTime() && t < interval.end.getTime();
}
