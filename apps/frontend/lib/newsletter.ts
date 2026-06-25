/**
 * Newsletter subscription (brief §6c) — provider-agnostic and env-gated, like
 * the analytics stack. The signup UI only appears when an endpoint is set, and
 * `subscribe()` no-ops to 'disabled' otherwise. Point NEXT_PUBLIC_NEWSLETTER_
 * ENDPOINT at whatever the client picks: a provider's hosted form-action URL
 * (Mailchimp/Brevo/…), a serverless function, or our own API later. The real
 * provider is still pending the client (blocker #8 — no SMTP/list yet).
 *
 * ⚠ A direct browser POST to a third-party endpoint can be blocked by CORS.
 * Prefer a SAME-ORIGIN endpoint (our own API/serverless route that proxies to
 * the provider and keeps any API key server-side) to avoid that.
 */

import { track } from './analytics';

export const NEWSLETTER = {
  /** POST target for {email, locale, source, consent}. Empty = disabled. */
  endpoint: process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT ?? '',
};

/** Whether the newsletter is configured — gates the signup UI. */
export const newsletterEnabled = Boolean(NEWSLETTER.endpoint);

export type SubscribeResult = 'ok' | 'error' | 'disabled';

export interface SubscribeOpts {
  /** Where the signup happened, e.g. 'footer' | 'library'. */
  source: string;
  locale?: string;
}

/**
 * Subscribe an email to the newsletter. Safe to call always: returns 'disabled'
 * when no endpoint is configured (so callers can degrade gracefully). Fires a
 * `newsletter_subscribe` analytics event on success.
 */
export async function subscribe(email: string, opts: SubscribeOpts): Promise<SubscribeResult> {
  if (!NEWSLETTER.endpoint) return 'disabled';
  try {
    const res = await fetch(NEWSLETTER.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, locale: opts.locale, source: opts.source, consent: true }),
    });
    if (!res.ok) return 'error';
    track('newsletter_subscribe', { source: opts.source });
    return 'ok';
  } catch {
    return 'error';
  }
}
