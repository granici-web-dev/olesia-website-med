import { Injectable, Logger } from '@nestjs/common';

/** A prep-instructions message addressed to a client. */
export interface PrepNotification {
  to: string;
  clientName: string;
  serviceTitle: string;
  startTime: Date;
  videoUrl: string | null;
  checklist: string;
}

/**
 * Outbound client notifications (module_calendly.md §8.6). No email transport
 * is wired yet — this logs the message and is the single seam to swap in
 * SMTP/a provider later, the same way `storage` abstracts file persistence.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendPrepInstructions(n: PrepNotification): Promise<void> {
    // TODO(email): replace the log with a real transport (nodemailer/provider).
    this.logger.log(
      `PREP → ${n.to} (${n.clientName}) · "${n.serviceTitle}" @ ` +
        `${n.startTime.toISOString()} · ${n.checklist}`,
    );
  }
}
