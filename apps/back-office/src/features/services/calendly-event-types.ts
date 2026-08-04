import { http } from '@/api/http';
import { USE_MOCKS } from '@/api/config';

/**
 * The event types on the connected Calendly account.
 *
 * This exists so the launch swap is a choice, not a transcription. Both
 * Calendly fields on a service are free text, and hand-pasting them has
 * already gone wrong once — the mapping ended up with nutrition pointing at
 * the pediatric event. Picking from her own account removes that step.
 */

export interface CalendlyEventType {
  uri: string;
  name: string;
  slug?: string;
  scheduling_url: string;
  duration?: number;
  active?: boolean;
}

export interface CalendlyEventTypes {
  /** False until CALENDLY_API_TOKEN / CALENDLY_ORG_URI are set on the API. */
  configured: boolean;
  eventTypes: CalendlyEventType[];
}

async function remote(): Promise<CalendlyEventTypes> {
  return http.get<CalendlyEventTypes>('/appointments/calendly/event-types');
}

/**
 * Mock mode reports "not connected" rather than inventing event types.
 *
 * A fake list here would be worse than none: the whole point of the picker is
 * that what it shows is really on her calendar, and a plausible-looking mock
 * would train whoever demos it to trust a list that means nothing.
 */
async function mock(): Promise<CalendlyEventTypes> {
  return { configured: false, eventTypes: [] };
}

export const fetchCalendlyEventTypes = USE_MOCKS ? mock : remote;
