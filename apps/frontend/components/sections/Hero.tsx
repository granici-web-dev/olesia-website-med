import { getTranslations } from 'next-intl/server';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { HeroVideo } from './HeroVideo';
import { FREE_CONSULT_CALENDLY_URL } from '@/lib/calendly';
import { btnDark, btnOutline } from '@/components/ui/cta';
import { siteMedia } from '@/lib/site-media';
import styles from './Hero.module.css';

const STAT_KEYS = ['experience', 'specializations', 'families'] as const;

export async function Hero() {
  const [t, media] = await Promise.all([
    getTranslations('home.hero'),
    siteMedia(),
  ]);

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
          {/* Intro video with a play/pause control and sound — the visitor
             starts it themselves. Sources come from the `site-media` module,
             so the client can replace any of them without a deploy. */}
          <HeroVideo
            sources={{
              ro: media.hero_video_ro.url,
              en: media.hero_video_en.url,
              ru: media.hero_video_ru.url,
            }}
            poster={media.hero_poster.url}
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
