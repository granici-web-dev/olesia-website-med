import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';

/** A single custom question/answer pair from the booking form. */
export interface CalendlyQuestionAnswer {
  question: string;
  answer: string;
  position: number;
}

/** Minimal shape of the Calendly v2 `invitee.*` webhook payload we consume. */
export interface CalendlyWebhookBody {
  event: string; // 'invitee.created' | 'invitee.canceled' | ...
  payload?: {
    name?: string;
    email?: string;
    cancel_url?: string;
    reschedule_url?: string;
    questions_and_answers?: CalendlyQuestionAnswer[];
    scheduled_event?: {
      uri?: string;
      start_time?: string;
      end_time?: string;
      event_type?: string;
      location?: { type?: string; join_url?: string; location?: string };
    };
  };
}

/**
 * Calendly integration helpers (module_calendly.md §8): webhook signature
 * verification and payload extraction. The service-code mapping itself lives
 * in the DB (`Service.calendlyEventTypeUri`) and is resolved by the caller —
 * never trust the editable `a1` answer.
 */
@Injectable()
export class CalendlyService {
  private readonly logger = new Logger(CalendlyService.name);
  private readonly signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY ?? '';

  /**
   * Verify the `Calendly-Webhook-Signature: t=<ts>,v1=<hmac>` header against
   * the raw request bytes. HMAC-SHA256 over `"<ts>.<rawBody>"`, hex-encoded.
   */
  verifySignature(
    rawBody: Buffer | undefined,
    header: string | undefined,
  ): boolean {
    if (!this.signingKey) {
      this.logger.error(
        'CALENDLY_WEBHOOK_SIGNING_KEY is not set — rejecting webhook.',
      );
      return false;
    }
    if (!rawBody || !header) return false;

    let t: string | undefined;
    let v1: string | undefined;
    for (const part of header.split(',')) {
      const eq = part.indexOf('=');
      if (eq === -1) continue;
      const key = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      if (key === 't') t = value;
      else if (key === 'v1') v1 = value;
    }
    if (!t || !v1) return false;

    const expected = createHmac('sha256', this.signingKey)
      .update(`${t}.${rawBody.toString('utf8')}`)
      .digest('hex');

    const a = Buffer.from(expected);
    const b = Buffer.from(v1);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  /** Join the booking form answers into a single reason string. */
  extractReason(qa: CalendlyQuestionAnswer[] | undefined): string | null {
    if (!qa?.length) return null;
    const joined = [...qa]
      .sort((x, y) => x.position - y.position)
      .map((x) => x.answer?.trim())
      .filter(Boolean)
      .join(' · ');
    return joined || null;
  }

  /** Best-effort video-meeting link from the scheduled event location. */
  extractVideoUrl(
    location: { join_url?: string; location?: string } | undefined,
  ): string | null {
    if (!location) return null;
    return location.join_url ?? location.location ?? null;
  }
}
