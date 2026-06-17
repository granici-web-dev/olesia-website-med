import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { FREE_CONSULT_CALENDLY_URL } from '@/lib/calendly';
import styles from './Hero.module.css';

const STAT_KEYS = ['experience', 'specializations', 'families'] as const;

export function Hero() {
  const t = useTranslations('home.hero');

  return (
    <section className={styles.section}>
      <div>
        <div className={styles.eyebrow}>
          <span className={styles.dot} />
          {t('eyebrow')}
        </div>

        <h1 className={styles.headline}>
          {t.rich('headline', {
            accent: (chunks) => <span className={styles.headlineAccent}>{chunks}</span>,
            br: () => <br />,
          })}
        </h1>

        <p className={styles.sub}>{t('sub')}</p>

        <div className={styles.actions}>
          <CalendlyButton
            url={FREE_CONSULT_CALENDLY_URL}
            reason="Consultație gratuită"
            label={t('ctaBook')}
            className={styles.btnDark}
            withArrow={false}
          />
          <a href="#how-it-works" className={styles.btnOutline}>
            {t('ctaHow')}
          </a>
        </div>

        <div className={styles.stats}>
          {STAT_KEYS.map((key) => (
            <div key={key}>
              <div className={styles.statNumber}>{t(`stats.${key}.value`)}</div>
              <div className={styles.statLabel}>{t(`stats.${key}.label`)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.photoWrapper}>
        <div className={styles.photoFrame}>
          <Image
            src="/assets/olesea-hero.png"
            alt="Dr. Olesea Jalba"
            fill
            className={styles.photo}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className={styles.photoCaption}>
          <span>{t('photoName')}</span>
          <span>{t('photoLocation')}</span>
        </div>
      </div>
    </section>
  );
}
