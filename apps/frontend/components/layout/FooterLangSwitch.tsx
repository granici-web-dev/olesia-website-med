'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import styles from './Footer.module.css';

/**
 * Footer language switch — mirrors the Nav switcher: links to the current path
 * with the other locale, so switching keeps you on the same page. The active
 * locale is shown brighter and is non-interactive.
 *
 * `hreflang` and `lang` are what make "RU" read as Russian rather than as two
 * Latin letters: without them a screen reader announces every option in the
 * voice of the current page, and a crawler sees three unlabelled links
 * (audit A7, F23).
 */
export function FooterLangSwitch() {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <span className={styles.langSwitch}>
      {(['ro', 'en', 'ru'] as const).map((lng, i) => (
        <span key={lng}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          {locale === lng ? (
            <span className={styles.langActive} lang={lng} aria-current="true">
              {lng.toUpperCase()}
            </span>
          ) : (
            <Link
              href={pathname}
              locale={lng}
              hrefLang={lng}
              lang={lng}
              className={styles.legalLink}
            >
              {lng.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </span>
  );
}
