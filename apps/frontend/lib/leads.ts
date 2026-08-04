/**
 * Public lead-intake client (browser → NestJS API). Posts the group-B service
 * forms (Monitorizare / Întrebare EXPRESS) to the public `/leads/*` endpoints.
 * The API base is `NEXT_PUBLIC_API_URL` (must be browser-reachable); defaults
 * to the local API. CORS for the site origin is enabled server-side.
 */
import { getCaptchaToken, type CaptchaAction } from './captcha';

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api'
).replace(/\/+$/, '');

export type LeadService = 'monitoring' | 'quick_question';

export interface MonitoringLeadInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface QuickQuestionLeadInput {
  name: string;
  email: string;
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
 */
export type DeliverableProduct =
  | 'menu_7'
  | 'menu_14'
  | 'menu_30'
  | 'protocol_pednutri'
  | 'protocol_complementary';

export interface DeliverableLeadInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  product: DeliverableProduct;
}

export type ContactSubject = 'appointment' | 'payment' | 'how_it_works' | 'other';

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
  /** Honeypot — leave empty; only bots fill it. */
  company?: string;
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
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-captcha-token': token } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`lead_failed_${res.status}`);
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
