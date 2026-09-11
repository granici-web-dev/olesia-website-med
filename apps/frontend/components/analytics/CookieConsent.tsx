'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import * as CC from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';

import { CONSENT_EVENT, type ConsentState } from '@/lib/analytics';
import './cookie-consent.css';

/* ──────────────────────────────────────────────────────────────────────────
   Consent banner — self-hosted CookieConsent v3 (MIT), chosen over a hosted
   CMP on 2026-07-26. Free, no third-party request before consent (a hosted CMP
   is itself a foreign script), and fully styleable, which matters on a site
   this typographic.

   The client's requirement (answers v2 §9) is three explicit choices:
   "Accept toate" / "Refuz" / "Personalizează preferințele" — so the banner
   shows all three buttons, and rejecting is exactly as easy as accepting.

   Categories:
   · necessary  — always on, cannot be switched off (session, language, consent)
   · analytics  — GA4 / Google Tag Manager
   · marketing  — Meta Pixel
   Trackers themselves are loaded by `Analytics.tsx`, which listens for the
   CONSENT_EVENT this component dispatches. Nothing loads before a choice.

   Not covered here on purpose: the /media video embeds. They are click-to-load,
   so pressing play IS the visitor's decision to contact YouTube/Facebook; no
   provider is contacted otherwise.

   ⚠ Trade-off of self-hosting: no automatic cookie scanning and no server-side
   consent log. The cookie table in /gdpr is maintained by hand, and if the
   client ever needs consent records as evidence, that has to be built.
   ────────────────────────────────────────────────────────────────────────── */

type Lang = 'ro' | 'en' | 'ru';

const TRANSLATIONS: Record<Lang, CC.Translation> = {
  ro: {
    consentModal: {
      title: 'Acest site folosește cookie-uri',
      description:
        'Folosim cookie-uri necesare pentru funcționarea site-ului și, doar cu acordul tău, cookie-uri de statistică și marketing. Poți accepta tot, refuza sau alege exact ce permiți.',
      acceptAllBtn: 'Accept toate',
      acceptNecessaryBtn: 'Refuz',
      showPreferencesBtn: 'Personalizează',
      footer:
        '<a href="/ro/gdpr">Politica de confidențialitate</a> · <a href="/ro/terms">Termeni</a>',
    },
    preferencesModal: {
      title: 'Preferințe cookie-uri',
      acceptAllBtn: 'Accept toate',
      acceptNecessaryBtn: 'Refuz toate',
      savePreferencesBtn: 'Salvează alegerea',
      closeIconLabel: 'Închide',
      sections: [
        {
          title: 'Cookie-uri strict necesare',
          description:
            'Fac site-ul să funcționeze: limba aleasă, securitatea formularelor și memorarea acestei alegeri. Nu pot fi dezactivate.',
          linkedCategory: 'necessary',
        },
        {
          title: 'Statistică',
          description:
            'Ne arată, anonim, ce pagini sunt citite și cum ajung vizitatorii pe site (Google Analytics). Ne ajută să îmbunătățim conținutul.',
          linkedCategory: 'analytics',
        },
        {
          title: 'Marketing',
          description:
            'Măsoară eficiența campaniilor și permit afișarea de anunțuri relevante (Meta Pixel).',
          linkedCategory: 'marketing',
        },
      ],
    },
  },
  en: {
    consentModal: {
      title: 'This site uses cookies',
      description:
        'We use cookies that are necessary for the site to work and, only with your agreement, statistics and marketing cookies. You can accept everything, refuse, or choose exactly what you allow.',
      acceptAllBtn: 'Accept all',
      acceptNecessaryBtn: 'Reject',
      showPreferencesBtn: 'Customize',
      footer:
        '<a href="/en/gdpr">Privacy policy</a> · <a href="/en/terms">Terms</a>',
    },
    preferencesModal: {
      title: 'Cookie preferences',
      acceptAllBtn: 'Accept all',
      acceptNecessaryBtn: 'Reject all',
      savePreferencesBtn: 'Save my choice',
      closeIconLabel: 'Close',
      sections: [
        {
          title: 'Strictly necessary cookies',
          description:
            'These make the site work: your chosen language, form security, and remembering this very choice. They cannot be switched off.',
          linkedCategory: 'necessary',
        },
        {
          title: 'Statistics',
          description:
            'Show us anonymously which pages are read and how visitors arrive (Google Analytics). They help us improve the content.',
          linkedCategory: 'analytics',
        },
        {
          title: 'Marketing',
          description:
            'Measure how campaigns perform and allow relevant ads to be shown (Meta Pixel).',
          linkedCategory: 'marketing',
        },
      ],
    },
  },
  ru: {
    consentModal: {
      title: 'Этот сайт использует файлы cookie',
      description:
        'Мы используем cookie, необходимые для работы сайта, и — только с вашего согласия — статистические и маркетинговые. Можно принять всё, отказаться или выбрать, что именно разрешить.',
      acceptAllBtn: 'Принять всё',
      acceptNecessaryBtn: 'Отклонить',
      showPreferencesBtn: 'Настроить',
      footer:
        '<a href="/ru/gdpr">Политика конфиденциальности</a> · <a href="/ru/terms">Условия</a>',
    },
    preferencesModal: {
      title: 'Настройки cookie',
      acceptAllBtn: 'Принять всё',
      acceptNecessaryBtn: 'Отклонить всё',
      savePreferencesBtn: 'Сохранить выбор',
      closeIconLabel: 'Закрыть',
      sections: [
        {
          title: 'Строго необходимые',
          description:
            'Обеспечивают работу сайта: выбранный язык, защиту форм и запоминание этого выбора. Отключить их нельзя.',
          linkedCategory: 'necessary',
        },
        {
          title: 'Статистика',
          description:
            'Анонимно показывают, какие страницы читают и как посетители попадают на сайт (Google Analytics). Помогают улучшать материалы.',
          linkedCategory: 'analytics',
        },
        {
          title: 'Маркетинг',
          description:
            'Измеряют эффективность кампаний и позволяют показывать релевантную рекламу (Meta Pixel).',
          linkedCategory: 'marketing',
        },
      ],
    },
  },
};

