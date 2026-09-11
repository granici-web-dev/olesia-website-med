import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { DevTools } from '@/components/DevTools';
import { Analytics } from '@/components/analytics/Analytics';
import { CookieConsent } from '@/components/analytics/CookieConsent';
import { ANALYTICS } from '@/lib/analytics';
import './globals.css';

/**
 * All three faces carry Cyrillic. `subsets` does not choose which glyphs a
 * font has — it chooses which unicode-range files Next preloads, and with
 * `latin` alone a Russian reader waited for the Cyrillic file to be discovered
 * mid-render (audit A7, F26).
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

/**
 * The three locales, so every page under this layout can be prerendered.
 *
 * Without it nothing was static: `[locale]` is a dynamic segment, so every
 * request rendered every page on the server, `revalidate = 60` had no entry to
 * revalidate, and the ISR cache that `PRINCIPLES.md` describes as covering an
 * API restart covered nothing until someone had already visited the page
 * (audit A7, F16). The pair to this is `setRequestLocale(locale)` as the first
 * line of every page — next-intl opts a route out of static rendering unless
 * it is told the locale up front.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  return {
    title: ru
      ? 'Dr. Olesea Jalba — Педиатрия и нутрициология'
      : en
        ? 'Dr. Olesea Jalba — Pediatrics & Nutrition'
        : 'Dr. Olesea Jalba — Pediatrie & Nutriție',
    description: ru
      ? 'Онлайн-консультации педиатра и нутрициолога. Видеозвонок, письменный план, долгосрочное наблюдение.'
      : en
        ? 'Online pediatrics and nutrition consultations. Video call, written plan, long-term follow-up.'
        : 'Consultații pediatrice și de nutriție online. Apel video, plan scris, urmărire pe termen lung.',
    ...(ANALYTICS.gscVerification
      ? { verification: { google: ANALYTICS.gscVerification } }
      : {}),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* First tab stop on every page, so the header's fifteen links are
              skippable (audit A7, F9). */}
          <a href="#content" className="skip-link">
            {locale === 'ru'
              ? 'Перейти к содержанию'
              : locale === 'en'
                ? 'Skip to content'
                : 'Sari la conținut'}
          </a>
          <Nav locale={locale} />
          <div id="content" tabIndex={-1}>
            {children}
          </div>
          <Footer />
          <DevTools />
          <CookieConsent />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}