import type { AboutTestimonial } from '@/lib/api';
import { Reveal } from '@/components/ui/Reveal';

/** Parent reviews. Editable from the back office. */
export function Testimonials({
  locale,
  items,
}: {
  locale: string;
  items: AboutTestimonial[];
}) {
  const t = (ro: string, en: string) => (locale === 'en' ? en : ro);
  if (items.length === 0) return null;

  return (
    <section className="shell border-t border-[var(--rule)] py-16 md:py-24">
      <h2 className="serif text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.01em]">
        {t('Ce spun părinții', 'What parents say')}
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={i} as="figure" className="flex flex-col" delay={(i % 3) * 70}>
            <blockquote className="serif-it text-[1.3rem] leading-snug text-ink text-pretty">
              “{t(it.quoteRo, it.quoteEn)}”
            </blockquote>
            <figcaption className="mt-5 text-sm">
              <span className="font-semibold text-ink">{it.author}</span>
              {(it.roleRo || it.roleEn) && (
                <span className="text-ink-soft">
                  {' '}
                  — {t(it.roleRo, it.roleEn)}
                </span>
              )}
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