/** Tell the rest of the app which categories are allowed right now. */
const broadcast = () => {
  const detail: ConsentState = {
    analytics: CC.acceptedCategory('analytics'),
    marketing: CC.acceptedCategory('marketing'),
  };
  window.dispatchEvent(
    new CustomEvent<ConsentState>(CONSENT_EVENT, { detail }),
  );
};

export function CookieConsent() {
  const locale = useLocale();
  const lang: Lang = locale === 'ru' ? 'ru' : locale === 'en' ? 'en' : 'ro';
  // The banner is configured once per document. `lang` is read at mount and
  // kept in step by `setLanguage` below; re-running `run()` on every locale
  // change re-registered the whole plugin and could re-show the banner to
  // somebody who had already answered it (audit A6, F19).
  const initialLang = useRef(lang);

  useEffect(() => {
    void CC.run({
      autoShow: true,
      // Ask again after a year, and re-ask if the visitor never chose.
      cookie: { name: 'olesea_consent', expiresAfterDays: 365 },
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom left',
          equalWeightButtons: true,
        },
        preferencesModal: { layout: 'box', equalWeightButtons: true },
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: {},
        marketing: {},
      },
      language: { default: initialLang.current, translations: TRANSLATIONS },
      onFirstConsent: broadcast,
      onConsent: broadcast,
      onChange: broadcast,
    }).then(broadcast);
  }, []);

  // Keep the banner's language in step with the site's language switcher.
  useEffect(() => {
    void CC.setLanguage(lang);
  }, [lang]);

  return null;
}

/** Footer entry point so a visitor can revisit their choice at any time. */
export function openCookiePreferences() {
  void CC.showPreferences();
}
