/**
 * The newsletter list (brief §6c).
 *
 * A subscriber row is a consent record before it is a mailing list: GDPR asks
 * what somebody agreed to and when, so the wording and its version live here,
 * next to each other, for the same reason the patient consent does. The API
 * stamps the version server-side — a public form must not name its own.
 *
 * **Bump the version whenever the wording changes.**
 */

export const NEWSLETTER_CONSENT_VERSION = '2026-09-11';

export type NewsletterConsentLocale = 'ro' | 'en' | 'ru';

export const NEWSLETTER_CONSENT_TEXT: Record<NewsletterConsentLocale, string> = {
  ro: 'Sunt de acord să primesc noutăți pe email și ca adresa mea să fie păstrată în acest scop. Mă pot dezabona oricând.',
  en: 'I agree to receive updates by email and to my address being kept for that purpose. I can unsubscribe at any time.',
  ru: 'Согласен(на) получать новости по email и на хранение моего адреса для этой цели. Отписаться можно в любой момент.',
};

/** Where a signup happened. Both surfaces are on the public site. */
export type SubscriberSource = 'library' | 'footer';

/**
 * One address on the list, as the back office reads it.
 *
 * `confirmedAt` is for the double opt-in that starts existing the day there is
 * an SMTP server; until then every row is unconfirmed and nothing is sent.
 */
export interface SubscriberDto {
  id: string;
  email: string;
  locale: 'ro' | 'en' | 'ru';
  source: SubscriberSource;
  consentAt: string;
  consentVersion: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
}
