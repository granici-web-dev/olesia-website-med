import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { FREE_CONSULT_CALENDLY_URL } from '@/lib/calendly';
import styles from './Footer.module.css';

const SERVICE_LINKS = [
  { key: 'pediatric', href: '/pediatrics' },
  { key: 'nutrition', href: '/nutrition' },
  { key: 'integrative', href: '/integrative' },
  { key: 'subscription', href: '/monitoring' },
  { key: 'quick', href: '/quick-question' },
] as const;
const RESOURCE_LINKS = [
  { key: 'articles', href: '/articles' },
  { key: 'guides', href: '/guides' },
  { key: 'menus', href: '/menus' },
  { key: 'faq', href: '/faq' },
] as const;

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
          <CalendlyButton
            url={FREE_CONSULT_CALENDLY_URL}
            reason="Consultație gratuită"
            label={t('book')}
            className={styles.bookBtn}
            withArrow={false}
          />
        </div>

        <div>
          <div className={styles.colLabel}>{t('servicesLabel')}</div>
          <div className={styles.colLinks}>
            {SERVICE_LINKS.map(({ key, href }) => (
              <Link key={key} href={href}>
                {t(`services.${key}`)}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.colLabel}>{t('resourcesLabel')}</div>
          <div className={styles.colLinks}>
            {RESOURCE_LINKS.map(({ key, href }) => (
              <Link key={key} href={href}>
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
        <span>
          <Link href="/gdpr" className={styles.legalLink}>
            {t('legal').split('·')[0].trim()}
          </Link>
          {` · ${t('legal').split('·').slice(1).join('·').trim()}`}
        </span>
      </div>
    </footer>
  );
}
