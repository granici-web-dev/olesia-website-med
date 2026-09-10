import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';

/** Calendly's own recommended tolerance for the signature timestamp. */
const SIGNATURE_TOLERANCE_SECONDS = 180;

/** A single custom question/answer pair from the booking form. */
export interface CalendlyQuestionAnswer {
  question: string;
  answer: string;
  position: number;
}

/** Minimal shape of the Calendly v2 `invitee.*` webhook payload we consume. */
export interface CalendlyWebhookBody {
  event: string; // 'invitee.created' | 'invitee.canceled' | 'invitee_no_show.created'
  payload?: {
    /** The invitee's own URI — what a reschedule names its predecessor by. */
    uri?: string;
    name?: string;
    email?: string;
    cancel_url?: string;
    reschedule_url?: string;
    /** True on both halves of a reschedule: the cancel and the new booking. */
    rescheduled?: boolean;
    /** On the new booking, the invitee URI of the one it replaces. */
    old_invitee?: string | null;
    new_invitee?: string | null;
    questions_and_answers?: CalendlyQuestionAnswer[];
    scheduled_event?: {
      uri?: string;
      start_time?: string;
      end_time?: string;
      event_type?: string;
      location?: { type?: string; join_url?: string | null; location?: string };
    };
  };
}

/** A scheduled event as returned by the Calendly REST API (backup-sync). */
export interface CalendlyScheduledEvent {
  uri: string;
  status: string; // 'active' | 'canceled'
  start_time: string;
  end_time: string;
  event_type: string;
  location?: { type?: string; join_url?: string | null; location?: string };
}

/** An invitee as returned by the Calendly REST API. */
export interface CalendlyInvitee {
  uri?: string;
  name?: string;
  email?: string;
  status?: string;
  cancel_url?: string;
  reschedule_url?: string;
  questions_and_answers?: CalendlyQuestionAnswer[];
}

/** The outcome of one Calendly API call: parsed body, or the status it failed with. */
export type CalendlyApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number | null };

/** One page of a Calendly list response. */
export interface CalendlyPage<T> {
  collection: T[];
  pagination?: { next_page: string | null };
}

/**
 * An event type as returned by the Calendly REST API — one bookable
 * consultation on her calendar. `uri` is the value a service must store: the
 * webhook identifies a booking by event type and by nothing else.
 */
export interface CalendlyEventType {
  uri: string;
  name: string;
  slug?: string;
  scheduling_url: string;
  duration?: number;
  active?: boolean;
  /** 'solo' | 'group'; the consultations are all solo. */
  pooling_type?: string | null;
}

/**
 * Calendly integration helpers (module_calendly.md §8): webhook signature
 * verification, payload extraction, and the REST API client used by the
 * backup-sync cron. The service-code mapping itself lives in the DB
 * (`Service.calendlyEventTypeUri`) and is resolved by the caller — never
 * trust the editable `a1` answer.
 */
@Injectable()
export class CalendlyService {
  private readonly logger = new Logger(CalendlyService.name);
  private readonly signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY ?? '';
  private readonly apiToken = process.env.CALENDLY_API_TOKEN ?? '';
  private readonly orgUri = process.env.CALENDLY_ORG_URI ?? '';
  private readonly apiBase = 'https://api.calendly.com';

  /** True when the REST API credentials needed for backup-sync are present. */
  isApiConfigured(): boolean {
    return Boolean(this.apiToken && this.orgUri);
  }

