import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './Footer.module.css';

const SERVICE_KEYS = ['pediatric', 'nutrition', 'integrative', 'subscription', 'quick'] as const;
const RESOURCE_KEYS = ['articles', 'guides', 'menus', 'faq'] as const;

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <Image
            src="/assets/logo-long.png"
            alt="Dr. Olesea Jalba — pediatru & nutriționist"
            width={380}
            height={96}
            className={styles.logo}
          />
          <p className={styles.tagline}>{t('tagline')}</p>
          <Link href="/contact" className={styles.bookBtn}>
            {t('book')}
          </Link>
        </div>

        <div>
          <div className={styles.colLabel}>{t('servicesLabel')}</div>
          <div className={styles.colLinks}>
            {SERVICE_KEYS.map((key) => (
              <Link key={key} href="/services">
                {t(`services.${key}`)}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.colLabel}>{t('resourcesLabel')}</div>
          <div className={styles.colLinks}>
            {RESOURCE_KEYS.map((key) => (
              <Link key={key} href="/articles">
                {t(`resources.${key}`)}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.colLabel}>{t('contactLabel')}</div>
          <div className={styles.colLinks}>
            <a href="mailto:contact@oleseajalba.md">contact@oleseajalba.md</a>
            <a href="tel:+37379000000">+373 79 000 000</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>{t('rights')}</span>
        <span>RO · EN</span>
        <span>{t('legal')}</span>
      </div>
    </footer>
  );
}
