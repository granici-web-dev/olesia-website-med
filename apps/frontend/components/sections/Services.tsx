import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './Services.module.css';

const SERVICES = [
  { n: '01', key: 'pediatric' },
  { n: '02', key: 'nutrition' },
  { n: '03', key: 'integrative' },
  { n: '04', key: 'subscription' },
  { n: '05', key: 'quick' },
] as const;

export function Services() {
  const t = useTranslations('home.services');

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

      {SERVICES.map(({ n, key }) => (
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
            <Link href="/contact" className={styles.serviceLink}>
              {t('book')}
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