  /**
   * Verify the `Calendly-Webhook-Signature: t=<ts>,v1=<hmac>` header against
   * the raw request bytes. HMAC-SHA256 over `"<ts>.<rawBody>"`, hex-encoded.
   *
   * `t` is Unix seconds and deliveries older than `SIGNATURE_TOLERANCE_SECONDS`
   * are refused, which is Calendly's own recommendation: without it a captured
   * delivery stays valid forever, and replaying an old `invitee.created` walks
   * a consultation's start time backwards through `applyBooking`.
   *
   * The rejection reason is logged (never the body) because the failure this
   * catches in practice is not an attack but a wrong signing key after an
   * account swap, which otherwise looks like "bookings stopped arriving".
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

    const ageSeconds = Math.abs(Date.now() / 1000 - Number(t));
    if (!Number.isFinite(ageSeconds) || ageSeconds > SIGNATURE_TOLERANCE_SECONDS) {
      this.logger.warn(
        `Calendly webhook signature outside the tolerance window (t=${t}, age=${Math.round(ageSeconds)}s) — rejected.`,
      );
      return false;
    }

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

  /**
   * The video-meeting link, and only that. `location.location` is deliberately
   * ignored: for the "ask invitee" location types it is free text the person
   * booking typed, and it used to end up in `videoUrl`, which the back office
   * renders as the "join the call" link.
   */
  extractVideoUrl(
    location: { join_url?: string | null; location?: string } | undefined,
  ): string | null {
    const joinUrl = location?.join_url;
    return joinUrl?.startsWith('https://') ? joinUrl : null;
  }

  /**
   * Authenticated GET against the Calendly API. The failed case is a value
   * rather than `null`, because the caller reconciles bookings: a page that
   * failed and a page that was empty must not look the same to it.
   */
  private async apiGet<T>(url: string): Promise<CalendlyApiResult<T>> {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      });
      if (!res.ok) {
        this.logger.error(`Calendly API ${res.status} for ${url}`);
        return { ok: false, status: res.status };
      }
      return { ok: true, data: (await res.json()) as T };
    } catch (err) {
      this.logger.error(`Calendly API request failed: ${String(err)}`);
      return { ok: false, status: null };
    }
  }

  /**
   * List organization scheduled events overlapping [minStart, maxStart],
   * following pagination. `partial` says a page failed, so the caller knows
   * the reconciliation it just ran covered less than it asked for.
   */
  async listScheduledEvents(
    minStart: Date,
    maxStart: Date,
  ): Promise<{ events: CalendlyScheduledEvent[]; partial: boolean }> {
    if (!this.isApiConfigured()) return { events: [], partial: false };
    const params = new URLSearchParams({
      organization: this.orgUri,
      min_start_time: minStart.toISOString(),
      max_start_time: maxStart.toISOString(),
      count: '100',
    });
    const out: CalendlyScheduledEvent[] = [];
    let url: string | null = `${this.apiBase}/scheduled_events?${params}`;
    while (url) {
      // Annotated rather than inferred: `url` is reassigned from `page` below,
      // so letting TS infer `page` from `url` makes the type self-referential.
      const page: CalendlyApiResult<CalendlyPage<CalendlyScheduledEvent>> =
        await this.apiGet<CalendlyPage<CalendlyScheduledEvent>>(url);
      if (!page.ok) return { events: out, partial: true };
      out.push(...page.data.collection);
      url = page.data.pagination?.next_page ?? null;
    }
    return { events: out, partial: false };
  }

  /**
   * The organization's event types — what the doctor actually has on her
   * calendar.
   *
   * This exists to kill the launch swap by hand. Both Calendly fields on a
   * service used to be free text, and pasting them by hand has already gone
   * wrong once: the mapping ended up with nutrition pointing at the pediatric
   * event. Reading the list from her own account and picking from it removes
   * the transcription step entirely.
   */
  async listEventTypes(): Promise<CalendlyEventType[]> {
    if (!this.isApiConfigured()) return [];
    const params = new URLSearchParams({
      organization: this.orgUri,
      count: '100',
    });
    const out: CalendlyEventType[] = [];
    let url: string | null = `${this.apiBase}/event_types?${params}`;
    while (url) {
      const page: CalendlyApiResult<CalendlyPage<CalendlyEventType>> =
        await this.apiGet<CalendlyPage<CalendlyEventType>>(url);
      if (!page.ok) break;
      out.push(...page.data.collection);
      url = page.data.pagination?.next_page ?? null;
    }
    return out;
  }

  /** Invitees of a scheduled event (1:1 for these consultations). */
  async listEventInvitees(eventUri: string): Promise<CalendlyInvitee[]> {
    if (!this.isApiConfigured()) return [];
    const page = await this.apiGet<{ collection: CalendlyInvitee[] }>(
      `${eventUri}/invitees?count=100`,
    );
    return page.ok ? page.data.collection : [];
  }
}
