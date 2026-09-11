import { getLocale, getTranslations } from 'next-intl/server';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { Link } from '@/i18n/navigation';
import { HeroVideo } from './HeroVideo';
import { freeConsultBooking } from '@/lib/calendly';
import { btnDark, btnOutline } from '@/components/ui/cta';
import { siteMedia } from '@/lib/site-media';
import { api, loc } from '@/lib/api';
import styles from './Hero.module.css';

/** The row has the portrait beside it, so it holds three at most. */
const MAX_STATS = 3;

export async function Hero() {
  const [locale, t, media, about, booking] = await Promise.all([
    getLocale(),
    getTranslations('home.hero'),
    siteMedia(),
    api.about(),
    freeConsultBooking(),
  ]);

  // Numbers about the practice are the client's to state: they appear once she
  // enters them in the back office, and until then the band is not there at all
  // (`docs/shape-no-invented-content.md`).
  const stats = (about?.stats ?? []).slice(0, MAX_STATS);

  return (
    <section className={styles.section}>
      <div>
        <div className={styles.eyebrow}>
          <span className={styles.dot} />
          {t('eyebrow')}
        </div>

        <h1 className={styles.headline}>
          {t.rich('headline', {
            accent: (chunks) => (
              <span className={styles.headlineAccent}>{chunks}</span>
            ),
            br: () => <br />,
          })}
        </h1>

        <p className={styles.sub}>{t('sub')}</p>

        <div className={styles.actions}>
          {booking.kind === 'calendly' ? (
            <CalendlyButton
              url={booking.url}
              reason="Consultație gratuită"
              label={t('ctaBook')}
              className={btnDark}
              withArrow={false}
            />
          ) : (
            <Link href={booking.href} className={btnDark}>
              {t('ctaBook')}
            </Link>
          )}
          <a href="#how-it-works" className={btnOutline}>
            {t('ctaHow')}
          </a>
        </div>

        {stats.length > 0 && (
          <div className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.value + stat.labelRo}>
                <div className={styles.statNumber}>{stat.value}</div>
                <div className={styles.statLabel}>
                  {loc(locale, stat.labelRo, stat.labelEn, stat.labelRu)}
                </div>
              </div>
            ))}
          </div>
        )}
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
