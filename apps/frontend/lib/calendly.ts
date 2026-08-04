/**
 * Site-wide free-consultation Calendly link (module_calendly.md §8.3) used
 * where the service isn't known yet: the header CTA and the free-consult
 * section. Per-service booking links live on `Service.calendlySchedulingUrl`.
 * Override per environment with NEXT_PUBLIC_CALENDLY_FREE_URL.
 *
 * Verified: on the test account this slug really is "Consultație gratis", and
 * it is the one event type the free plan keeps active — which is why it is the
 * only booking link on the site that currently opens.
 */
export const FREE_CONSULT_CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_FREE_URL ??
  'https://calendly.com/designer-nefele/consulta-ie-integrativa-monitorizare-clone';

/**
 * Per-service fallback scheduling links, keyed by service `code`. Used wherever
 * a booking button needs a Calendly URL but the API hasn't supplied
 * `Service.calendlySchedulingUrl` yet — e.g. before the backend is connected,
 * or in the static preview. The live API value always takes precedence; this is
 * only the floor so booking never silently degrades to a dead button. These are
 * the current test Calendly events — ⚠ swap for the client's before launch,
 * together with FREE_CONSULT_CALENDLY_URL.
 */
export const CALENDLY_FALLBACK_URLS: Record<string, string> = {
  // ⚠ PLACEHOLDER events on the `designer-nefele` TEST account. Swap for the
  // client's paid account before launch, together with FREE_CONSULT_CALENDLY_URL.
  // Keep in sync with apps/api/prisma/seed.ts.
  //
  // Every link below was verified against the account's own event list
  // (`GET /appointments/calendly/event-types`) rather than assumed from its
  // slug — two of these used to be wrong: `pediatric` pointed at a slug that
  // does not exist on the account, and `integrative` at the free call. The
  // account's slugs do NOT match their event names (a clone artifact), so the
  // slug is not evidence of anything; the event name and duration are.
  //
  // Booking still fails today, and not because the links are wrong: the account
  // is on the free plan, which allows exactly ONE active event type. Four of
  // the five are `active: false`, and Calendly answers those with "This
  // Calendly URL is not valid". The paid plan is what fixes it.
  pediatric: 'https://calendly.com/designer-nefele/30min',
  // Nutrition is two catalog services, each with its own Calendly event. The
  // generic `nutrition` slug it used to share is gone: one link for two
  // audiences is exactly the ambiguity the webhook cannot resolve.
  nutrition_copii:
    'https://calendly.com/designer-nefele/consultatie-nutritionala-pentru-copii',
  nutrition_adulti:
    'https://calendly.com/designer-nefele/consultatie-nutritionala-pentru-adulti',
  integrative:
    'https://calendly.com/designer-nefele/consulta-ie-nutri-ionala-clone',
};

/** Calendly scheduling URL for a service `code`, preferring the API value. */
export function calendlyUrlFor(
  code: string,
  apiUrl?: string | null,
): string | undefined {
  return apiUrl ?? CALENDLY_FALLBACK_URLS[code];
}
