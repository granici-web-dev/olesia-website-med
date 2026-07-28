'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TestimonialDto } from '@/lib/api';
import { Reveal } from '@/components/ui/Reveal';
import styles from './Testimonials.module.css';

/**
 * Parent reviews, edited in the back office (`testimonials` module).
 *
 * ⚠️ There is deliberately **no local fallback array**. Two rounds of invented
 * reviews reached production through exactly such an array — placeholders that
 * outlived their purpose. If the API has nothing to say, this section renders
 * nothing; an empty homepage band is a far smaller problem than a fabricated
 * review under a doctor's name.
 *
 * Renders as a slider — 2 cards per view from `sm` up (1 on mobile) with a
 * native scroll-snap track navigated by arrows or swipe, so further reviews
 * stay reachable. With everything visible at once the arrows hide themselves.
 */
export function Testimonials({
  locale,
  items,
}: {
  locale: string;
  items: TestimonialDto[];
}) {
  const t = (ro: string, en: string, ru: string) =>
    locale === 'ru' ? ru : locale === 'en' ? en : ro;

  /** RU falls back to RO, and an empty string counts as missing — see `loc()`. */
  const lc = (ro: string, en: string, ru: string | null) =>
    locale === 'ru' ? (ru?.trim() ? ru : ro) : locale === 'en' ? en : ro;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
    setCanScroll(max > 1);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [sync, items.length]);

  /** Advance the track by one viewport (~one row of cards), clamped to its bounds. */
  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const to = Math.max(0, Math.min(max, el.scrollLeft + dir * el.clientWidth));
    el.scrollTo({ left: to, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  const labels = {
    title: t('Ce spun părinții', 'What parents say', 'Что говорят родители'),
    prev: t('Anterior', 'Previous', 'Назад'),
    next: t('Următor', 'Next', 'Далее'),
    /** Stand-in for a review left unsigned. Never a name we made up. */
    anonymous: t('Părinte', 'A parent', 'Родитель'),
  };

  return (
    <section className="shell bg-[var(--cream-2)] border-y border-[var(--rule)] py-16 md:py-24">
      <div className="flex items-end justify-between gap-6">
        <h2 className="serif text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.01em]">
          {labels.title}
        </h2>
        {canScroll && (
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              className={styles.arrow}
              aria-label={labels.prev}
              disabled={atStart}
              onClick={() => page(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className={styles.arrow}
              aria-label={labels.next}
              disabled={atEnd}
              onClick={() => page(1)}
            >
              →
            </button>
          </div>
        )}
      </div>

      <Reveal className="mt-10">
        <div
          ref={trackRef}
          onScroll={sync}
          className={`${styles.track} flex snap-x snap-mandatory gap-6 overflow-x-auto pb-1`}
        >
          {items.map((it) => {
            const role = lc(it.roleRo ?? '', it.roleEn ?? '', it.roleRu);
            return (
              <figure
                key={it.id}
                className="flex shrink-0 basis-full snap-start flex-col sm:basis-[calc(50%-0.75rem)]"
              >
                <blockquote className="serif-it text-[1.25rem] leading-snug text-ink text-pretty md:text-[1.3rem]">
                  “{lc(it.quoteRo, it.quoteEn, it.quoteRu)}”
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold text-ink">
                    {it.author ?? labels.anonymous}
                  </span>
                  {role && <span className="text-ink-soft"> — {role}</span>}
                  {it.source && (
                    <span className="text-ink-soft"> · {it.source}</span>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
