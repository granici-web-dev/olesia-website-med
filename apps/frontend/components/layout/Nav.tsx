'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { FREE_CONSULT_CALENDLY_URL } from '@/lib/calendly';
import { btnNav } from '@/components/ui/cta';
import styles from './Nav.module.css';

/** Top-level links shown after the Services dropdown. */
const NAV_LINKS = [
  { href: '/articles', key: 'articles' },
  { href: '/pricing', key: 'pricing' },
  { href: '/contact', key: 'contact' },
] as const;

/** Service pages grouped under the "Servicii" dropdown. The two dedicated
 *  landings go to their own pages; the rest deep-link into the overview. */
const SERVICE_MENU = [
  { href: '/pediatrics', key: 'pediatric' },
  { href: '/nutrition', key: 'nutrition' },
  { href: '/integrative', key: 'integrative' },
  { href: '/monitoring', key: 'monitoring' },
  { href: '/quick-question', key: 'quick' },
] as const;

interface NavProps {
  locale: string;
}

export function Nav({ locale }: NavProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const close = () => setOpen(false);

  // Close the services dropdown whenever the route changes, so it never lingers
  // open over the freshly navigated page after picking an item.
  useEffect(() => {
    setServicesOpen(false);
  }, [pathname]);

  // Active-state helpers. A route matches on exact path or a nested path; the
  // Services dropdown stays active across all service pages.
  const matches = (href: string) => {
    const path = href.split('#')[0];
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  const servicesActive = [
    '/services',
    '/pediatrics',
    '/nutrition',
    '/integrative',
    '/monitoring',
    '/quick-question',
  ].some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );
  const navCls = (href: string) => (matches(href) ? styles.active : undefined);
  // Anchor items (/services#…) can't be matched by path alone, so only the
  // dedicated landing pages get the active sub-item style.
  const subActive = (href: string) => !href.includes('#') && matches(href);

  // While the mobile menu is open: lock body scroll and close on Escape.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  // Switch locale in place: link to the current path, not the homepage.
  const langSwitch = (
    <span className={styles.lang}>
      <Link href={pathname} locale="ro" onClick={close}>
        <span className={locale === 'ro' ? styles.langActive : undefined}>RO</span>
      </Link>
      <span>/</span>
      <Link href={pathname} locale="en" onClick={close}>
        <span className={locale === 'en' ? styles.langActive : undefined}>EN</span>
      </Link>
      <span>/</span>
      <Link href={pathname} locale="ru" onClick={close}>
        <span className={locale === 'ru' ? styles.langActive : undefined}>RU</span>
      </Link>
    </span>
  );

  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.logoLink} onClick={close}>
        <Image
          src="/assets/logo-long.png"
          alt="Dr. Olesea Jalba — pediatru & nutriționist"
          width={240}
          height={60}
          className={styles.logo}
          priority
        />
      </Link>

      {/* Desktop inline navigation (hidden ≤1023px). */}
      <nav className={styles.navLinks}>
        <Link href="/about" className={navCls('/about')}>
          {t('about')}
        </Link>

        {/* Services dropdown — trigger links to the overview; the panel reveals
            the service pages on hover or keyboard focus (CSS focus-within). */}
        <div
          className={styles.hasDropdown}
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
          onFocus={() => setServicesOpen(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setServicesOpen(false);
          }}
        >
          <Link
            href="/services"
            className={`${styles.dropdownTrigger}${servicesActive ? ` ${styles.active}` : ''}`}
            aria-haspopup="true"
            aria-expanded={servicesOpen}
            aria-current={servicesActive ? 'true' : undefined}
            onClick={() => setServicesOpen(false)}
          >
            {t('services')}
            <svg
              className={`${styles.chevron}${servicesOpen ? ` ${styles.chevronOpen}` : ''}`}
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 4.5 6 7.5 9 4.5" />
            </svg>
          </Link>
          <div
            className={`${styles.dropdownPanel}${servicesOpen ? ` ${styles.dropdownPanelOpen}` : ''}`}
          >
            <div className={styles.dropdownCard}>
              {SERVICE_MENU.map(({ href, key }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.dropdownItem}${subActive(href) ? ` ${styles.active}` : ''}`}
                  aria-current={subActive(href) ? 'page' : undefined}
                  onClick={() => setServicesOpen(false)}
                >
                  {t(`servicesMenu.${key}`)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {NAV_LINKS.map(({ href, key }) => (
          <Link key={href} href={href} className={navCls(href)} aria-current={matches(href) ? 'page' : undefined}>
            {t(key)}
          </Link>
        ))}
      </nav>

      {/* Right cluster. The booking CTA stays in the bar at every width; the
          language switch is desktop-only (it moves into the panel on mobile)
          and the burger appears where the inline links are hidden (≤1023px). */}
      <div className={styles.right}>
        {langSwitch}
        <CalendlyButton
          url={FREE_CONSULT_CALENDLY_URL}
          reason="Consultație gratuită"
          label={t('bookOnline')}
          className={btnNav}
          withArrow={false}
        />
        <button
          type="button"
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          aria-label={
            open
              ? locale === 'en'
                ? 'Close menu'
                : 'Închide meniul'
              : locale === 'en'
                ? 'Open menu'
                : 'Deschide meniul'
          }
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu overlay panel. */}
      <div
        id="mobile-menu"
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        aria-hidden={!open}
      >
        <nav className={styles.panelLinks}>
          <Link href="/about" onClick={close} className={navCls('/about')}>
            {t('about')}
          </Link>
          <Link
            href="/services"
            onClick={close}
            className={servicesActive ? styles.active : undefined}
          >
            {t('services')}
          </Link>
          {SERVICE_MENU.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={`${styles.panelSubLink}${subActive(href) ? ` ${styles.active}` : ''}`}
              aria-current={subActive(href) ? 'page' : undefined}
            >
              {t(`servicesMenu.${key}`)}
            </Link>
          ))}
          {NAV_LINKS.map(({ href, key }) => (
            <Link key={href} href={href} onClick={close} className={navCls(href)}>
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className={styles.panelFooter}>{langSwitch}</div>
      </div>
    </header>
  );
}
