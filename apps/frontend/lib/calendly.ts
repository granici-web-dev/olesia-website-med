/**
 * Site-wide free-consultation Calendly link (module_calendly.md §8.3) used
 * where the service isn't known yet: the header CTA and the free-consult
 * section. Per-service booking links live on `Service.calendlySchedulingUrl`.
 * Override per environment with NEXT_PUBLIC_CALENDLY_FREE_URL.
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
  pediatric: 'https://calendly.com/designer-nefele/consulta-ie-pediatrica-clone',
  nutrition: 'https://calendly.com/designer-nefele/consulta-ie-nutri-ionala-clone',
  // Nutrition is one catalog service but books into two audience-specific
  // Calendly events (children / adults). The /nutrition page offers both.
  nutrition_copii:
    'https://calendly.com/designer-nefele/consultatie-nutritionala-pentru-copii',
  nutrition_adulti:
    'https://calendly.com/designer-nefele/consultatie-nutritionala-pentru-adulti',
  integrative:
    'https://calendly.com/designer-nefele/consulta-ie-integrativa-monitorizare-clone',
};

/** Calendly scheduling URL for a service `code`, preferring the API value. */
export function calendlyUrlFor(
  code: string,
  apiUrl?: string | null,
): string | undefined {
  return apiUrl ?? CALENDLY_FALLBACK_URLS[code];
}
