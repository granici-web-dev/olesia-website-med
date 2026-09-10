import Link from 'next/link';
import { DELIVERABLE_CATALOG } from '@olesia/shared';
import { api, loc, serviceTag } from '../../../lib/api';
import styles from '../../../components/sections/Services.module.css';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { Reveal } from '@/components/ui/Reveal';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import { OrderDeliverableButton } from '@/components/ui/OrderDeliverableButton';
import { FreeConsult } from '@/components/sections/FreeConsult';
import { serviceLink } from '@/components/ui/cta';
import type { LeadService, DeliverableProduct } from '@/lib/leads';
import { SERVICE_DESCRIPTIONS, SERVICE_INCLUDED } from '@/lib/service-content';
import {
  formatEur,
  formatServiceDuration,
  formatServicePrice,
} from '@/lib/service-price';

export const revalidate = 60;

/* Group C — deliverable products (brief §2): pay → short form/upload → a
   written/PDF result. No calendar, no portal subscription. Surfaced here as a
   catalog section with manual ordering (→ /contact) until the dedicated order
   form + delivery flow lands.

   Only the copy lives here. The price comes from `DELIVERABLE_CATALOG`, the
   same constant the API stamps onto an order, so this page and the order
   confirmation cannot quote different numbers. Making group C editable from the
   back office is a separate step. */
type DBi = { ro: string; en: string; ru: string };
const DELIVERABLE_COPY: Record<DeliverableProduct, { tag: DBi; title: DBi; desc: DBi }> = {
  menu_7: {
    tag: { ro: 'Meniu', en: 'Menu', ru: 'Меню' },
    title: { ro: 'Meniu personalizat · 7 zile', en: 'Personalized menu · 7 days', ru: 'Персональное меню · 7 дней' },
    desc: {
      ro: 'Plan alimentar personalizat pe 7 zile, livrat în scris după un formular scurt.',
      en: 'A personalized 7-day meal plan, delivered in writing after a short form.',
      ru: 'Персональный план питания на 7 дней — присылается письменно после короткой формы.',
    },
  },
  menu_14: {
    tag: { ro: 'Meniu', en: 'Menu', ru: 'Меню' },
    title: { ro: 'Meniu personalizat · 14 zile', en: 'Personalized menu · 14 days', ru: 'Персональное меню · 14 дней' },
    desc: {
      ro: 'Plan alimentar personalizat pe 14 zile, cu variație și liste de cumpărături.',
      en: 'A personalized 14-day meal plan, with variety and shopping lists.',
      ru: 'Персональный план питания на 14 дней — с разнообразием и списками покупок.',
    },
  },
  menu_30: {
    tag: { ro: 'Meniu', en: 'Menu', ru: 'Меню' },
    title: { ro: 'Meniu personalizat · 30 zile', en: 'Personalized menu · 30 days', ru: 'Персональное меню · 30 дней' },
    desc: {
      ro: 'Plan alimentar personalizat pe 30 de zile, pentru obiective de durată.',
      en: 'A personalized 30-day meal plan, for longer-term goals.',
      ru: 'Персональный план питания на 30 дней — для долгосрочных целей.',
    },
  },
  protocol_pednutri: {
    tag: { ro: 'Protocol', en: 'Protocol', ru: 'Протокол' },
    title: {
      ro: 'Protocol individualizat pediatrico-nutrițional',
      en: 'Individual pediatric-nutrition protocol',
      ru: 'Индивидуальный педиатрическо-нутрициологический протокол',
    },
    desc: {
      ro: 'Protocol individualizat pe baza informațiilor și documentelor trimise, livrat în scris.',
      en: 'An individualized protocol built from the information and documents you send, delivered in writing.',
      ru: 'Индивидуальный протокол на основе присланных данных и документов — присылается письменно.',
    },
  },
  protocol_complementary: {
    tag: { ro: 'Protocol', en: 'Protocol', ru: 'Протокол' },
    title: {
      ro: 'Protocol individualizat · alimentație complementară (sugari)',
      en: 'Individual complementary-feeding protocol (infants)',
      ru: 'Индивидуальный протокол прикорма (для грудничков)',
    },
    desc: {
      ro: 'Protocol de diversificare individualizat pentru sugari, livrat în scris.',
      en: 'An individualized complementary-feeding protocol for infants, delivered in writing.',
      ru: 'Индивидуальный протокол введения прикорма для грудничков — присылается письменно.',
    },
  },
};

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  const services = await api.services();

  const t = {
    eyebrow: ru ? 'Цены' : en ? 'Pricing' : 'Tarife',
    title: ru ? 'Прозрачные цены' : en ? 'Transparent pricing' : 'Tarife transparente',
    intro: ru
      ? 'Без скрытых платежей. Оплату подтверждаем вручную после записи.'
      : en
        ? 'No hidden costs. Payment is confirmed manually after booking.'
        : 'Fără costuri ascunse. Plata se confirmă manual după programare.',
    book: ru ? 'Записаться' : en ? 'Book' : 'Rezervă',
    included: ru ? 'Что входит' : en ? "What's included" : 'Ce include',
    unavailable: ru
      ? 'Тарифы сейчас недоступны. Напишите нам — назовём цену и запишем.'
      : en
        ? 'The tariffs are unavailable right now. Get in touch and we will quote you and book you in.'
        : 'Tarifele nu sunt disponibile acum. Scrie-ne și îți spunem prețul și te programăm.',
    contact: ru ? 'Связаться' : en ? 'Get in touch' : 'Contactează-ne',
  };

  const lc = (b: DBi) => (ru ? b.ru : en ? b.en : b.ro);
  const td = {
    eyebrow: ru ? 'Продукты' : en ? 'Deliverables' : 'Livrabile',
    title: ru ? 'Персональные продукты' : en ? 'Personalized products' : 'Produse personalizate',
    intro: ru
      ? 'Оплата → короткая форма → готовый результат в письменном виде. Оплата подтверждается вручную.'
      : en
        ? 'Pay → a short form → a finished result delivered in writing. Payment is confirmed manually.'
        : 'Plată → un formular scurt → un rezultat finalizat, livrat în scris. Plata se confirmă manual.',
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
            <Link href={`/${locale}/contact`} className={`${serviceLink} mt-5 inline-flex`}>
              {t.contact}
            </Link>
          </div>
        ) : (
        <div className="mt-12">
          {services.map((s, i) => (
            <Reveal key={s.id} as="div" className={styles.serviceRow} delay={i * 70}>
              <div className={styles.serviceNum}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div className={styles.serviceTag}>{serviceTag(locale, s)}</div>
                <h2 className={styles.serviceTitle}>
                  {loc(locale, s.titleRo, s.titleEn, s.titleRu)}
                </h2>
              </div>
              <div>
                <p className={styles.serviceDesc}>
                  {SERVICE_DESCRIPTIONS[s.code]
                    ? locale === 'ru'
                      ? SERVICE_DESCRIPTIONS[s.code].ru
                      : loc(locale, SERVICE_DESCRIPTIONS[s.code].ro, SERVICE_DESCRIPTIONS[s.code].en)
                    : loc(locale, s.descriptionRo, s.descriptionEn, s.descriptionRu)}
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
                  <Link
                    href={`/${locale}/contact`}
                    className={serviceLink}
                  >
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
                    title={lc(copy.title)}
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
