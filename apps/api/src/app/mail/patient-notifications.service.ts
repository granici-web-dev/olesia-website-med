import { Injectable, Logger } from '@nestjs/common';
import type { PurchaseNextStepDto } from '@olesia/shared';

import { maskEmail } from '../common/mask-email';
import { legalEntity } from '../common/legal-entity';
import { WorkingHoursService } from '../working-hours/working-hours.service';
import { MailService, type MailAttachment } from './mail.service';
import {
  ANSWER_TEMPLATES,
  DOCUMENT_TEMPLATES,
  PAYMENT_RECEIPT_TEMPLATES,
  PREP_TEMPLATES,
  PRESCRIPTION_TEMPLATES,
  UPLOAD_LINK_TEMPLATES,
  render,
  type AnswerVars,
  type DocumentVars,
  type PaymentReceiptVars,
  type PrepVars,
  type PrescriptionVars,
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
    return this.send(
      'answer',
      recipient,
      render(ANSWER_TEMPLATES, recipient.locale, vars),
    );
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
   * The confirmation the bank's go-live checklist requires after a payment.
   *
   * The amount is formatted here rather than in the template: it is the same
   * number in all three languages and the currency belongs next to it, so
   * three copies of `Intl.NumberFormat` in the templates would be three places
   * to get the same rounding wrong.
   */
  async paymentReceipt(
    recipient: Recipient,
    vars: Omit<
      PaymentReceiptVars,
      'paidAt' | 'amount' | 'merchant' | 'nextStep'
    > & {
      paidAt: Date;
      amount: number;
      currency: string;
      /** Same shape, with the expiry still an ISO string — formatted here. */
      nextStep?: PurchaseNextStepDto;
    },
  ): Promise<Delivery> {
    const { amount, currency, paidAt, nextStep, ...rest } = vars;
    return this.send(
      'payment-receipt',
      recipient,
      render(PAYMENT_RECEIPT_TEMPLATES, recipient.locale, {
        ...rest,
        amount: new Intl.NumberFormat('ro-RO', {
          style: 'currency',
          currency,
        }).format(amount),
        paidAt: await this.formatDateTime(paidAt),
        merchant: legalEntity().registeredName,
        nextStep: nextStep && {
          kind: nextStep.kind,
          url: nextStep.url,
          expiresAt: await this.formatDate(new Date(nextStep.expiresAt)),
          downloads: nextStep.downloadsLeft ?? undefined,
        },
      }),
    );
  }

  /**
   * A prescription from the dossier: its text in the body, its file as an
   * attachment, or both (docs/shape-prescription-file.md).
   *
   * These two are the only messages with a Reply-To: the patient's reply is
   * about the treatment and belongs with the doctor, not in the practice
   * inbox. `DOCTOR_REPLY_TO_EMAIL` is optional, and unset means the reply
   * goes to From, which still reaches the practice.
   */
  async prescription(
    recipient: Recipient,
    vars: Omit<PrescriptionVars, 'attached'>,
    attachment?: MailAttachment,
  ): Promise<Delivery> {
    return this.send(
      'prescription',
      recipient,
      render(PRESCRIPTION_TEMPLATES, recipient.locale, {
        ...vars,
        attached: attachment !== undefined,
      }),
      {
        replyTo: process.env.DOCTOR_REPLY_TO_EMAIL || undefined,
        attachments: attachment && [attachment],
      },
    );
  }

  /** A stored document, as an attachment, from the dossier. */
  async document(
    recipient: Recipient,
    vars: DocumentVars,
    attachment: MailAttachment,
  ): Promise<Delivery> {
    return this.send(
      'document',
      recipient,
      render(DOCUMENT_TEMPLATES, recipient.locale, vars),
      {
        replyTo: process.env.DOCTOR_REPLY_TO_EMAIL || undefined,
        attachments: [attachment],
      },
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
    return at.toLocaleDateString('ro-RO', {
      timeZone: timezone,
      dateStyle: 'long',
    });
  }

  private async send(
    kind: string,
    recipient: Recipient,
    message: { subject: string; lines: string[] },
    extra: { replyTo?: string; attachments?: MailAttachment[] } = {},
  ): Promise<Delivery> {
    const sent = await this.mail.sendToClient({
      to: recipient.to,
      subject: message.subject,
      lines: message.lines,
      ...extra,
    });
    const outcome = sent
      ? 'sent'
      : this.mail.isConfigured
        ? 'NOT sent (transport failed)'
        : 'NOT sent (no SMTP)';
    this.logger.log(
      `patient mail ${kind} ${outcome} → ${maskEmail(recipient.to)}`,
    );
    return { sent };
  }
}
