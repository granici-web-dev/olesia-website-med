/**
 * Public lead-intake client (browser → NestJS API). Posts the group-B service
 * forms (Monitorizare / Întrebare EXPRESS) to the public `/leads/*` endpoints.
 * The API base is `NEXT_PUBLIC_API_URL` (must be browser-reachable); defaults
 * to the local API. CORS for the site origin is enabled server-side.
 */
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
 * is a one-off product, so the lead must carry WHICH product was chosen:
 * `product` is the stable code (e.g. `menu_7`) and `productTitle` the human
 * label — both stored so the back office shows the exact service ordered.
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
  productTitle: string;
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

async function postLead(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`lead_failed_${res.status}`);
}

export function submitMonitoringLead(input: MonitoringLeadInput): Promise<void> {
  return postLead('/leads/monitoring', input);
}

export function submitQuickQuestionLead(
  input: QuickQuestionLeadInput,
): Promise<void> {
  return postLead('/leads/quick-question', input);
}

export function submitContactMessage(input: ContactMessageInput): Promise<void> {
  return postLead('/leads/contact', input);
}

export function submitDeliverableLead(
  input: DeliverableLeadInput,
): Promise<void> {
  return postLead('/leads/deliverable', input);
}
