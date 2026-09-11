/**
 * Public lead-intake client (browser → NestJS API). Posts the group-B service
 * forms (Monitorizare / Întrebare EXPRESS) to the public `/leads/*` endpoints.
 * The API base comes from `normalizeApiBase()` and must be browser-reachable.
 * CORS for the site origin is enabled server-side.
 */
import type { ContactMessageSubject } from '@olesia/shared';

import { getCaptchaToken, type CaptchaAction } from './captcha';
import { normalizeApiBase } from './api-base';

const API_BASE = normalizeApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  'NEXT_PUBLIC_API_URL',
);

export type LeadService = 'monitoring' | 'quick_question';

/** The three locales the site is written in; the API records which one wrote. */
export type LeadLocale = 'ro' | 'en' | 'ru';

/**
 * `useLocale()` is typed as `string`, and the API only accepts the three.
 * Anything else is Romanian, which is the site's default and the API's.
 */
export function leadLocale(raw: string): LeadLocale {
  return raw === 'en' || raw === 'ru' ? raw : 'ro';
}

/**
 * What every public form sends.
 *
 * `locale` is the page the person is reading, so a written answer comes back
 * in their language instead of Romanian by default. `company` is the honeypot
 * — a hidden field a person never fills and a bot does; it is on all four
 * forms now, not just the contact page (audit A3, F16).
 */
export interface PublicLeadInput {
  name: string;
  email: string;
  locale: LeadLocale;
  /** Honeypot — leave empty; only bots fill it. */
  company?: string;
}

export interface MonitoringLeadInput extends PublicLeadInput {
  phone?: string;
  message?: string;
}

export interface QuickQuestionLeadInput extends PublicLeadInput {
  phone?: string;
  question: string;
}

export type ContactSubject = ContactMessageSubject;

export interface ContactMessageInput extends PublicLeadInput {
  subject: ContactSubject;
  message: string;
}

/**
 * A refused submission, carrying enough for the form to say what happened.
 *
 * `status` is 0 when the request never reached the API at all — an offline
 * visitor and a 500 need different sentences, and before this they got the
 * same one (audit A6, F14). `code` is the API's machine code when it sent one.
 * `describeLeadError` in `lib/form-errors.ts` turns the pair into wording.
 */
export class LeadError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(`lead_failed_${status}${code ? `_${code}` : ''}`);
  }
}

/** The API's machine code, when the body carries one. */
async function readCode(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    const first = Array.isArray(body.message) ? body.message[0] : body.message;
    return typeof first === 'string' ? first : '';
  } catch {
    // A proxy answering 429 or 502 with HTML; the status is all there is.
    return '';
  }
}

/**
 * Every lead carries a reCAPTCHA token in `x-captcha-token` — a header rather
 * than a body field, because the API validates bodies with
 * `forbidNonWhitelisted` and a header keeps the token out of logged payloads.
 * The token is minted per action, so one form's token cannot be replayed
 * against another. Without a site key `getCaptchaToken` returns null and the
 * header is simply omitted.
 *
 * Exported because the newsletter posts to the same API with the same captcha
 * header and the same failure modes, and had its own copy of all of it — one
 * that turned every failure into the string `'error'`, so a rate limit and a
 * rejected captcha reached the visitor as "something went wrong" (audit A7).
 *
 * The response body is returned for the callers that need it: the three
 * checkouts, each answered with the bank's URL to redirect to. The lead forms
 * ignore it and are typed `void`.
 */
export async function postLead<T = void>(
  path: string,
  body: unknown,
  action: CaptchaAction,
): Promise<T> {
  const token = await getCaptchaToken(action);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-captcha-token': token } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    // `fetch` rejects only when the request never happened: offline, DNS, CORS.
    throw new LeadError(0, '');
  }
  if (!res.ok) throw new LeadError(res.status, await readCode(res));
  return (await res.json().catch(() => undefined)) as T;
}

export function submitMonitoringLead(input: MonitoringLeadInput): Promise<void> {
  return postLead('/leads/monitoring', input, 'lead_monitoring');
}

export function submitQuickQuestionLead(
  input: QuickQuestionLeadInput,
): Promise<void> {
  return postLead('/leads/quick-question', input, 'lead_quick_question');
}

export function submitContactMessage(input: ContactMessageInput): Promise<void> {
  return postLead('/leads/contact', input, 'lead_contact');
}

