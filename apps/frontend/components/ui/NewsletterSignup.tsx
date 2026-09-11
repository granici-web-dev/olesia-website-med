'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { subscribe, type SubscribeSource } from '@/lib/newsletter';
import { FIELD_LIMITS, isEmailLike } from '@/lib/validation';
import { CaptchaNotice } from './CaptchaNotice';

/* Newsletter signup (brief §6c). Posts to our own API, so there is nothing to
   configure and nothing to hide behind: the block rendered nowhere for as long
   as it waited on an endpoint variable nobody was ever going to set
   (audit A6, F3). Email + consent, with idle/submitting/success/error states.
   Trilingual via the active locale. `source` tags where the signup happened. */

type Bi = { ro: string; en: string; ru: string };

const T: Record<string, Bi> = {
  title: { ro: 'Abonează-te la newsletter', en: 'Subscribe to the newsletter', ru: 'Подпишитесь на рассылку' },
  body: {
    ro: 'Materiale noi și sfaturi practice despre sănătatea și nutriția copilului — fără spam.',
    en: 'New materials and practical tips on child health and nutrition — no spam.',
    ru: 'Новые материалы и практичные советы о здоровье и питании ребёнка — без спама.',
  },
  placeholder: { ro: 'email@exemplu.md', en: 'email@example.com', ru: 'email@example.com' },
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
  success: { ro: 'Mulțumim! Adresa ta este pe listă.', en: 'Thank you! Your address is on the list.', ru: 'Спасибо! Ваш адрес в списке.' },
  error: { ro: 'Ceva n-a mers. Încearcă din nou.', en: 'Something went wrong. Try again.', ru: 'Что-то пошло не так. Попробуйте ещё раз.' },
};

export function NewsletterSignup({
  source = 'footer',
  className = '',
}: {
  source?: SubscribeSource;
  className?: string;
}) {
  const locale = useLocale();
  const lc = (b: Bi) => (locale === 'ru' ? b.ru : locale === 'en' ? b.en : b.ro);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const valid = isEmailLike(email) && consent;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || status === 'submitting') return;
    setStatus('submitting');
    const res = await subscribe(email, { source, locale });
    setStatus(res === 'ok' ? 'success' : 'error');
    if (res === 'ok') setEmail('');
  };

  if (status === 'success') {
    return (
      <div className={className}>
        <p className="text-[0.95rem] leading-relaxed text-ink">{lc(T.success)}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="serif text-[1.4rem] leading-snug tracking-[-0.01em] text-ink">{lc(T.title)}</p>
      <p className="mt-2 max-w-[42ch] text-[0.9rem] leading-relaxed text-ink-soft text-pretty">{lc(T.body)}</p>

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
            className="min-w-[220px] flex-1 border-b border-[var(--rule)] bg-transparent py-2 text-[0.95rem] text-ink placeholder:text-ink-soft focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
          />
          <button
            type="submit"
            disabled={!valid || status === 'submitting'}
            className="cursor-pointer bg-ink px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.06em] text-cream transition-colors hover:bg-sage disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === 'submitting' ? lc(T.sending) : lc(T.cta)}
          </button>
        </div>

        <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[0.8rem] leading-relaxed text-ink-soft">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-3.5 shrink-0 accent-[var(--sage,#7a8b6f)]"
          />
          <span>
            {lc(T.consent)}{' '}
            <Link href="/gdpr" className="underline underline-offset-2 transition-colors hover:text-sage">
              {lc(T.privacy)}
            </Link>
          </span>
        </label>

        {status === 'error' && (
          <p className="mt-2 text-[0.85rem] text-[var(--walnut,#8a5a3a)]">{lc(T.error)}</p>
        )}

        <CaptchaNotice className="mt-3" />
      </form>
    </div>
  );
}
