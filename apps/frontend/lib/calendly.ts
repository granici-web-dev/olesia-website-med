/**
 * Site-wide free-consultation Calendly link (module_calendly.md §8.3) used
 * where the service isn't known yet: the header CTA and the free-consult
 * section. Per-service booking links live on `Service.calendlySchedulingUrl`.
 * Override per environment with NEXT_PUBLIC_CALENDLY_FREE_URL.
 */
export const FREE_CONSULT_CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_FREE_URL ??
  'https://calendly.com/designer-nefele/consulta-ie-integrativa-monitorizare-clone';
