import Link from 'next/link';
import { api, loc, serviceTag, type ServiceDto } from '../../../lib/api';
import styles from '../../../components/sections/Services.module.css';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { Reveal } from '@/components/ui/Reveal';
import { CALENDLY_FALLBACK_URLS } from '@/lib/calendly';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import { FreeConsult } from '@/components/sections/FreeConsult';
import type { LeadService } from '@/lib/leads';
import {
  SERVICE_DESCRIPTIONS,
  SERVICE_INCLUDED,
  SERVICE_PRICE_META,
} from '@/lib/service-content';

export const revalidate = 60;

/* Local fallback so /pricing always renders the five tariffs even when the API
   is unreachable (e.g. the static client preview). Mirrors the seed; the live
   API takes over whenever it responds. Group-A Calendly URLs are the current
   test links (⚠ swap for the client's before launch). */
const FALLBACK_SERVICES: ServiceDto[] = [
  {
    id: 'pediatric', code: 'pediatric', group: 'A_booking',
    titleRo: 'Consultație pediatrică', titleEn: 'Pediatric consultation',
    descriptionRo: '', descriptionEn: '', durationMin: 50, price: 600,
    priceLabelRo: null, priceLabelEn: null, calendlyEventTypeUri: null,
    calendlySchedulingUrl: CALENDLY_FALLBACK_URLS.pediatric,
    sortOrder: 1, active: true,
  },
  {
    id: 'nutrition', code: 'nutrition', group: 'A_booking',
    titleRo: 'Consultație nutrițională', titleEn: 'Nutrition consultation',
    descriptionRo: '', descriptionEn: '', durationMin: 60, price: 700,
    priceLabelRo: null, priceLabelEn: null, calendlyEventTypeUri: null,
    calendlySchedulingUrl: CALENDLY_FALLBACK_URLS.nutrition,
    sortOrder: 2, active: true,
  },
  {
    id: 'integrative', code: 'integrative', group: 'A_booking',
    titleRo: 'Consultație integrativă & monitorizare',
    titleEn: 'Integrative consultation & monitoring',
    descriptionRo: '', descriptionEn: '', durationMin: 90, price: 1100,
    priceLabelRo: null, priceLabelEn: null, calendlyEventTypeUri: null,
    calendlySchedulingUrl: CALENDLY_FALLBACK_URLS.integrative,
    sortOrder: 3, active: true,
  },
  {
    id: 'monitoring', code: 'monitoring', group: 'B_portal',
    titleRo: 'Monitorizare 3 luni', titleEn: '3-month monitoring',
    descriptionRo: '', descriptionEn: '', durationMin: null, price: 2400,
    priceLabelRo: 'de la 2.400 lei / 3 luni', priceLabelEn: 'from 2,400 lei / 3 months',
    calendlyEventTypeUri: null, calendlySchedulingUrl: null, sortOrder: 4, active: true,
  },
  {
    id: 'quick_question', code: 'quick_question', group: 'B_portal',
    titleRo: 'Întrebare rapidă', titleEn: 'Quick question',
    descriptionRo: '', descriptionEn: '', durationMin: null, price: 180,
    priceLabelRo: '48 h · răspuns scris', priceLabelEn: '48 h · written reply',
    calendlyEventTypeUri: null, calendlySchedulingUrl: null, sortOrder: 5, active: true,
  },
];

function price(locale: string, s: ServiceDto): string {
  const label = loc(locale, s.priceLabelRo, s.priceLabelEn);
  if (label) return label;
  return `${new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'ro-RO').format(s.price)} lei`;
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  const live = (await api.services()).filter((s) => s.active);
  const services = live.length > 0 ? live : FALLBACK_SERVICES;

  const t = {
    eyebrow: ru ? 'Цены' : en ? 'Pricing' : 'Tarife',
    title: ru ? 'Прозрачные цены' : en ? 'Transparent pricing' : 'Tarife transparente',
    intro: ru
      ? 'Без скрытых платежей. Оплату подтверждаем вручную после записи.'
      : en
        ? 'No hidden costs. Payment is confirmed manually after booking.'
        : 'Fără costuri ascunse. Plata se confirmă manual după programare.',
    book: ru ? 'Записаться' : en ? 'Book' : 'Rezervă',
    min: ru ? 'мин' : en ? 'min' : 'min',
    included: ru ? 'Что входит' : en ? "What's included" : 'Ce include',
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

        {/* Editorial service rows — same design as the homepage Services section. */}
        <div className="mt-12 border-b border-[var(--rule)]">
          {services.map((s, i) => (
            <Reveal key={s.id} as="div" className={styles.serviceRow} delay={i * 70}>
              <div className={styles.serviceNum}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div className={styles.serviceTag}>{serviceTag(locale, s)}</div>
                <h2 className={styles.serviceTitle}>
                  {loc(locale, s.titleRo, s.titleEn)}
                </h2>
              </div>
              <div>
                <p className={styles.serviceDesc}>
                  {SERVICE_DESCRIPTIONS[s.code]
                    ? locale === 'ru'
                      ? SERVICE_DESCRIPTIONS[s.code].ru
                      : loc(locale, SERVICE_DESCRIPTIONS[s.code].ro, SERVICE_DESCRIPTIONS[s.code].en)
                    : loc(locale, s.descriptionRo, s.descriptionEn)}
                </p>
                {SERVICE_INCLUDED[s.code] && (
                  <div className="mt-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-sage-text">
                      {t.included}
                    </p>
                    <ul className="mt-3 grid gap-2">
                      {(locale === 'ru' ? SERVICE_INCLUDED[s.code].ru : locale === 'en' ? SERVICE_INCLUDED[s.code].en : SERVICE_INCLUDED[s.code].ro).map(
                        (item) => (
                          <li
                            key={item}
                            className="grid grid-cols-[1.1em_1fr] gap-x-2 text-[0.9rem] leading-relaxed text-ink-soft"
                          >
                            <span aria-hidden="true" className="text-sage">
                              —
                            </span>
                            <span className="text-pretty">{item}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <div className={styles.serviceMeta}>
                <div className={styles.servicePrice}>
                  {SERVICE_PRICE_META[s.code]
                    ? locale === 'ru'
                      ? SERVICE_PRICE_META[s.code].price.ru
                      : loc(locale, SERVICE_PRICE_META[s.code].price.ro, SERVICE_PRICE_META[s.code].price.en)
                    : price(locale, s)}
                </div>
                {SERVICE_PRICE_META[s.code] ? (
                  <div className={styles.serviceDuration}>
                    {locale === 'ru'
                      ? SERVICE_PRICE_META[s.code].duration.ru
                      : loc(locale, SERVICE_PRICE_META[s.code].duration.ro, SERVICE_PRICE_META[s.code].duration.en)}
                  </div>
                ) : s.durationMin ? (
                  <div className={styles.serviceDuration}>
                    {s.durationMin} {t.min}
                  </div>
                ) : null}
                {s.group === 'A_booking' && s.calendlySchedulingUrl ? (
                  <CalendlyButton
                    url={s.calendlySchedulingUrl}
                    reason={loc(locale, s.titleRo, s.titleEn)}
                    label={t.book}
                    className={styles.serviceLink}
                  />
                ) : s.group === 'B_portal' ? (
                  <BookGroupBButton
                    service={s.code as LeadService}
                    label={t.book}
                    className={styles.serviceLink}
                  />
                ) : (
                  <Link
                    href={`/${locale}/contact`}
                    className={styles.serviceLink}
                  >
                    {t.book}
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <FreeConsult locale={locale} />
    </main>
  );
}
