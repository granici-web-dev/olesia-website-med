'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { subscribe, type SubscribeSource } from '@/lib/newsletter';
import { LeadError } from '@/lib/leads';
import { describeLeadError } from '@/lib/form-errors';
import { FIELD_LIMITS, isEmailLike } from '@/lib/validation';
import { CaptchaNotice } from '@/components/ui/CaptchaNotice';
import { creamBox } from '@/components/ui/cta';
import { biFor, type Bi } from '@/lib/i18n-types';
import styles from './NewsletterBand.module.css';

/* Newsletter signup (brief §6c). Posts to our own API, so there is nothing to
   configure and nothing to hide behind: the block rendered nowhere for as long
   as it waited on an endpoint variable nobody was ever going to set
   (audit A6, F3). Email + consent, with idle/submitting/success/error states.
   Trilingual via the active locale. `source` tags where the signup happened.

   It is a band, not a footer block, as of 2026-09-16. In the footer it was a
   form sunk into the smallest, quietest part of every page — and styled for
   cream while sitting on brown, which put every string on it at 1.27:1 and
   scored `color-contrast: 0` site-wide (audit A13). It now sits where somebody
   has just finished reading something and might actually want the next one:
   the articles index, the end of an article, and the library. The footer keeps
   a "Newsletter" link to the library band under "Urmărește".

   The band is `--ink`, not the `--sage-deep` the closing CTAs use, for one
   reason: on `/articles` and `/guides` it lands directly under one of those
   CTAs, and two sage-deep bands in a row are one band with two headings in it.
   Everything on it is cream: 14:1 for the heading, 9.4:1 for the body and the
   consent sentence, 7.5:1 for the placeholder, 5.9:1 for the checkbox outline,
   9.2:1 for an error. */

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

export function NewsletterBand({
  source,
  id,
}: {
  source: SubscribeSource;
  /** `newsletter` on the library band — the footer's own link lands here. */
  id?: string;
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

  return (
    <section id={id} className="scroll-mt-24 bg-ink text-cream">
      {/* `shell` is the site-wide gutter and container, so the band lines up
          with every other section instead of starting at the viewport edge. */}
      <div className="shell py-16 md:py-20">
        <div className="mx-auto max-w-[640px]">
          <h2 className="serif text-center text-[clamp(1.75rem,3.4vw,2.4rem)] leading-[1.1] tracking-[-0.015em] text-cream text-balance">
            {lc(T.title)}
          </h2>

          {status === 'success' ? (
            <p className="mt-4 text-center text-[1.05rem] leading-relaxed text-cream/80">
              {lc(T.success)}
            </p>
          ) : (
            <>
              <p className="mx-auto mt-4 max-w-[46ch] text-center text-[0.95rem] leading-relaxed text-cream/80 text-pretty">
                {lc(T.body)}
              </p>

              <form className="mt-8" onSubmit={onSubmit} noValidate>
                {/* One row from 640px up; one column below it, both full
                    width, so a phone gets a field and a button it can hit. */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lc(T.placeholder)}
                    aria-label={lc(T.title)}
                    maxLength={FIELD_LIMITS.email}
                    className="w-full flex-1 border-b border-cream/45 bg-transparent py-2.5 text-[1rem] text-cream placeholder:text-cream/70 focus:border-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sage-soft)]"
                  />
                  <button
                    type="submit"
                    disabled={!valid || status === 'submitting'}
                    className={`${creamBox} w-full justify-center disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto`}
                  >
                    {status === 'submitting' ? lc(T.sending) : lc(T.cta)}
                  </button>
                </div>

                {/* Narrower than the form above it, so the sentence breaks
                    mid-line and the privacy link does not end up alone on a
                    line of its own. */}
                <label className="mt-5 flex max-w-[54ch] cursor-pointer items-start gap-3 text-[0.85rem] leading-[1.6] text-cream/80">
                  {/* 24px so it clears the minimum tap target on a phone,
                      which the previous 14px box did not (audit A13). */}
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
                  <p
                    role="alert"
                    className="mt-3 text-[0.85rem] text-danger-soft"
                  >
                    {error}
                  </p>
                )}

                <CaptchaNotice className="mt-4" />
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
