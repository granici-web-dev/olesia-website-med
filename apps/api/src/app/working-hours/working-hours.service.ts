import { Injectable, Logger } from '@nestjs/common';
import type { WorkingHoursDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';
import {
  addWorkingMinutes,
  isOpenAt,
  type Schedule,
  PLACEHOLDER_DAYS,
  type WorkingDay,
} from './business-hours';

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
    return toDto(await this.getOrCreate());
  }

  async update(dto: UpdateWorkingHoursDto): Promise<WorkingHoursDto> {
    const current = await this.getOrCreate();

    const updated = await this.prisma.workingHours.update({
      where: { id: current.id },
      data: {
        ...(dto.timezone ? { timezone: dto.timezone } : {}),
        ...(dto.days ? { days: dto.days as unknown as object } : {}),
        ...(dto.expressSlaMinutes !== undefined
          ? { expressSlaMinutes: dto.expressSlaMinutes }
          : {}),
        // Editing the schedule is the act of confirming it. Nothing else can
        // clear the placeholder flag, so it cannot be dismissed by accident.
        isPlaceholder:
          dto.isPlaceholder ?? (dto.days ? false : current.isPlaceholder),
      },
    });
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
      timezone: row.timezone,
      days: normalizeDays(row.days),
      expressSlaMinutes: row.expressSlaMinutes,
    };
  }

  private async getOrCreate() {
    const existing = await this.prisma.workingHours.findFirst();
    if (existing) return existing;

    this.logger.warn(
      'No working hours configured — creating the placeholder schedule (Mon–Fri 09:00–17:00).',
    );
    return this.prisma.workingHours.create({
      data: { days: PLACEHOLDER_DAYS as unknown as object },
    });
  }
}

/**
 * Coerce whatever is in the JSON column into seven well-formed days.
 *
 * The column is `Json`, so nothing at the type level stops a bad write, and a
 * missing weekday would silently read as "closed" — which would push every
 * deadline into next week. Fill the gaps from the placeholder instead.
 */
function normalizeDays(raw: unknown): WorkingDay[] {
  const list = Array.isArray(raw) ? (raw as Partial<WorkingDay>[]) : [];
  return PLACEHOLDER_DAYS.map((fallback) => {
    const found = list.find((d) => Number(d?.weekday) === fallback.weekday);
    if (!found) return fallback;
    return {
      weekday: fallback.weekday,
      closed: Boolean(found.closed),
      opensAt: typeof found.opensAt === 'string' ? found.opensAt : fallback.opensAt,
      closesAt:
        typeof found.closesAt === 'string' ? found.closesAt : fallback.closesAt,
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
