'use client';

import { Link } from '@/i18n/navigation';
import { writeConsent } from '@/lib/analytics';

/* GDPR cookie-consent banner. Shown only when analytics is configured and the
   visitor hasn't decided yet. No tracker loads before "Accept" (see Analytics).
   Trilingual (RO default · EN · RU). */

type Bi = { ro: string; en: string; ru: string };

const T: Record<string, Bi> = {
  text: {
    ro: 'Folosim cookie-uri pentru statistici anonime, ca să îmbunătățim site-ul. Le activăm doar cu acordul tău.',
    en: 'We use cookies for anonymous statistics to improve the site. They’re enabled only with your consent.',
    ru: 'Мы используем cookie для анонимной статистики, чтобы улучшать сайт. Они включаются только с вашего согласия.',
  },
  more: { ro: 'Detalii', en: 'Details', ru: 'Подробнее' },
  accept: { ro: 'Accept', en: 'Accept', ru: 'Принять' },
  reject: { ro: 'Refuz', en: 'Decline', ru: 'Отклонить' },
};

export function ConsentBanner({
  locale,
  onAccept,
  onReject,
}: {
  locale: string;
  onAccept: () => void;
  onReject: () => void;
}) {
  const lc = (b: Bi) => (locale === 'ru' ? b.ru : locale === 'en' ? b.en : b.ro);

  const accept = () => {
    writeConsent('granted');
    onAccept();
  };
  const reject = () => {
    writeConsent('denied');
    onReject();
  };

  return (
    <div
      role="dialog"
      aria-label={lc(T.text)}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--rule)] bg-cream/95 backdrop-blur-sm"
    >
      <div className="shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between md:py-3.5">
        <p className="max-w-[68ch] text-[0.9rem] leading-relaxed text-ink-soft text-pretty">
          {lc(T.text)}{' '}
          <Link href="/gdpr" className="text-ink underline underline-offset-2 transition-colors hover:text-sage">
            {lc(T.more)}
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={reject}
            className="cursor-pointer px-4 py-2 text-[12px] font-medium uppercase tracking-[0.06em] text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            {lc(T.reject)}
          </button>
          <button
            type="button"
            onClick={accept}
            className="cursor-pointer bg-ink px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.06em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            {lc(T.accept)}
          </button>
        </div>
      </div>
    </div>
  );
}
