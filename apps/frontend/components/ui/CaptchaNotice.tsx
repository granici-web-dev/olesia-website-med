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

  // Colour is inherited, not stated. The notice sits in four forms, and one of
  // them is the footer signup on brown: a fixed `text-ink-soft` was 1.4:1 there
  // (audit A13), and passing a colour in `className` would race the one already
  // in the string. Inheriting at 70% reads as small print on cream (5.6:1) and
  // on `--beige` (5.6:1) alike.
  const link =
    'underline decoration-current/40 underline-offset-2 transition-colors hover:decoration-current';

  return (
    <p className={`text-[0.75rem] leading-relaxed opacity-70 ${className}`}>
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
