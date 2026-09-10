import { Injectable, Logger } from '@nestjs/common';

import { maskEmail } from '../common/mask-email';
import { WorkingHoursService } from '../working-hours/working-hours.service';
import { MailService } from './mail.service';
import {
  ANSWER_TEMPLATES,
  PREP_TEMPLATES,
  UPLOAD_LINK_TEMPLATES,
  render,
  type AnswerVars,
  type PrepVars,
  type UploadLinkVars,
} from './patient-templates';

/** Whether the message actually left. Never assumed — see the class doc. */
export interface Delivery {
  sent: boolean;
}

interface Recipient {
  to: string;
  locale: string | null;
}

/**
 * Everything this system writes to a patient, in one place.
 *
 * There used to be two seams (audit A3, F7 in the notification sense):
 * `MailService`, which has a real transport and served the practice inbox,
 * and `NotificationsService` in `appointments`, which was a `logger.log` with
 * a `TODO(email)` and served the patient. The live path served us; the dead
 * one served them. This is the single one, over the real transport.
 *
 * Every method answers whether the message left, and callers are expected to
 * pass that on rather than swallow it. With no SMTP configured nothing is
 * delivered, and the honest thing — already the pattern in `uploads` — is to
 * tell the doctor so she sends it herself, not to show her "sent".
 */
@Injectable()
export class PatientNotificationsService {
  private readonly logger = new Logger(PatientNotificationsService.name);

  constructor(
    private readonly mail: MailService,
    private readonly workingHours: WorkingHoursService,
  ) {}

  /** Whether a message can leave at all. Callers use it to skip work. */
  get canSend(): boolean {
    return this.mail.isConfigured;
  }

  /** The written answer to an EXPRESS question. */
  async answerToQuestion(
    recipient: Recipient,
    vars: AnswerVars,
  ): Promise<Delivery> {
    return this.send('answer', recipient, render(ANSWER_TEMPLATES, recipient.locale, vars));
  }

  /** Preparation instructions ahead of a consultation. */
  async prepInstructions(
    recipient: Recipient,
    vars: Omit<PrepVars, 'startsAt'> & { startsAt: Date },
  ): Promise<Delivery> {
    const startsAt = await this.formatDateTime(vars.startsAt);
    return this.send(
      'prep',
      recipient,
      render(PREP_TEMPLATES, recipient.locale, { ...vars, startsAt }),
    );
  }

  /** The personal link a patient sends their test results through. */
  async uploadLink(
    recipient: Recipient,
    vars: Omit<UploadLinkVars, 'expiresAt'> & { expiresAt: Date },
  ): Promise<Delivery> {
    const expiresAt = await this.formatDate(vars.expiresAt);
    return this.send(
      'upload-link',
      recipient,
      render(UPLOAD_LINK_TEMPLATES, recipient.locale, { ...vars, expiresAt }),
    );
  }

  /**
   * A date and time as the practice reads it.
   *
   * `toLocaleString` with no zone formats in the server's, which in a
   * container is UTC — so the whole point of computing in `Europe/Chisinau`
   * was being thrown away on the last line (audit A3, F10).
   */
  private async formatDateTime(at: Date): Promise<string> {
    const { timezone } = await this.workingHours.get();
    return at.toLocaleString('ro-RO', {
      timeZone: timezone,
      dateStyle: 'long',
      timeStyle: 'short',
    });
  }

  private async formatDate(at: Date): Promise<string> {
    const { timezone } = await this.workingHours.get();
    return at.toLocaleDateString('ro-RO', { timeZone: timezone, dateStyle: 'long' });
  }

  private async send(
    kind: string,
    recipient: Recipient,
    message: { subject: string; lines: string[] },
  ): Promise<Delivery> {
    const sent = await this.mail.sendToClient({
      to: recipient.to,
      subject: message.subject,
      lines: message.lines,
    });
    this.logger.log(
      `patient mail ${kind} ${sent ? 'sent' : 'NOT sent (no SMTP)'} → ${maskEmail(recipient.to)}`,
    );
    return { sent };
  }
}
