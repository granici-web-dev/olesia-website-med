'use client';

import { useLocale } from 'next-intl';
import { openCookiePreferences } from '@/components/analytics/CookieConsent';

/* Lets a visitor revisit their cookie choice at any time — GDPR asks that
   withdrawing consent be as easy as giving it, so this sits next to the legal
   links in the footer. Styled by the caller to match them. */
export function CookiePreferencesLink({ className }: { className?: string }) {
  const locale = useLocale();
  const label =
    locale === 'ru' ? 'Настройки cookie' : locale === 'en' ? 'Cookie settings' : 'Setări cookie';

  return (
    <button type="button" className={className} onClick={openCookiePreferences}>
      {label}
    </button>
  );
}
