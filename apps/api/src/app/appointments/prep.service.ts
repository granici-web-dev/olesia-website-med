import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '../../generated/prisma/enums';
import { NotificationsService } from './notifications.service';
import { prepChecklist } from './prep.constants';

const PREP_WINDOW_HOURS = 24;
const PREP_BATCH = 50;

/**
 * Preparation scheduler (module_calendly.md §8.6): 24h before a scheduled
 * consultation, send the client the service-specific prep checklist and stamp
 * `prepSentAt`.
 *
 * The stamp is claimed *before* the message goes out, by a conditional update
 * that only one caller can win, and released again if the send fails. Sending
 * first and stamping after would double-send the moment a transport exists:
 * a message that went out and then failed to stamp is one the next tick sends
 * again, and two instances running the same cron would both take the same
 * rows.
 */
@Injectable()
export class PrepService {
  private readonly logger = new Logger(PrepService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scheduledDispatch(): Promise<void> {
    await this.runPrepDispatch();
  }

  /** Dispatch prep for all due consultations; safe to call manually. */
  async runPrepDispatch(): Promise<{ dispatched: number }> {
    const now = new Date();
    const until = new Date(now.getTime() + PREP_WINDOW_HOURS * 3_600_000);

    const due = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.scheduled,
        prepSentAt: null,
        startTime: { gte: now, lte: until },
      },
      include: { service: true },
      orderBy: { startTime: 'asc' },
      take: PREP_BATCH,
    });

    let dispatched = 0;
    for (const appt of due) {
      const claimed = await this.prisma.appointment.updateMany({
        where: { id: appt.id, prepSentAt: null },
        data: { prepSentAt: new Date() },
      });
      if (claimed.count === 0) continue;

      try {
        await this.notifications.sendPrepInstructions({
          to: appt.clientEmail,
          clientName: appt.clientName,
          serviceTitle: appt.service.titleRo,
          startTime: appt.startTime,
          videoUrl: appt.videoUrl,
          checklist: prepChecklist(appt.service.code),
        });
        dispatched++;
      } catch (err) {
        // Hand the row back so the next tick retries it, and keep going: one
        // undeliverable address must not cost every other patient their
        // instructions.
        await this.prisma.appointment.update({
          where: { id: appt.id },
          data: { prepSentAt: null },
        });
        this.logger.error(
          `Prep dispatch failed for appointment ${appt.id}: ${String(err)}`,
        );
      }
    }
    if (dispatched > 0) {
      this.logger.log(`Prep dispatched for ${dispatched} appointment(s).`);
    }
    return { dispatched };
  }
}
