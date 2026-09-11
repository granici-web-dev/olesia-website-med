'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

import { btnDark, underline } from '@/components/ui/cta';
import { SITE_IDENTITY } from '@/lib/legal-entity';

/**
 * What a visitor sees when the content API cannot answer.
 *
 * Before `lib/api.ts` learned to tell an outage from an empty answer
 * (audit A6, F5), there was nothing to catch: every page rendered a complete,
 * confident, empty version of itself. A page that says the site is briefly
 * unavailable and offers a way to reach the practice is worth more than a page
 * that quietly claims there are no services, no articles and no answers.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const ru = locale === 'ru';
  const en = locale === 'en';
  const t = (ro: string, enStr: string, ruStr: string) =>
    ru ? ruStr : en ? enStr : ro;

  useEffect(() => {
    // The digest is what ties this screen to a server log line; the message
    // itself may carry an internal path, so it is not rendered.
    console.error('page_failed', error.digest ?? error.message);
  }, [error]);

  return (
    <main className="bg-cream text-ink">
      <section className="shell py-24 md:py-36">
        <h1 className="serif max-w-[18ch] text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.015em] text-balance">
          {t(
            'Site-ul este temporar indisponibil',
            'The site is temporarily unavailable',
            'Сайт временно недоступен',
          )}
        </h1>
        <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
          {t(
            'Nu am putut încărca pagina chiar acum. Încearcă din nou într-un minut, iar dacă ai nevoie de un răspuns astăzi, scrie-ne direct.',
            'We could not load this page just now. Try again in a minute, and if you need an answer today, write to us directly.',
            'Не удалось загрузить страницу прямо сейчас. Попробуйте ещё раз через минуту, а если ответ нужен сегодня — напишите нам напрямую.',
          )}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <button type="button" onClick={reset} className={btnDark}>
            {t('Încearcă din nou', 'Try again', 'Попробовать снова')}
          </button>
          {/* The legal-notice address, not the editable contacts list: this
              page renders precisely when the API cannot be read. */}
          <a href={`mailto:${SITE_IDENTITY.email}`} className={underline}>
            {SITE_IDENTITY.email}
          </a>
        </div>
      </section>
    </main>
  );
}
