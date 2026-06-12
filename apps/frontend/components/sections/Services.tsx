import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/api';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import type { LeadService } from '@/lib/leads';
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

export async function Services() {
  const t = await getTranslations('home.services');

  // Group-A services (pediatric/nutrition/integrative) are calendar-backed —
  // book them through the Calendly popup using their per-service scheduling
  // URL. Group-B services (subscription/quick) have no calendar and route to
  // the contact page instead. Keyed by service `code`.
  const services = await api.services();
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

      {SERVICES.map(({ n, key }) => {
        const url = bookingUrl.get(key);
        const leadService = LEAD_SERVICE[key];
        return (
          <div key={n} className={styles.serviceRow}>
            <div className={styles.serviceNum}>{n}</div>
            <div>
              <div className={styles.serviceTag}>{t(`items.${key}.tag`)}</div>
              <h3 className={styles.serviceTitle}>{t(`items.${key}.title`)}</h3>
            </div>
            <p className={styles.serviceDesc}>{t(`items.${key}.description`)}</p>
            <div className={styles.serviceMeta}>
              <div className={styles.servicePrice}>{t(`items.${key}.price`)}</div>
              <div className={styles.serviceDuration}>{t(`items.${key}.duration`)}</div>
              {url ? (
                <CalendlyButton
                  url={url}
                  reason={t(`items.${key}.title`)}
                  label={t('book')}
                  className={styles.serviceLink}
                  withArrow={false}
                />
              ) : leadService ? (
                <BookGroupBButton
                  service={leadService}
                  label={t('book')}
                  className={styles.serviceLink}
                />
              ) : (
                <Link href="/contact" className={styles.serviceLink}>
                  {t('book')}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
