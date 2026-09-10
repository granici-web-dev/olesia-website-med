import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/api';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { Reveal } from '@/components/ui/Reveal';
import { CALENDLY_FALLBACK_URLS } from '@/lib/calendly';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import type { LeadService } from '@/lib/leads';
import { SERVICE_INCLUDED } from '@/lib/service-content';
import {
  formatPriceRange,
  formatServiceDuration,
} from '@/lib/service-price';
import { serviceLink } from '@/components/ui/cta';
import styles from './Services.module.css';

const SERVICES = [
  { n: '01', key: 'pediatric' },
  { n: '02', key: 'nutrition' },
  { n: '03', key: 'integrative' },
  { n: '04', key: 'subscription' },
  { n: '05', key: 'quick' },
] as const;

/** Group-B service keys → the lead-intake service they post to. */
const LEAD_SERVICE: Partial<Record<string, LeadService>> = {
  subscription: 'monitoring',
  quick: 'quick_question',
};

/**
 * Homepage keys whose booking splits across more than one catalog service.
 * Nutrition is two services with two calendars but one story, so the tile
 * stays single and offers both links — the same shape /nutrition already has.
 * The label keys live under `home.services.audience`.
 */
const SPLIT_BOOKING: Partial<Record<string, { code: string; label: string }[]>> =
  {
    nutrition: [
      { code: 'nutrition_copii', label: 'children' },
      { code: 'nutrition_adulti', label: 'adults' },
    ],
  };

/** Homepage item keys → service `code` used by the shared content maps. */
const CONTENT_CODE: Record<string, string> = {
  subscription: 'monitoring',
  quick: 'quick_question',
};

/**
 * The catalog services behind a tile. Nutrition is one tile over two services,
 * so a tile owns a list rather than a code — see `SPLIT_BOOKING`.
 */
function codesFor(key: string): string[] {
  const split = SPLIT_BOOKING[key];
  if (split) return split.map((s) => s.code);
  return [CONTENT_CODE[key] ?? key];
}

export async function Services() {
  const t = await getTranslations('home.services');
  const lc = await getLocale();
  const en = lc === 'en';
  const ru = lc === 'ru';
  const includedLabel = ru ? 'Что входит' : en ? "What's included" : 'Ce include';

  // Group-A services (pediatric/nutrition/integrative) are calendar-backed —
  // book them through the Calendly popup using their per-service scheduling
  // URL. Group-B services (subscription/quick) have no calendar and route to
  // the contact page instead. Keyed by service `code`.
  const services = await api.services();
  const byCode = new Map(services.map((s) => [s.code, s]));
  const bookingUrl = new Map(
    services
      .filter((s) => s.group === 'A_booking' && s.calendlySchedulingUrl)
      .map((s) => [s.code, s.calendlySchedulingUrl as string]),
  );

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>{t('eyebrow')}</div>
          <h2 className={styles.title}>
            {t.rich('title', {
              accent: (chunks) => <span className={styles.titleAccent}>{chunks}</span>,
              br: () => <br />,
            })}
          </h2>
        </div>
        <p className={styles.headerSub}>{t('headerSub')}</p>
      </div>

      {SERVICES.map(({ n, key }, i) => {
        const split = SPLIT_BOOKING[key];
        const url = bookingUrl.get(key) ?? CALENDLY_FALLBACK_URLS[key];
        const leadService = LEAD_SERVICE[key];
        const included = SERVICE_INCLUDED[CONTENT_CODE[key] ?? key];
        const includedItems = included ? (ru ? included.ru : en ? included.en : included.ro) : null;
        const tileServices = codesFor(key)
          .map((code) => byCode.get(code))
          .filter((s) => s !== undefined);
        const priceText = formatPriceRange(lc, tileServices);
        const durationText = formatServiceDuration(
          lc,
          tileServices[0]?.durationMin ?? null,
        );
        return (
          <Reveal key={n} as="div" className={styles.serviceRow} delay={i * 70}>
            <div className={styles.serviceNum}>{n}</div>
            <div>
              <div className={styles.serviceTag}>{t(`items.${key}.tag`)}</div>
              <h3 className={styles.serviceTitle}>{t(`items.${key}.title`)}</h3>
            </div>
            <div>
              {includedItems && (
                <>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-sage-text">
                    {includedLabel}
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {includedItems.map((item) => (
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
                </>
              )}
            </div>
            <div className={styles.serviceMeta}>
              {priceText && <div className={styles.servicePrice}>{priceText}</div>}
              {durationText && (
                <div className={styles.serviceDuration}>{durationText}</div>
              )}
              {split ? (
                <div className="flex flex-col items-start gap-1">
                  {split.map(({ code, label }) => {
                    const splitUrl =
                      bookingUrl.get(code) ?? CALENDLY_FALLBACK_URLS[code];
                    return splitUrl ? (
                      <CalendlyButton
                        key={code}
                        url={splitUrl}
                        reason={`${t(`items.${key}.title`)} — ${t(`audience.${label}`)}`}
                        label={`${t('book')} · ${t(`audience.${label}`)}`}
                        className={serviceLink}
                        withArrow={false}
                      />
                    ) : null;
                  })}
                </div>
              ) : url ? (
                <CalendlyButton
                  url={url}
                  reason={t(`items.${key}.title`)}
                  label={t('book')}
                  className={serviceLink}
                  withArrow={false}
                />
              ) : leadService ? (
                <BookGroupBButton
                  service={leadService}
                  label={t('book')}
                  className={serviceLink}
                />
              ) : (
                <Link href="/contact" className={serviceLink}>
                  {t('book')}
                </Link>
              )}
            </div>
          </Reveal>
        );
      })}
    </section>
  );
}
