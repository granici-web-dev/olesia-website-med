import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CalendlyService } from './calendly.service';
import { AppointmentsService } from './appointments.service';

const LOOKBACK_DAYS = 1;
const LOOKAHEAD_DAYS = 60;

export interface SyncStats {
  configured: boolean;
  scanned: number;
  created: number;
  updated: number;
  canceled: number;
  skipped: number;
}

/**
 * Backup synchronization against Calendly's source of truth
 * (module_calendly.md §8.5). Polls the REST API on a schedule and reconciles
 * the DB, covering any webhook deliveries that were lost. No-ops when the API
 * is not configured; a re-entrancy guard prevents overlapping runs.
 */
@Injectable()
export class CalendlySyncService {
  private readonly logger = new Logger(CalendlySyncService.name);
  private running = false;

  constructor(
    private readonly calendly: CalendlyService,
    private readonly appointments: AppointmentsService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async scheduledSync(): Promise<void> {
    await this.runBackupSync();
  }

  /** Run one reconciliation pass; safe to call manually (admin endpoint). */
  async runBackupSync(): Promise<SyncStats> {
    const stats: SyncStats = {
      configured: this.calendly.isApiConfigured(),
      scanned: 0,
      created: 0,
      updated: 0,
      canceled: 0,
      skipped: 0,
    };
    if (!stats.configured) {
      this.logger.log('Calendly API not configured — backup-sync skipped.');
      return stats;
    }
    if (this.running) {
      this.logger.warn('Backup-sync already running — tick skipped.');
      return stats;
    }
    this.running = true;
    try {
      const now = Date.now();
      const events = await this.calendly.listScheduledEvents(
        new Date(now - LOOKBACK_DAYS * 86_400_000),
        new Date(now + LOOKAHEAD_DAYS * 86_400_000),
      );
      stats.scanned = events.length;

      for (const ev of events) {
        if (ev.status === 'canceled') {
          await this.appointments.applyCancellation(ev.uri);
          stats.canceled++;
          continue;
        }
        const [invitee] = await this.calendly.listEventInvitees(ev.uri);
        if (!invitee) {
          stats.skipped++;
          continue;
        }
        const outcome = await this.appointments.applyBooking({
          eventUri: ev.uri,
          eventTypeUri: ev.event_type,
          clientName: invitee.name ?? 'Necunoscut',
          clientEmail: invitee.email ?? '',
          reason: this.calendly.extractReason(invitee.questions_and_answers),
          startTime: new Date(ev.start_time),
          endTime: new Date(ev.end_time),
          videoUrl: this.calendly.extractVideoUrl(ev.location),
          cancelUrl: invitee.cancel_url ?? null,
          rescheduleUrl: invitee.reschedule_url ?? null,
        });
        stats[outcome]++;
      }
      this.logger.log(`Backup-sync done: ${JSON.stringify(stats)}`);
      return stats;
    } finally {
      this.running = false;
    }
  }
}
