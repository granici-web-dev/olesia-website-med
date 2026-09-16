/**
 * Newsletter subscribers — the "Abonați" list.
 *
 * A row is a consent record before it is a mailing address: `consentAt` and
 * `consentVersion` are what proves the person agreed, and which wording they
 * agreed to. Shapes mirror `SubscriberDto` in `packages/shared`.
 */

/** `footer` is historical: the signup became a band of its own on 2026-09-16. */
export type SubscriberSource = 'library' | 'article' | 'footer';

export interface Subscriber {
  id: string;
  email: string;
  locale: 'ro' | 'en' | 'ru';
  source: SubscriberSource;
  consentAt: string; // ISO
  unsubscribedAt: string | null;
  createdAt: string; // ISO
}
