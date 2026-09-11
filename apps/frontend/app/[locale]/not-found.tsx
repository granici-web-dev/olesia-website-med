import { getLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { btnDark, underline } from '@/components/ui/cta';

/**
 * A page that is not here.
 *
 * There was no `not-found.tsx` at any level until audit A7 (F3), so a mistyped
 * or retired URL answered with Next's built-in screen: an English sentence on a
 * bare white page, outside the locale layout, with no navigation and no way
 * back. Living under `app/[locale]/` puts it inside the same layout as every
 * other page, so a visitor who lands here keeps the header, the footer and
 * their language.
 */
export default async function LocaleNotFound() {
  const locale = await getLocale();
  const ru = locale === 'ru';
  const en = locale === 'en';
  const t = (ro: string, enStr: string, ruStr: string) =>
    ru ? ruStr : en ? enStr : ro;

  return (
    <main className="bg-cream text-ink">
      <section className="shell py-24 md:py-36">
        <p className="mono text-[11px] uppercase tracking-[0.16em] text-sage-text">
          404
        </p>
        <h1 className="serif mt-5 max-w-[20ch] text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.015em] text-balance">
          {t(
            'Pagina aceasta nu există',
            'This page does not exist',
            'Такой страницы нет',
          )}
        </h1>
        <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
          {t(
            'Poate a fost mutată, poate adresa are o greșeală de tipar. Pornește de la pagina principală sau vezi serviciile.',
            'It may have moved, or the address may have a typo. Start from the home page, or look at the services.',
            'Возможно, она переехала или в адресе опечатка. Начните с главной страницы или посмотрите услуги.',
          )}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/" className={btnDark}>
            {t('Pagina principală', 'Home page', 'На главную')}
          </Link>
          <Link href="/services" className={underline}>
            {t('Vezi serviciile', 'See the services', 'Посмотреть услуги')}
          </Link>
          <Link href="/contact" className={underline}>
            {t('Contact', 'Contact', 'Контакты')}
          </Link>
        </div>
      </section>
    </main>
  );
}
