import { api } from './api';

/**
 * Booking links come from the catalog, and from nowhere else.
 *
 * This file used to carry a `CALENDLY_FALLBACK_URLS` table and a
 * `FREE_CONSULT_CALENDLY_URL` constant, both pointing at events on the
 * developer's personal `designer-nefele` test account. Audit A6 made the
 * per-service pages read the API first; audit A7 removed the floor underneath
 * it, because a floor made of somebody else's calendar is worse than no floor.
 * Concretely: with the client's own account configured and one link not yet
 * filled in, a visitor clicking "Rezervă" would have opened a stranger's
 * booking page and the site would have looked like it worked.
 *
 * A **service row** with no scheduling URL now renders no button at all. That
 * is the honest state of things: on the free Calendly plan only one event type
 * can be active, and four of the five links answer "This Calendly URL is not
 * valid". A missing button says "not bookable yet"; a dead one says "broken".
 * The standing call-to-action in the header, the hero and the footer is the one
 * exception — see `freeConsultTarget` below.
 *
 * The second argument is the catalog rather than a URL the caller extracted,
 * because six callers were writing the same `find` by hand.
 */

/** The two fields `calendlyUrlFor` needs, so a caller can pass a narrower object. */
export interface SchedulableService {
  code: string;
  calendlySchedulingUrl: string | null;
}

export function calendlyUrlFor(
  code: string,
  services: SchedulableService[],
): string | null {
  return services.find((s) => s.code === code)?.calendlySchedulingUrl ?? null;
}

/**
 * Where the "book" call-to-action in the header, the hero and the footer
 * should send someone.
 *
 * These three are not per-service buttons: they are the site's standing
 * invitation, on every page, and a page with no way to start is worse than one
 * whose first step is a list of services. So the rule differs from a service
 * row's. A bookable free consultation opens its Calendly popup; without one the
 * CTA stays and navigates to `/services`, where every service carries its own
 * link. Nothing is promised that is not true either way — the labels say
 * "Programează", never "gratuit".
 *
 * The `FreeConsult` band is the exception and renders nothing without a link:
 * its whole text is an offer of a free call.
 */
export type BookingTarget =
  { kind: 'calendly'; url: string } | { kind: 'page'; href: string };

const SERVICES_PAGE: BookingTarget = { kind: 'page', href: '/services' };

export function freeConsultTarget(
  services: SchedulableService[],
): BookingTarget {
  const url = calendlyUrlFor('free_consult', services);
  return url ? { kind: 'calendly', url } : SERVICES_PAGE;
}

/** The same, reading the catalog itself, for a server component. */
export async function freeConsultBooking(): Promise<BookingTarget> {
  return freeConsultTarget(await api.services());
}
