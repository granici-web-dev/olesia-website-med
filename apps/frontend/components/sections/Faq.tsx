import type { AboutFaqItem } from '@/lib/api';

/** FAQ — native <details> accordion, no client JS. Editable from the back office. */
export function Faq({
  locale,
  items,
}: {
  locale: string;
  items: AboutFaqItem[];
}) {
  const t = (ro: string, en: string) => (locale === 'en' ? en : ro);
  if (items.length === 0) return null;

  return (
    <section className="shell border-t border-[var(--rule)] py-16 md:py-24">
      <h2 className="serif text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.01em]">
        {t('Întrebări frecvente', 'Frequently asked')}
      </h2>
      <div className="mt-8 max-w-[820px]">
        {items.map((it, i) => (
          <details
            key={i}
            className="group border-t border-[var(--rule)] last:border-b"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
              <span className="serif text-[1.3rem] leading-snug text-ink">
                {t(it.qRo, it.qEn)}
              </span>
              <span
                className="mono shrink-0 text-xl text-sage transition-transform duration-300 group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="max-w-[64ch] pb-6 leading-relaxed text-ink-soft text-pretty">
              {t(it.aRo, it.aEn)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
