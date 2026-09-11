import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ApiUnavailableError, api, loc } from '@/lib/api';
import { contactHref, groupContacts } from '@/lib/contacts';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { FooterLangSwitch } from './FooterLangSwitch';
import { CookiePreferencesLink } from './CookiePreferencesLink';
import { NewsletterSignup } from '@/components/ui/NewsletterSignup';
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

/**
 * An unreachable API leaves the footer without its contact column, rather than
 * taking the page down.
 *
 * This is the one reader that swallows `ApiUnavailableError`, and the reason is
 * structural: the footer is in the locale layout, so it renders on every page
 * *including* the one that exists to report the outage. A footer that throws
 * makes the error boundary unreachable and turns a missing phone number into a
 * bare 500 with no wording in any language.
 */
async function contactChannels() {
  try {
    return groupContacts(await api.contacts());
  } catch (e) {
    if (e instanceof ApiUnavailableError) return groupContacts([]);
    throw e;
  }
}

/**
 * The contact column reads `GET /contacts`. It used to be five hardcoded
 * anchors while the back office edited a table nothing rendered (audit A6,
 * F12) — so a changed phone number reached nobody. A kind the client has not
 * entered simply does not appear.
 */
export async function Footer() {
  const t = await getTranslations('footer');
  const locale = await getLocale();
  const { phones, emails, socials, addresses } = await contactChannels();
  const reachable = [...emails, ...phones, ...socials];

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

        {(reachable.length > 0 || addresses.length > 0) && (
          <div>
            <div className={styles.colLabel}>{t('contactLabel')}</div>
            <div className={styles.colLinks}>
              {reachable.map((c) => {
                const href = contactHref(c);
                if (!href) return null;
                const external = c.type === 'social';
                return (
                  <a
                    key={c.id}
                    href={href}
                    {...(external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {c.type === 'social'
                      ? loc(locale, c.labelRo, c.labelEn, c.labelRu)
                      : c.value}
                  </a>
                );
              })}
              {addresses.map((c) => (
                <span key={c.id}>{c.value}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 border-t border-[var(--rule)] pt-10">
        <NewsletterSignup source="footer" className="max-w-[520px]" />
      </div>

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
