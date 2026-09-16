'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { subscribe, type SubscribeSource } from '@/lib/newsletter';
import { LeadError } from '@/lib/leads';
import { describeLeadError } from '@/lib/form-errors';
import { FIELD_LIMITS, isEmailLike } from '@/lib/validation';
import { CaptchaNotice } from './CaptchaNotice';
import { creamBox } from './cta';
import { biFor, type Bi } from '@/lib/i18n-types';
import styles from './NewsletterSignup.module.css';

/* Newsletter signup (brief §6c). Posts to our own API, so there is nothing to
   configure and nothing to hide behind: the block rendered nowhere for as long
   as it waited on an endpoint variable nobody was ever going to set
   (audit A6, F3). Email + consent, with idle/submitting/success/error states.
   Trilingual via the active locale. `source` tags where the signup happened.

   It is styled for the brown footer, which is where it is mounted and the
   site's only dark surface. It used to carry cream-background colours — ink
   text, an ink button — into `--beige`, which put every string on it between
   1.27:1 and 1.46:1 and made Lighthouse score `color-contrast: 0` on every
   page of the site (audit A13). Everything here is cream on brown at 5.6:1 or
   better, and the submit button is the footer's own `creamBox`, so it reads as
   a button rather than as a dark patch on a dark band. Mounting it on cream
   would need a tone the component does not have yet; it has one caller. */

const T: Record<string, Bi> = {
  title: {
    ro: 'Abonează-te la newsletter',
    en: 'Subscribe to the newsletter',
    ru: 'Подпишитесь на рассылку',
  },
  body: {
    ro: 'Materiale noi și sfaturi practice despre sănătatea și nutriția copilului — fără spam.',
    en: 'New materials and practical tips on child health and nutrition — no spam.',
    ru: 'Новые материалы и практичные советы о здоровье и питании ребёнка — без спама.',
  },
  placeholder: {
    ro: 'email@exemplu.md',
    en: 'email@example.com',
    ru: 'email@example.com',
  },
  cta: { ro: 'Abonează-te', en: 'Subscribe', ru: 'Подписаться' },
  sending: { ro: 'Se trimite…', en: 'Sending…', ru: 'Отправка…' },
  consent: {
    ro: 'Sunt de acord să primesc noutăți pe email și ca adresa mea să fie păstrată în acest scop.',
    en: 'I agree to receive updates by email and to my address being kept for that purpose.',
    ru: 'Согласен(на) получать новости по email и на хранение моего адреса для этой цели.',
  },
  privacy: { ro: 'Confidențialitate', en: 'Privacy', ru: 'Конфиденциальность' },
  // Nothing is mailed yet, so "check your email" would be a promise the site
  // cannot keep. It says what actually happened instead (audit A6, F3).
  success: {
    ro: 'Mulțumim! Adresa ta este pe listă.',
    en: 'Thank you! Your address is on the list.',
    ru: 'Спасибо! Ваш адрес в списке.',
  },
};

export function NewsletterSignup({
  source = 'footer',
  className = '',
}: {
  source?: SubscribeSource;
  className?: string;
}) {
  const locale = useLocale();
  const lc = biFor(locale);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  );
  // The API's own wording for what went wrong, not one sentence for every
  // failure: a rate limit and a rejected captcha ask for different things
  // (audit A7).
  const [error, setError] = useState<string | null>(null);

  const valid = isEmailLike(email) && consent;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || status === 'submitting') return;
    setStatus('submitting');
    setError(null);
    try {
      await subscribe(email, { source, locale });
      setStatus('success');
      setEmail('');
    } catch (e) {
      const failure = e instanceof LeadError ? e : new LeadError(0, '');
      setError(describeLeadError(failure.status, failure.code, locale));
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className={className}>
        <p className="text-[0.95rem] leading-relaxed text-cream">
          {lc(T.success)}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="serif text-[1.4rem] leading-snug tracking-[-0.01em] text-cream">
        {lc(T.title)}
      </p>
      <p className="mt-2 max-w-[42ch] text-[0.9rem] leading-relaxed text-cream/80 text-pretty">
        {lc(T.body)}
      </p>

      <form className="mt-5" onSubmit={onSubmit} noValidate>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={lc(T.placeholder)}
            aria-label={lc(T.title)}
            maxLength={FIELD_LIMITS.email}
            className="min-w-[220px] flex-1 border-b border-cream/45 bg-transparent py-2.5 text-[0.95rem] text-cream placeholder:text-cream/70 focus:border-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sage-soft)]"
          />
          <button
            type="submit"
            disabled={!valid || status === 'submitting'}
            className={`${creamBox} disabled:cursor-not-allowed disabled:opacity-55`}
          >
            {status === 'submitting' ? lc(T.sending) : lc(T.cta)}
          </button>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 text-[0.85rem] leading-[1.6] text-cream/80">
          {/* 24px so it clears the minimum tap target on a phone, which the
              previous 14px box did not (audit A13). */}
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className={styles.checkbox}
          />
          <span>
            {lc(T.consent)}{' '}
            <Link
              href="/gdpr"
              className="underline underline-offset-2 transition-colors hover:text-[var(--sage-soft)]"
            >
              {lc(T.privacy)}
            </Link>
          </span>
        </label>

        {error && (
          <p role="alert" className="mt-3 text-[0.85rem] text-danger-soft">
            {error}
          </p>
        )}

        <CaptchaNotice className="mt-4" />
      </form>
    </div>
  );
}
