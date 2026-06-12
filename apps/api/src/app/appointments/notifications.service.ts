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
 * PII-safe recipient for logs: keep the first character + domain so delivery
 * is traceable without writing a full email address to disk. GDPR: no raw
 * names/emails in logs.
 */
function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  return `${email[0]}***${email.slice(at)}`;
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
    // PII-safe: mask the recipient and omit the client name + checklist.
    this.logger.log(
      `PREP → ${maskEmail(n.to)} · "${n.serviceTitle}" @ ${n.startTime.toISOString()}`,
    );
  }
}
