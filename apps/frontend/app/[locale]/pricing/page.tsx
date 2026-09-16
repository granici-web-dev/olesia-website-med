import Link from 'next/link';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { pageMetadata } from '@/lib/page-metadata';
import { biFor, type Bi } from '@/lib/i18n-types';
import { DELIVERABLE_COPY } from '@/lib/deliverable-content';
import { DELIVERABLE_CATALOG } from '@olesia/shared';
import { api, loc, serviceTag } from '../../../lib/api';
import styles from '../../../components/sections/Services.module.css';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { Reveal } from '@/components/ui/Reveal';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import { OrderDeliverableButton } from '@/components/ui/OrderDeliverableButton';
import { FreeConsult } from '@/components/sections/FreeConsult';
import { serviceLink } from '@/components/ui/cta';
import type { LeadService } from '@/lib/leads';
import {
  SERVICE_INCLUDED,
  fillIncluded,
  serviceDescription,
} from '@/lib/service-content';
import { formatSlaInHours } from '@/lib/working-hours';
import {
  formatEur,
  formatServiceDuration,
  formatServicePrice,
} from '@/lib/service-price';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  return pageMetadata({
    locale,
    path: '/pricing',
    title: ru
      ? 'Цены | Dr. Olesea Jalba'
      : en
        ? 'Pricing | Dr. Olesea Jalba'
        : 'Tarife | Dr. Olesea Jalba',
    description: ru
      ? 'Цены на консультации, наблюдение и персональные меню и протоколы. Без скрытых платежей.'
      : en
        ? 'Prices for consultations, monitoring, and personalized menus and protocols. No hidden costs.'
        : 'Tarifele pentru consultații, monitorizare și meniuri sau protocoale personalizate. Fără costuri ascunse.',
  });
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const en = locale === 'en';
  const ru = locale === 'ru';
  const [services, hours] = await Promise.all([
    api.services(),
    api.workingHours(),
  ]);
  const slaInHours = formatSlaInHours(locale, hours.expressSlaMinutes);

  const t = {
    eyebrow: ru ? 'Цены' : en ? 'Pricing' : 'Tarife',
    title: ru
      ? 'Прозрачные цены'
      : en
        ? 'Transparent pricing'
        : 'Tarife transparente',
    // Not "confirmed manually": the express question and the personalized
    // products go through the bank's hosted Checkout page, and the confirmation
    // is the bank's callback, not a person reading a statement (audit A13).
    // Scoped to "online", because the video consultations are still booked
    // through Calendly and settled off the site.
    intro: ru
      ? 'Без скрытых платежей. Онлайн-оплата — картой или через MIA на защищённой странице банка, подтверждение приходит сразу.'
      : en
        ? 'No hidden costs. Online payments go by card or MIA on the bank’s secure page, and are confirmed on the spot.'
        : 'Fără costuri ascunse. Plata online se face cu cardul sau prin MIA, pe pagina securizată a băncii, și se confirmă pe loc.',
    book: ru ? 'Записаться' : en ? 'Book' : 'Rezervă',
    included: ru ? 'Что входит' : en ? "What's included" : 'Ce include',
    unavailable: ru
      ? 'Тарифы сейчас недоступны. Напишите нам — назовём цену и запишем.'
      : en
        ? 'The tariffs are unavailable right now. Get in touch and we will quote you and book you in.'
        : 'Tarifele nu sunt disponibile acum. Scrie-ne și îți spunem prețul și te programăm.',
    contact: ru ? 'Связаться' : en ? 'Get in touch' : 'Contactează-ne',
  };

  const lc = biFor(locale);
  const td = {
    eyebrow: ru ? 'Продукты' : en ? 'Deliverables' : 'Livrabile',
    title: ru
      ? 'Персональные продукты'
      : en
        ? 'Personalized products'
        : 'Produse personalizate',
    intro: ru
      ? 'Оплата → короткая форма → готовый результат в письменном виде. Платите картой или через MIA на защищённой странице банка; подтверждение приходит сразу, а вслед за ним — личная ссылка для отправки данных.'
      : en
        ? 'Pay → a short form → a finished result delivered in writing. You pay by card or MIA on the bank’s secure page; the confirmation comes on the spot, and with it a personal link for sending your details.'
        : 'Plată → un formular scurt → un rezultat finalizat, livrat în scris. Plătești cu cardul sau prin MIA, pe pagina securizată a băncii; confirmarea vine pe loc, iar odată cu ea linkul personal prin care trimiți datele.',
    order: ru ? 'Заказать' : en ? 'Order' : 'Comandă',
  };

  return (
    <main className="bg-cream text-ink">
      <section className="shell py-20 md:py-28">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="serif mt-4 text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.04] tracking-[-0.02em] text-balance">
          {t.title}
        </h1>
        <p className="mt-6 max-w-[48ch] text-[1.05rem] leading-relaxed text-ink-soft text-pretty">
          {t.intro}
        </p>

        {/* Editorial service rows — same design as the homepage Services section.
            With no services there is no price to state, and the page says so
            rather than falling back to a constant: a tariff table compiled into
            the bundle goes stale silently, which is the whole reason step 8
            exists. */}
        {services.length === 0 ? (
          <div className="mt-12 border-t border-[var(--rule)] pt-8">
            <p className="max-w-[52ch] text-[1.05rem] leading-relaxed text-ink-soft text-pretty">
              {t.unavailable}
            </p>
            <Link
              href={`/${locale}/contact`}
              className={`${serviceLink} mt-5 inline-flex`}
            >
              {t.contact}
            </Link>
          </div>
        ) : (
          <div className="mt-12">
            {services.map((s, i) => (
              <Reveal
                key={s.id}
                as="div"
                className={styles.serviceRow}
                delay={i * 70}
              >
                <div className={styles.serviceNum}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div className={styles.serviceTag}>
                    {serviceTag(locale, s)}
                  </div>
                  <h2 className={styles.serviceTitle}>
                    {loc(locale, s.titleRo, s.titleEn, s.titleRu)}
                  </h2>
                </div>
                <div>
                  {serviceDescription(locale, s) && (
                    <p className={styles.serviceDesc}>
                      {serviceDescription(locale, s)}
                    </p>
                  )}
                  {SERVICE_INCLUDED[s.code] && (
                    <div className="mt-5">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-sage-text">
                        {t.included}
                      </p>
                      <ul className="mt-3 grid gap-2">
                        {fillIncluded(
                          locale === 'ru'
                            ? SERVICE_INCLUDED[s.code].ru
                            : locale === 'en'
                              ? SERVICE_INCLUDED[s.code].en
                              : SERVICE_INCLUDED[s.code].ro,
                          {
                            duration: formatServiceDuration(
                              locale,
                              s.durationMin,
                            ),
                            slaInHours,
                          },
                        ).map((item) => (
                          <li
                            key={item}
                            className="grid grid-cols-[1.1em_1fr] gap-x-2 text-[0.9rem] leading-relaxed text-ink-soft"
                          >
                            <span aria-hidden="true" className="text-sage">
                              —
                            </span>
                            <span className="text-pretty">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className={styles.serviceMeta}>
                  <div className={styles.servicePrice}>
                    {formatServicePrice(locale, s)}
                  </div>
                  {formatServiceDuration(locale, s.durationMin) && (
                    <div className={styles.serviceDuration}>
                      {formatServiceDuration(locale, s.durationMin)}
                    </div>
                  )}
                  {s.group === 'A_booking' && s.calendlySchedulingUrl ? (
                    <CalendlyButton
                      url={s.calendlySchedulingUrl}
                      reason={loc(locale, s.titleRo, s.titleEn, s.titleRu)}
                      label={t.book}
                      className={serviceLink}
                    />
                  ) : s.group === 'B_portal' ? (
                    <BookGroupBButton
                      service={s.code as LeadService}
                      label={t.book}
                      className={serviceLink}
                    />
                  ) : (
                    <Link href={`/${locale}/contact`} className={serviceLink}>
                      {t.book}
                    </Link>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Group C — personalized deliverable products (menus + protocols) */}
      <section className="shell pb-20 md:pb-28">
        <div className="border-t border-[var(--rule)] pt-16 md:pt-20">
          <p className="eyebrow">{td.eyebrow}</p>
          <h2 className="serif mt-4 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.02em] text-balance">
            {td.title}
          </h2>
          <p className="mt-5 max-w-[52ch] text-[1.0125rem] leading-relaxed text-ink-soft text-pretty">
            {td.intro}
          </p>
          <div className="mt-10 border-t border-[var(--rule)]">
            {DELIVERABLE_CATALOG.map((entry, i) => {
              const copy = DELIVERABLE_COPY[entry.code];
              return (
                <Reveal
                  key={entry.code}
                  as="div"
                  className="grid items-start gap-x-8 gap-y-3 border-b border-[var(--rule)] py-6 md:grid-cols-[1fr_1.3fr_auto] md:gap-x-12"
                  delay={i * 60}
                >
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.14em] text-sage-text">
                      {lc(copy.tag)}
                    </div>
                    <h3 className="serif mt-1.5 text-[1.4rem] leading-snug text-pretty">
                      {lc(copy.title)}
                    </h3>
                  </div>
                  <p className="text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
                    {lc(copy.desc)}
                  </p>
                  <div className="flex items-center justify-between gap-6 md:flex-col md:items-end md:gap-2.5">
                    <div className="serif text-[1.5rem] leading-none lining-nums">
                      {formatEur(locale, entry.priceEur)}
                    </div>
                    <OrderDeliverableButton
                      code={entry.code}
                      label={td.order}
                      className="mono inline-flex cursor-pointer items-center gap-1.5 border-b border-ink pb-0.5 text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
                    />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <FreeConsult locale={locale} />
    </main>
  );
}
