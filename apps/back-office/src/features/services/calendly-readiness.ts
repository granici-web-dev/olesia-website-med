import type { CalendlyEventType } from '@/features/services/calendly-event-types';
import type { Service } from '@/features/services/types';

/**
 * Whether the bookings a group-A service promises can actually happen.
 *
 * The banner above the service list used to ask one question — does the
 * service carry a `calendlyEventTypeUri` — and answer green whenever every
 * service carried one. A URI is not a bookable event: the event it names can
 * have been deleted, renamed into a different one, or simply switched off in
 * Calendly, and on the free test account four of the five are switched off.
 * Green then meant "somebody filled a text field in", which is the one thing
 * that was never in doubt (audit A13).
 *
 * So the rule is liveness, not presence: the mapped URI has to be in the
 * account's own list of event types and not switched off there. `active` is
 * read as `!== false`, which is the rule `calendly-event-picker.tsx` already
 * uses to label an option `inactiv` — Calendly sends the field, and inventing
 * a stricter reading here would make the two disagree about the same event.
 */
export interface CalendlyReadiness {
  /** False until the API has a Calendly token and organization. */
  connected: boolean;
  /** How many event types the account has, for the reassuring case. */
  eventCount: number;
  /** Group-A services carrying no URI at all. */
  unmapped: string[];
  /** Group-A services whose event is missing from the account or switched off. */
  unbookable: string[];
  /** Green: connected, and every bookable service can be booked today. */
  ok: boolean;
}

export function calendlyReadiness(
  services: Service[],
  account: { configured: boolean; eventTypes: CalendlyEventType[] } | undefined,
): CalendlyReadiness {
  const connected = account?.configured ?? false;
  const eventTypes = account?.eventTypes ?? [];
  const live = new Set(
    eventTypes.filter((e) => e.active !== false).map((e) => e.uri),
  );

  const unmapped: string[] = [];
  const unbookable: string[] = [];
  for (const service of services) {
    // Hidden services are checked too. One that is off the site cannot be
    // booked from it, so this reports a little more than the patient can
    // reach — which is the direction worth erring in: the alternative is
    // learning that a booking is broken by publishing it.
    if (service.group !== 'A_booking') continue;
    const uri = service.calendlyEventTypeUri?.trim();
    if (!uri) {
      unmapped.push(service.titleRo);
      // An unconnected account has no list to check against, so every mapping
      // is unverifiable rather than broken — that is the "not connected"
      // sentence's job, and saying both would be saying it twice.
    } else if (connected && !live.has(uri)) {
      unbookable.push(service.titleRo);
    }
  }

  return {
    connected,
    eventCount: eventTypes.length,
    unmapped,
    unbookable,
    ok: connected && unmapped.length === 0 && unbookable.length === 0,
  };
}
