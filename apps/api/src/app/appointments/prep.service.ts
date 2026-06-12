import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '../../generated/prisma/enums';
import { NotificationsService } from './notifications.service';
import { prepChecklist } from './prep.constants';

const PREP_WINDOW_HOURS = 24;

/**
 * Preparation scheduler (module_calendly.md §8.6): 24h before a scheduled
 * consultation, send the client the service-specific prep checklist and stamp
 * `prepSentAt`. The stamp makes it idempotent across ticks.
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
    });

    let dispatched = 0;
    for (const appt of due) {
      await this.notifications.sendPrepInstructions({
        to: appt.clientEmail,
        clientName: appt.clientName,
        serviceTitle: appt.service.titleRo,
        startTime: appt.startTime,
        videoUrl: appt.videoUrl,
        checklist: prepChecklist(appt.service.code),
      });
      await this.prisma.appointment.update({
        where: { id: appt.id },
        data: { prepSentAt: new Date() },
      });
      dispatched++;
    }
    if (dispatched > 0) {
      this.logger.log(`Prep dispatched for ${dispatched} appointment(s).`);
    }
    return { dispatched };
  }
}
