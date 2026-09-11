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
 * It goes through `postLead`, like the other four public forms (audit A7). It
 * used to carry its own copy of the base URL, the captcha header and the error
 * handling, and that copy collapsed every failure into the string `'error'`: a
 * rate limit, a rejected captcha and an unreachable API all reached the visitor
 * as "something went wrong", which is the exact wording audit A6 removed from
 * every other form. A `LeadError` carries the status and the machine code, and
 * `describeLeadError` turns the pair into a sentence.
 *
 * Storing an address is not sending to it. Nothing mails these people until
 * the client has SMTP; what the site promises in return for an address is the
 * download it hands over immediately, and the copy says exactly that.
 */

import { track } from './analytics';
import { leadLocale, postLead, type LeadLocale } from './leads';

/** Where the signup happened. The API records it and never changes it. */
export type SubscribeSource = 'footer' | 'library';

export interface SubscribeOpts {
  source: SubscribeSource;
  locale: string;
}

/**
 * Subscribe an email to the newsletter. Throws `LeadError` if it was refused.
 *
 * Re-subscribing an address already on the list answers 200 and adds no row —
 * the API upserts by address — so a visitor downloading their third material
 * sees the same success as the first time.
 */
export async function subscribe(
  email: string,
  opts: SubscribeOpts,
): Promise<void> {
  const locale: LeadLocale = leadLocale(opts.locale);
  await postLead(
    '/newsletter/subscribe',
    {
      email: email.trim(),
      locale,
      source: opts.source,
      consent: true,
    },
    'newsletter_subscribe',
  );
  track('newsletter_subscribe', { source: opts.source });
}
