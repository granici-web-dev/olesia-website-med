'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { FREE_CONSULT_CALENDLY_URL } from '@/lib/calendly';
import styles from './Nav.module.css';

const NAV_LINKS = [
  { href: '/about', key: 'about' },
  { href: '/services', key: 'services' },
  { href: '/pediatrics', key: 'pediatrics' },
  { href: '/nutrition', key: 'nutrition' },
  { href: '/articles', key: 'articles' },
  { href: '/pricing', key: 'pricing' },
  { href: '/contact', key: 'contact' },
] as const;

interface NavProps {
  locale: string;
}

export function Nav({ locale }: NavProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

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
        {NAV_LINKS.map(({ href, key }) => (
          <Link key={href} href={href}>
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
          className={styles.cta}
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
          {NAV_LINKS.map(({ href, key }) => (
            <Link key={href} href={href} onClick={close}>
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className={styles.panelFooter}>{langSwitch}</div>
      </div>
    </header>
  );
}
