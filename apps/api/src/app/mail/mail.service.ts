import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

import { maskEmail } from '../common/mask-email';

/** A notification email addressed to the practice inbox. */
export interface LeadMail {
  subject: string;
  /** Body lines — may contain lead PII; the body is never written to logs. */
  lines: string[];
}

/** An email addressed to a patient rather than to the practice. */
export interface ClientMail extends LeadMail {
  to: string;
}

/**
 * The transport's own error, as nodemailer reports it. `message` is not safe
 * to log: an SMTP rejection quotes the envelope, so the recipient's address
 * comes back inside it (audit A3, F14).
 */
function transportFailure(err: unknown): string {
  const e = err as { code?: unknown; responseCode?: unknown } | null;
  const code = typeof e?.code === 'string' ? e.code : 'unknown';
  const responseCode =
    typeof e?.responseCode === 'number' ? ` smtp=${e.responseCode}` : '';
  return `code=${code}${responseCode}`;
}

/**
 * Outbound email. Provider-agnostic SMTP configured from env
 * (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS, optional SMTP_FROM); the
 * destination inbox is LEADS_NOTIFY_EMAIL, which has no default — it used to
 * fall back to a developer's personal Gmail, so a deployment that forgot the
 * variable sent every lead, medical questions included, to a private mailbox
 * (audit A3, F5). In production `main.ts` refuses to start without it; in
 * development its absence degrades to log-only, like a missing SMTP host.
 * Logs never include names, addresses or message bodies (GDPR).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transport: Transporter | null;
  private readonly to = process.env.LEADS_NOTIFY_EMAIL ?? '';
  private readonly from =
    process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'no-reply@olesia.local';

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (host && user && pass) {
      const port = Number(process.env.SMTP_PORT ?? 587);
      this.transport = createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.transport = null;
      this.logger.warn(
        'SMTP not configured — nothing is emailed, to the practice or to a patient (set SMTP_HOST/SMTP_USER/SMTP_PASS).',
      );
    }
    if (!this.to) {
      this.logger.warn(
        'LEADS_NOTIFY_EMAIL is not set — lead notifications have nowhere to go and are logged only.',
      );
    }
  }

  /**
   * Whether a message can actually leave. Callers that would otherwise claim
   * "sent" ask this first; the scheduled prep dispatch uses it to skip its
   * work rather than stamp rows for messages nobody receives.
   */
  get isConfigured(): boolean {
    return this.transport !== null;
  }

  /**
   * Send to a patient (best-effort). With no SMTP the message is not
   * delivered, and the caller has to have a second way to get it there —
   * which is why every upload link is also copyable from the back office
   * rather than being email-only.
   *
   * Returns whether it actually went out, so the caller can say so honestly.
   */
  async sendToClient(mail: ClientMail): Promise<boolean> {
    if (!this.transport) {
      this.logger.log(
        `[mail:log-only] client → ${maskEmail(mail.to)} · ${mail.subject}`,
      );
      return false;
    }
    try {
      await this.transport.sendMail({
        from: this.from,
        to: mail.to,
        subject: mail.subject,
        text: mail.lines.join('\n'),
      });
      this.logger.log(
        `Client mail sent → ${maskEmail(mail.to)} · ${mail.subject}`,
      );
      return true;
    } catch (err) {
      this.logger.error(`Client email failed: ${transportFailure(err)}`);
      return false;
    }
  }

  /** Send a lead notification to the practice inbox (best-effort). */
  async sendLeadNotification(mail: LeadMail): Promise<void> {
    if (!this.transport || !this.to) {
      this.logger.log(`[mail:log-only] lead · ${mail.subject}`);
      return;
    }
    try {
      await this.transport.sendMail({
        from: this.from,
        to: this.to,
        subject: mail.subject,
        text: mail.lines.join('\n'),
      });
      this.logger.log(
        `Lead notification sent → ${maskEmail(this.to)} · ${mail.subject}`,
      );
    } catch (err) {
      // A failed email must not fail the lead submission — the record is saved.
      this.logger.error(`Lead email failed: ${transportFailure(err)}`);
    }
  }
}
