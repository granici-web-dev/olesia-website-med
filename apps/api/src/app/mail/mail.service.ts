import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

/** A notification email addressed to the practice inbox. */
export interface LeadMail {
  subject: string;
  /** Body lines — may contain lead PII; the body is never written to logs. */
  lines: string[];
}

/** PII-safe recipient for logs (first char + domain). */
function maskEmail(email: string): string {
  const at = email.indexOf('@');
  return at <= 0 ? '***' : `${email[0]}***${email.slice(at)}`;
}

/**
 * Outbound email. Provider-agnostic SMTP configured from env
 * (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS, optional SMTP_FROM); the
 * destination inbox is LEADS_NOTIFY_EMAIL. When SMTP is not configured the
 * service degrades to log-only so the app runs without a mailer — drop the
 * env vars in and emails start flowing, no code change. Logs never include
 * names/emails/message bodies (GDPR).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transport: Transporter | null;
  private readonly to =
    process.env.LEADS_NOTIFY_EMAIL ?? 'designer.nefele@gmail.com';
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
        'SMTP not configured — lead emails are logged only (set SMTP_HOST/SMTP_USER/SMTP_PASS).',
      );
    }
  }

  /** Send a lead notification to the practice inbox (best-effort). */
  async sendLeadNotification(mail: LeadMail): Promise<void> {
    if (!this.transport) {
      this.logger.log(`[mail:log-only] lead → ${maskEmail(this.to)} · ${mail.subject}`);
      return;
    }
    try {
      await this.transport.sendMail({
        from: this.from,
        to: this.to,
        subject: mail.subject,
        text: mail.lines.join('\n'),
      });
      this.logger.log(`Lead notification sent → ${maskEmail(this.to)} · ${mail.subject}`);
    } catch (err) {
      // A failed email must not fail the lead submission — the record is saved.
      this.logger.error(`Lead email failed: ${String(err)}`);
    }
  }
}
