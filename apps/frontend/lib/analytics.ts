/**
 * Analytics config + event/consent helpers (brief §6b). Everything is gated on
 * env IDs AND user consent: with no IDs set this is a complete no-op, and no
 * tracker loads until the visitor accepts cookies (GDPR). Supports a GTM
 * container, GA4 direct, and the Meta Pixel — set whichever the client provides.
 * The real IDs are still pending the client; wire them via env when they land.
 */

export const ANALYTICS = {
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? '',
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? '',
  pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
  /** Google Search Console verification token (meta tag — no cookie/consent). */
  gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? '',
};

/** True when at least one tracker is configured — gates the consent banner. */
export const analyticsConfigured = Boolean(
  ANALYTICS.gtmId || ANALYTICS.ga4Id || ANALYTICS.pixelId,
);

export const CONSENT_COOKIE = 'cookie_consent';
export type Consent = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
  }
}

/** Read the stored consent decision, or null if the visitor hasn't decided. */
export function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)cookie_consent=(granted|denied)/);
  return m ? (m[1] as Consent) : null;
}

/** Persist the consent decision for 180 days. */
export function writeConsent(value: Consent): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
}

/**
 * Fire a tracking event to whichever trackers are loaded. Safe to call always —
 * it no-ops when nothing is initialised (no consent / no IDs). Pushes to the
 * GTM dataLayer, GA4 (gtag), and the Meta Pixel (custom event).
 */
export function track(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer?.push({ event: name, ...params });
  window.gtag?.('event', name, params);
  window.fbq?.('trackCustom', name, params);
}
