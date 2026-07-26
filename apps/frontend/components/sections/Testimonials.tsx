'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AboutTestimonial } from '@/lib/api';
import { Reveal } from '@/components/ui/Reveal';
import styles from './Testimonials.module.css';

/** Testimonial with optional RU/EN copy (local items are trilingual; API items are RO/EN only). */
type Testimonial = AboutTestimonial & {
  quoteRu?: string;
  roleRu?: string;
  authorEn?: string;
  authorRu?: string;
};

/**
 * REAL parent reviews (received from the client 2026-07-26, source `docs/testemonials.md`).
 * These replaced the placeholder set — no invented reviews are shown anywhere on the site.
 *
 * Handling rules for anything added here:
 * · Wording is the reviewer's. Only typos/spacing were normalised — never the meaning.
 * · Each review is authored in ONE language; the other two are faithful translations
 *   (review 1 was written in RU, review 2 in RO).
 * · Unsigned reviews get a neutral author label, not an invented name.
 * · `source` names the platform when the review came from one (review 2 mentions
 *   DoctorChat in its own text). ⛔ Ask the client whether DoctorChat requires a
 *   formal credit beyond this.
 *
 * Moves to the back-office `testimonials` module in the backend pass; until then the
 * API list (when non-empty) still wins over this array.
 */
const LOCAL_TESTIMONIALS: Testimonial[] = [
  {
    quoteRo:
      'Mulțumesc mult doamnei doctor pentru tratamentul competent și de calitate al copilului. Ne-am adresat sâmbătă, cu o tuse foarte puternică. Doctorul a fost foarte atent cu copilul și, după toate analizele, i-a explicat mamei pe înțeles schema de tratament. Acasă am urmat totul întocmai — deja în a treia zi tusea a început să cedeze (pneumonie pe dreapta). În a cincea zi copilul se simțea mult mai bine. Vă mulțumesc enorm pentru ajutor și pentru că la Chișinău am întâlnit un medic la fel de bun ca în Ucraina (Nikolaev). Pentru că atunci când copilul e bolnav e mereu panică, mai ales într-o altă țară.',
    quoteEn:
      'Thank you so much for the competent, high-quality care of our child. We came in on a Saturday with a very bad cough. The doctor was extremely attentive with the child and, after all the tests, explained the treatment plan to the mother in plain language. At home we followed it exactly — by the third day the cough began to ease (right-sided pneumonia). By the fifth day the child felt much better. Thank you enormously for your help, and for the fact that in Chișinău I met a doctor as good as the one back in Ukraine (Mykolaiv). Because when your child is ill there is always panic — especially in another country.',
    quoteRu:
      'Спасибо большое доктору за грамотное, квалифицированное и качественное лечение ребёнка. Обратились в субботу с очень сильным кашлем. Доктор был очень внимателен к ребёнку и после всех анализов доступно объяснил маме курс лечения. Дома всё делали по назначению врача — уже на третий день лечения кашель начал уходить (правосторонняя пневмония). На пятый день ребёнок чувствовал себя намного лучше. Спасибо вам огромное за помощь и за то, что в Кишинёве мне встретился такой же грамотный врач, как и в Украине (Николаев). Потому что, когда болеет ребёнок, всегда паника — особенно в другой стране.',
    author: 'Părinte',
    authorEn: 'A parent',
    authorRu: 'Родитель',
    roleRo: 'copil tratat de pneumonie',
    roleEn: 'child treated for pneumonia',
    roleRu: 'ребёнок лечился от пневмонии',
  },
  {
    quoteRo:
      'Prima mea experiență pe DoctorChat. E un instrument bun când ai nevoie de un sfat al medicului sau de o părere în plus. Dna Jalbă a fost atentă la detalii, a răspuns la toate întrebările care mă interesau și m-a ajutat să găsesc o soluție.',
    quoteEn:
      'My first experience on DoctorChat. It’s a good tool when you need a doctor’s advice or a second opinion. Dr. Jalbă paid attention to the details, answered every question I had, and helped me find a solution.',
    quoteRu:
      'Мой первый опыт на DoctorChat. Хороший инструмент, когда нужен совет врача или дополнительное мнение. Госпожа Жалбэ была внимательна к деталям, ответила на все интересовавшие меня вопросы и помогла найти решение.',
    author: 'Zlobin Alexandru',
    roleRo: 'prin DoctorChat',
    roleEn: 'via DoctorChat',
    roleRu: 'через DoctorChat',
  },
];

/**
 * Parent reviews. Editable from the back office; falls back to the local set when empty.
 * Renders as a slider — 2 cards per view from `sm` up (1 on mobile) with a native
 * scroll-snap track navigated by arrows or swipe, so any further reviews stay reachable.
 * With only two reviews the arrows hide themselves (`canScroll` is false).
 */
export function Testimonials({
  locale,
  items,
}: {
  locale: string;
  items: AboutTestimonial[];
}) {
  const t = (ro: string, en: string, ru: string) =>
    locale === 'ru' ? ru : locale === 'en' ? en : ro;

  const list: Testimonial[] = items.length > 0 ? items : LOCAL_TESTIMONIALS;

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
  }, [sync, list.length]);

  /** Advance the track by one viewport (~one row of cards), clamped to its bounds. */
  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const to = Math.max(0, Math.min(max, el.scrollLeft + dir * el.clientWidth));
    el.scrollTo({ left: to, behavior: 'smooth' });
  };

  if (list.length === 0) return null;

  const labels = {
    title: t('Ce spun părinții', 'What parents say', 'Что говорят родители'),
    prev: t('Anterior', 'Previous', 'Назад'),
    next: t('Următor', 'Next', 'Далее'),
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
          {list.map((it, i) => (
            <figure
              key={i}
              className="flex shrink-0 basis-full snap-start flex-col sm:basis-[calc(50%-0.75rem)]"
            >
              <blockquote className="serif-it text-[1.25rem] leading-snug text-ink text-pretty md:text-[1.3rem]">
                “{t(it.quoteRo, it.quoteEn, it.quoteRu ?? it.quoteRo)}”
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold text-ink">
                  {t(it.author, it.authorEn ?? it.author, it.authorRu ?? it.author)}
                </span>
                {(it.roleRo || it.roleEn) && (
                  <span className="text-ink-soft">
                    {' '}
                    — {t(it.roleRo, it.roleEn, it.roleRu ?? it.roleRo)}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
