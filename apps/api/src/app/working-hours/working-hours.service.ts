import { Injectable, Logger } from '@nestjs/common';
import type { WorkingHoursDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';
import {
  addWorkingMinutes,
  isOpenAt,
  type Schedule,
  PLACEHOLDER_DAYS,
  type WorkingDay,
} from './business-hours';

/** Where the practice is, and what an unreadable stored zone falls back to. */
const FALLBACK_TIMEZONE = 'Europe/Chisinau';

/** The one row's primary key. See the schema comment on `WorkingHours.id`. */
const SINGLETON_ID = 'singleton';

/**
 * The practice schedule, and the EXPRESS deadline computed from it.
 *
 * Singleton row, created on first read — the same shape as AboutPage, and it
 * means neither the public intake nor the back office can hit "no schedule".
 */
@Injectable()
export class WorkingHoursService {
  private readonly logger = new Logger(WorkingHoursService.name);

  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<WorkingHoursDto> {
    const row = await this.getOrCreate();
    return toDto({ ...row, timezone: this.usableTimezone(row.timezone) });
  }

  async update(dto: UpdateWorkingHoursDto): Promise<WorkingHoursDto> {
    const current = await this.getOrCreate();

    const updated = await writeOrTranslate(() =>
      this.prisma.workingHours.update({
        where: { id: SINGLETON_ID },
        data: {
          ...(dto.timezone ? { timezone: dto.timezone } : {}),
          ...(dto.days ? { days: dto.days as unknown as object } : {}),
          ...(dto.expressSlaMinutes !== undefined
            ? { expressSlaMinutes: dto.expressSlaMinutes }
            : {}),
          // Editing the schedule is the act of confirming it. Nothing else can
          // clear the placeholder flag, so it cannot be dismissed by accident.
          //
          // That comment was untrue until audit A5 (F5): the DTO also accepted
          // `isPlaceholder` in the body, so the banner the client is supposed
          // to earn by saving a real schedule could be switched off with a
          // one-field PATCH. `PRINCIPLES.md` asks for a placeholder that is
          // derived rather than flagged; this is the derivation.
          isPlaceholder: dto.days ? false : current.isPlaceholder,
        },
      }),
    );
    return toDto(updated);
  }

  /**
   * When an EXPRESS question sent now is due.
   *
   * Read at submission time and stored on the ticket, never recomputed: a
   * deadline was promised under the schedule in force that day, and editing
   * next month's opening hours must not retroactively make an answered ticket
   * late.
   */
  async expressDueAt(from: Date = new Date()): Promise<Date> {
    const schedule = await this.schedule();
    return addWorkingMinutes(from, schedule.expressSlaMinutes, schedule);
  }

  /** Whether the practice is open right now — used for the back-office banner. */
  async isOpenNow(): Promise<boolean> {
    return isOpenAt(new Date(), await this.schedule());
  }

  private async schedule(): Promise<Schedule> {
    const row = await this.getOrCreate();
    return {
      timezone: this.usableTimezone(row.timezone),
      days: normalizeDays(row.days),
      expressSlaMinutes: row.expressSlaMinutes,
    };
  }

  /**
   * The DTO rejects an unknown zone, so a stored one is only ever wrong if it
   * predates that check or was written straight to the database. Falling back
   * is still the right answer: an EXPRESS deadline an hour out is a much
   * smaller problem than a public intake form that returns 500 (audit A3, F8).
   */
  private usableTimezone(stored: string): string {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: stored });
      return stored;
    } catch {
      this.logger.error(
        `Working hours name an unknown timezone (${stored}) — falling back to ${FALLBACK_TIMEZONE}. Fix it in the back office.`,
      );
      return FALLBACK_TIMEZONE;
    }
  }

  private async getOrCreate() {
    // Read before upserting: an upsert always issues its UPDATE leg, and
    // `updatedAt` is `@updatedAt`, so upserting on every read would date the
    // schedule to the last time the public contact page was loaded.
    const existing = await this.prisma.workingHours.findUnique({
      where: { id: SINGLETON_ID },
    });
    if (existing) return existing;

    this.logger.warn(
      'No working hours configured — creating the placeholder schedule (Mon–Fri 09:00–17:00).',
    );
    return this.prisma.workingHours.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: {
        id: SINGLETON_ID,
        days: PLACEHOLDER_DAYS as unknown as object,
      },
    });
  }
}

/** "HH:MM", 24-hour — the same shape the DTO enforces on the way in. */
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Coerce whatever is in the JSON column into seven well-formed days.
 *
 * The column is `Json`, so nothing at the type level stops a bad write, and
 * every malformed field fails in the same expensive direction: a missing
 * weekday reads as "closed", and so does an unparseable `opensAt`, because
 * `intervalOn` gives up on a time it cannot read. Either one pushes an EXPRESS
 * deadline the patient was promised in an hour into next week. Fill the gaps
 * from the placeholder instead of inheriting them.
 *
 * The DTO validates the same shape, so a value that gets here malformed either
 * predates that check or was written straight to the database.
 */
export function normalizeDays(raw: unknown): WorkingDay[] {
  const list = Array.isArray(raw) ? (raw as Partial<WorkingDay>[]) : [];
  const time = (value: unknown, fallback: string): string =>
    typeof value === 'string' && HH_MM.test(value) ? value : fallback;

  return PLACEHOLDER_DAYS.map((fallback) => {
    const found = list.find((d) => Number(d?.weekday) === fallback.weekday);
    if (!found) return fallback;
    return {
      weekday: fallback.weekday,
      closed:
        typeof found.closed === 'boolean' ? found.closed : fallback.closed,
      opensAt: time(found.opensAt, fallback.opensAt),
      closesAt: time(found.closesAt, fallback.closesAt),
    };
  });
}

function toDto(row: {
  timezone: string;
  days: unknown;
  expressSlaMinutes: number;
  isPlaceholder: boolean;
  updatedAt: Date;
}): WorkingHoursDto {
  return {
    timezone: row.timezone,
    days: normalizeDays(row.days),
    expressSlaMinutes: row.expressSlaMinutes,
    isPlaceholder: row.isPlaceholder,
    updatedAt: row.updatedAt.toISOString(),
  };
}
