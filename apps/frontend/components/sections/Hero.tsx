import { useTranslations } from 'next-intl';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { HeroVideo } from './HeroVideo';
import { FREE_CONSULT_CALENDLY_URL } from '@/lib/calendly';
import { btnDark, btnOutline } from '@/components/ui/cta';
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
            className={btnDark}
            withArrow={false}
          />
          <a href="#how-it-works" className={btnOutline}>
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
          {/* Hardcoded intro video (client-provided) with a play/pause control
             and sound — the visitor starts it themselves.
             TODO: make source editable from the back office later. */}
          <HeroVideo />
        </div>
        <div className={styles.photoCaption}>
          <span>{t('photoName')}</span>
          <span>{t('photoLocation')}</span>
        </div>
      </div>
    </section>
  );
}
