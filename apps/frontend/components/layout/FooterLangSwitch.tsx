'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import styles from './Footer.module.css';

/**
 * Footer language switch — mirrors the Nav switcher: links to the current path
 * with the other locale, so switching keeps you on the same page. The active
 * locale is shown brighter and is non-interactive.
 */
export function FooterLangSwitch() {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <span className={styles.langSwitch}>
      {(['ro', 'en'] as const).map((lng, i) => (
        <span key={lng}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          {locale === lng ? (
            <span className={styles.langActive} aria-current="true">
              {lng.toUpperCase()}
            </span>
          ) : (
            <Link href={pathname} locale={lng} className={styles.legalLink}>
              {lng.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </span>
  );
}
