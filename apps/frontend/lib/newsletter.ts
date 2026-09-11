/**
 * Newsletter subscription (brief §6c) — posted to our own API.
 *
 * This was provider-agnostic and env-gated until 2026-09-11: with no
 * `NEXT_PUBLIC_NEWSLETTER_ENDPOINT` set, and none ever was, the footer signup
 * rendered nowhere and the library's email gate collected an address and
 * dropped it (audit A6, F3). The endpoint now exists — `POST /newsletter/
 * subscribe` on the same API every other form posts to — so there is nothing
 * left to configure and nothing left to fall back to.
 *
 * Storing an address is not sending to it. Nothing mails these people until
 * the client has SMTP; what the site promises in return for an address is the
 * download it hands over immediately, and the copy says exactly that.
 */

import { track } from './analytics';
import { getCaptchaToken } from './captcha';
import { leadLocale, type LeadLocale } from './leads';

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api'
).replace(/\/+$/, '');

export type SubscribeResult = 'ok' | 'error';

/** Where the signup happened. The API records it and never changes it. */
export type SubscribeSource = 'footer' | 'library';

export interface SubscribeOpts {
  source: SubscribeSource;
  locale: string;
}

/**
 * Subscribe an email to the newsletter.
 *
 * Re-subscribing an address already on the list answers 200 and adds no row —
 * the API upserts by address — so a visitor downloading their third material
 * sees the same success as the first time.
 */
export async function subscribe(
  email: string,
  opts: SubscribeOpts,
): Promise<SubscribeResult> {
  const locale: LeadLocale = leadLocale(opts.locale);
  try {
    const token = await getCaptchaToken('newsletter_subscribe');
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-captcha-token': token } : {}),
      },
      body: JSON.stringify({
        email: email.trim(),
        locale,
        source: opts.source,
        consent: true,
      }),
    });
    if (!res.ok) return 'error';
    track('newsletter_subscribe', { source: opts.source });
    return 'ok';
  } catch {
    return 'error';
  }
}
