/**
 * Public lead-intake client (browser → NestJS API). Posts the group-B service
 * forms (Monitorizare / Întrebare EXPRESS) to the public `/leads/*` endpoints.
 * The API base is `NEXT_PUBLIC_API_URL` (must be browser-reachable); defaults
 * to the local API. CORS for the site origin is enabled server-side.
 */
import type {
  ContactMessageSubject,
  DeliverableProduct as SharedDeliverableProduct,
} from '@olesia/shared';

import { getCaptchaToken, type CaptchaAction } from './captcha';

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api'
).replace(/\/+$/, '');

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

/**
 * Group-C deliverable order (menus + protocols, brief §2). Unlike group-B this
 * is a one-off product, so the order has to carry WHICH product was chosen —
 * `product`, the stable code (e.g. `menu_7`).
 *
 * Only the code goes over the wire. The label and the price are looked up
 * server-side in the shared catalog: a public form must not be able to name its
 * own price, and the back office must never show a product name that came from
 * the internet.
 *
 * The union of codes is `@olesia/shared`'s, not a copy of it (audit A6, F8):
 * a product added to the catalog and not here would have compiled fine and
 * ordered nothing.
 */
export type DeliverableProduct = `${SharedDeliverableProduct}`;

export interface DeliverableLeadInput extends PublicLeadInput {
  phone?: string;
  message?: string;
  product: DeliverableProduct;
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
 */
async function postLead(
  path: string,
  body: unknown,
  action: CaptchaAction,
): Promise<void> {
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

export function submitDeliverableLead(
  input: DeliverableLeadInput,
): Promise<void> {
  return postLead('/leads/deliverable', input, 'lead_deliverable');
}
