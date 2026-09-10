import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { FooterLangSwitch } from './FooterLangSwitch';
import { CookiePreferencesLink } from './CookiePreferencesLink';
import { NewsletterSignup } from '@/components/ui/NewsletterSignup';
import { newsletterEnabled } from '@/lib/newsletter';
import { FREE_CONSULT_CALENDLY_URL } from '@/lib/calendly';
import { creamBox } from '@/components/ui/cta';
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
  { key: 'media', href: '/media' },
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
            className={`${creamBox} mt-[24px]`}
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
            <a href="mailto:oleseajalba@gmail.com">oleseajalba@gmail.com</a>
            <a href="tel:+37368837774">+373 68837774</a>
            <a href="https://www.instagram.com/dr.olesea_jalba_pediatru" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/olesea.jalba.2025" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://t.me/dr_olesea_jalba_official" target="_blank" rel="noopener noreferrer">Telegram</a>
          </div>
        </div>
      </div>

      {newsletterEnabled && (
        <div className="mt-12 border-t border-[var(--rule)] pt-10">
          <NewsletterSignup source="footer" className="max-w-[520px]" />
        </div>
      )}

      <div className={styles.bottom}>
        <span>{t('rights')}</span>
        <FooterLangSwitch />
        <span>
          <Link href="/gdpr" className={styles.legalLink}>
            {t('legalGdpr')}
          </Link>
          {' · '}
          <Link href="/terms" className={styles.legalLink}>
            {t('legalTerms')}
          </Link>
          {' · '}
          <CookiePreferencesLink className={styles.legalLink} />
        </span>
      </div>
    </footer>
  );
}
