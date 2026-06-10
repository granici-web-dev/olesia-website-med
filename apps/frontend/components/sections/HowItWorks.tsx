import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './HowItWorks.module.css';

const STEPS = [
  { n: 'I', key: 'booking' },
  { n: 'II', key: 'preparation' },
  { n: 'III', key: 'consultation' },
  { n: 'IV', key: 'plan' },
] as const;

export function HowItWorks() {
  const t = useTranslations('home.howItWorks');

  return (
    <section id="how-it-works" className={styles.section}>
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
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.connector} aria-hidden="true" />
        {STEPS.map(({ n, key }) => (
          <div key={key} className={styles.step}>
            <div className={styles.stepNumber}>{n}</div>
            <h3 className={styles.stepTitle}>{t(`steps.${key}.title`)}</h3>
            <p className={styles.stepDesc}>{t(`steps.${key}.description`)}</p>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerNote}>{t('footerNote')}</p>
        <Link href="/contact" className={styles.btn}>
          {t('cta')}
        </Link>
      </div>
    </section>
  );
}
