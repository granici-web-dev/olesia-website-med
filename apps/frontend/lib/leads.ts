/**
 * Public lead-intake client (browser → NestJS API). Posts the group-B service
 * forms (Monitorizare / Întrebare rapidă) to the public `/leads/*` endpoints.
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
