'use client';

import { useLocale } from 'next-intl';
import { captchaEnabled } from '@/lib/captcha';

/* Google requires either its floating badge or this disclosure next to the
   form. We take the disclosure and hide the badge (globals.css) — the badge
   floats over the layout and would only appear after the first submit anyway,
   since the script is loaded lazily. Renders nothing until the client's site
   key is configured. */
export function CaptchaNotice({ className = '' }: { className?: string }) {
  const locale = useLocale();
  if (!captchaEnabled) return null;

  const ru = locale === 'ru';
  const en = locale === 'en';

  const text = ru
    ? ['Форма защищена reCAPTCHA. Применяются ', ' и ', ' Google.']
    : en
      ? ['This form is protected by reCAPTCHA. Google’s ', ' and ', ' apply.']
      : [
          'Formularul este protejat de reCAPTCHA. Se aplică ',
          ' și ',
          ' Google.',
        ];

  const privacy = ru
    ? 'Политика конфиденциальности'
    : en
      ? 'Privacy Policy'
      : 'Politica de confidențialitate';
  const terms = ru
    ? 'Условия использования'
    : en
      ? 'Terms of Service'
      : 'Termenii de utilizare';

  const link =
    'underline decoration-[var(--rule)] underline-offset-2 transition-colors hover:text-sage';

  return (
    <p className={`text-[0.75rem] leading-relaxed text-ink-soft ${className}`}>
      {text[0]}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className={link}
      >
        {privacy}
      </a>
      {text[1]}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className={link}
      >
        {terms}
      </a>
      {text[2]}
    </p>
  );
}
