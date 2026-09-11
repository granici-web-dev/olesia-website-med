/**
 * Newsletter subscribers — the "Abonați" list.
 *
 * A row is a consent record before it is a mailing address: `consentAt` and
 * `consentVersion` are what proves the person agreed, and which wording they
 * agreed to. Shapes mirror `SubscriberDto` in `packages/shared`.
 */

export type SubscriberSource = 'library' | 'footer';

export interface Subscriber {
  id: string;
  email: string;
  locale: 'ro' | 'en' | 'ru';
  source: SubscriberSource;
  consentAt: string; // ISO
  unsubscribedAt: string | null;
  createdAt: string; // ISO
}
