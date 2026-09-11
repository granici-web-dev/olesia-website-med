import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';
import styles from './About.module.css';

const DETAIL_KEYS = ['studies', 'specializations'] as const;

export function About() {
  const t = useTranslations('home.about');

  return (
    <section className={styles.section}>
      <div>
        <div className={styles.eyebrow}>{t('eyebrow')}</div>
        {/* h2, not h3: this is a top-level home-page section like Services and
            HowItWorks, and an h3 here skipped a level in the outline the whole
            page reads as (audit A7, F17). */}
        <h2 className={styles.title}>
          {t.rich('title', {
            accent: (chunks) => <span className={styles.titleAccent}>{chunks}</span>,
            br: () => <br />,
          })}
        </h2>
      </div>

      <div>
        <p className={styles.body}>{t('body')}</p>

        <div className={styles.details}>
          {DETAIL_KEYS.map((key, i) => (
            <Reveal key={key} as="div" delay={i * 80}>
              <div className={styles.detailLabel}>{t(`details.${key}.label`)}</div>
              <div className={styles.detailBody}>{t(`details.${key}.body`)}</div>
            </Reveal>
          ))}
        </div>

        <Link href="/about" className={styles.link}>
          {t('link')}
        </Link>
      </div>
    </section>
  );
}
