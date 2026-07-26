/**
 * reCAPTCHA v3 token minting for the public forms (client requirement,
 * answers v2 §10). Env-gated exactly like analytics and the newsletter:
 * without `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` every call resolves to `null` and
 * the forms behave as they do today.
 *
 * The script is loaded **lazily, on the first submit** — never on page load.
 * Two reasons: nothing contacts Google for the vast majority of visitors who
 * never touch a form, and the badge/script cost is paid only where it buys
 * something. (v3 needs no interaction, so there is nothing to render up front.)
 *
 * ⚠️ GDPR note: reCAPTCHA sends data to Google. We rely on it being strictly
 * necessary for spam protection, which is why it sits outside the cookie
 * banner's optional categories — but it is loaded only when a visitor actually
 * submits something. Cloudflare Turnstile is the privacy-friendlier equivalent
 * and would be a drop-in replacement here; the client named reCAPTCHA.
 */

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

/** True when the client's site key is configured. */
export const captchaEnabled = Boolean(RECAPTCHA_SITE_KEY);

/** Action names — must match the ones the API expects (`@CaptchaProtected`). */
export type CaptchaAction =
  | 'lead_monitoring'
  | 'lead_quick_question'
  | 'lead_contact'
  | 'lead_deliverable'
  | 'newsletter_subscribe'
  | 'material_download';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('recaptcha_script_failed'));
    document.head.appendChild(el);
  }).catch((err) => {
    scriptPromise = null; // allow a retry on the next submit
    throw err;
  });

  return scriptPromise;
}

/**
 * @returns a token, or `null` when the captcha is not configured or Google is
 * unreachable. Callers submit regardless — the API decides. A spam filter must
 * never be the reason a parent cannot send a medical question, and the server
 * still rejects bad scores.
 */
export async function getCaptchaToken(action: CaptchaAction): Promise<string | null> {
  if (!captchaEnabled || typeof window === 'undefined') return null;

  try {
    await loadScript();
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return null;

    await new Promise<void>((resolve) => grecaptcha.ready(resolve));
    return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
  } catch {
    return null;
  }
}
