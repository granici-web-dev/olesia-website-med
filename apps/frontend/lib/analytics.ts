/**
 * Analytics config + event helper (brief §6b). Consent is handled by the
 * Cookiebot CMP (https://www.cookiebot.com): it shows the banner and we load
 * each tracker only once its consent category is granted — GTM/GA4 on
 * `statistics`, the Meta Pixel on `marketing`. Everything is env-gated too, so
 * with no IDs set this is a complete no-op. Real IDs are pending the client.
 */

export const ANALYTICS = {
  /** Cookiebot domain-group id (CBID) — enables the CMP + consent banner. */
  cookiebotId: process.env.NEXT_PUBLIC_COOKIEBOT_CBID ?? '',
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? '',
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? '',
  pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
  /** Google Search Console verification token (meta tag — no cookie/consent). */
  gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? '',
};

/** True when at least one tracker is configured. */
export const analyticsConfigured = Boolean(
  ANALYTICS.gtmId || ANALYTICS.ga4Id || ANALYTICS.pixelId,
);

export interface CookiebotConsent {
  necessary: boolean;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
    Cookiebot?: { consent: CookiebotConsent };
  }
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
