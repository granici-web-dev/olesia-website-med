import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './About.module.css';

const DETAIL_KEYS = ['studies', 'specializations'] as const;

export function About() {
  const t = useTranslations('home.about');

  return (
    <section className={styles.section}>
      <div>
        <div className={styles.eyebrow}>{t('eyebrow')}</div>
        <h3 className={styles.title}>
          {t.rich('title', {
            accent: (chunks) => <span className={styles.titleAccent}>{chunks}</span>,
            br: () => <br />,
          })}
        </h3>
      </div>

      <div>
        <p className={styles.body}>{t('body')}</p>

        <div className={styles.details}>
          {DETAIL_KEYS.map((key) => (
            <div key={key}>
              <div className={styles.detailLabel}>{t(`details.${key}.label`)}</div>
              <div className={styles.detailBody}>{t(`details.${key}.body`)}</div>
            </div>
          ))}
        </div>

        <Link href="/about" className={styles.link}>
          {t('link')}
        </Link>
      </div>
    </section>
  );
}
