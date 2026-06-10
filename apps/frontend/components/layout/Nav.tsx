import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import styles from './Nav.module.css';

const NAV_LINKS = [
  { href: '/about', labelKey: 'Despre' },
  { href: '/services', labelKey: 'Servicii' },
  { href: '/pediatrics', labelKey: 'Pediatrie' },
  { href: '/nutrition', labelKey: 'Nutriție' },
  { href: '/articles', labelKey: 'Articole' },
  { href: '/pricing', labelKey: 'Tarife' },
  { href: '/contact', labelKey: 'Contact' },
] as const;

interface NavProps {
  locale: string;
}

export function Nav({ locale }: NavProps) {
  const otherLocale = routing.locales.find((l) => l !== locale) ?? 'en';

  return (
    <header className={styles.nav}>
      <Link href="/">
        <Image
          src="/assets/logo-long.png"
          alt="Dr. Olesea Jalba — pediatru & nutriționist"
          width={240}
          height={60}
          className={styles.logo}
          priority
        />
      </Link>

      <nav className={styles.navLinks}>
        {NAV_LINKS.map(({ href, labelKey }) => (
          <Link key={href} href={href}>
            {labelKey}
          </Link>
        ))}
      </nav>

      <div className={styles.right}>
        <span className={styles.lang}>
          <span className={locale === 'ro' ? styles.langActive : undefined}>RO</span>
          <span>/</span>
          <Link href="/" locale={otherLocale}>
            <span className={locale === 'en' ? styles.langActive : undefined}>EN</span>
          </Link>
        </span>
        <Link href="/contact" className={styles.cta}>
          Programează online →
        </Link>
      </div>
    </header>
  );
}