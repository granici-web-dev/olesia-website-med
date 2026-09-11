import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { pageMetadata } from '@/lib/page-metadata';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { btnDark, creamPill, creamUnderline } from '@/components/ui/cta';
import { api } from '@/lib/api';
import { formatSla } from '@/lib/working-hours';
import { biFor, type Bi } from '@/lib/i18n-types';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   FAQ — the site's consolidation point. Removes friction before conversion,
   offloads support, and routes correctly (emergencies → 112, medical → Quick
   question). Content comes from the back office (`GET /faq`) and from nowhere
   else: a 200-line copy of the seeded questions used to render whenever the
   API answered with nothing, so an empty FAQ and an unreachable one looked
   identical and the client's own edits were invisible (audit A6, F6).
   Accessible native <details> accordions, deep-link category anchors, and
   FAQPage JSON-LD for rich snippets. Trilingual (RO default · EN · RU).
   ────────────────────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  return pageMetadata({
    locale,
    path: '/faq',
    title: ru
      ? 'Частые вопросы | Dr. Olesea Jalba'
      : en
        ? 'FAQ | Dr. Olesea Jalba'
        : 'Întrebări frecvente | Dr. Olesea Jalba',
    description: ru
      ? 'Ответы про онлайн-консультации, запись, оплату переводом и услуги — педиатрия и нутрициология.'
      : en
        ? 'Answers about online consultations, booking, payment by transfer, and services — pediatrics and nutrition.'
        : 'Răspunsuri despre consultațiile online, programare, plată prin transfer și servicii — pediatrie și nutriție.',
  });
}

interface FaqItem {
  q: Bi;
  a: Bi;
}
interface FaqCategory {
  key: string;
  title: Bi;
  items: FaqItem[];
}

/**
 * Fetch the published FAQ and reshape it for this page.
 *
 * The RU fallback is resolved here rather than at render time, so `lc()` keeps
 * working on plain trilingual strings: an untranslated question shows its
 * Romanian text instead of a blank line. Same rule as `loc()` in `lib/api` —
 * an empty string counts as missing, because that is what a cleared field in
 * the back office produces.
 */
async function loadCategories(): Promise<FaqCategory[]> {
  const sections = await api.faq();
  const ruOr = (ru: string | null, fallback: string) =>
    ru?.trim() ? ru : fallback;

  return sections.map((c) => ({
    key: c.slug,
    title: {
      ro: c.titleRo,
      en: c.titleEn,
      ru: ruOr(c.titleRu, c.titleRo),
    },
    items: c.items.map((i) => ({
      q: {
        ro: i.questionRo,
        en: i.questionEn,
        ru: ruOr(i.questionRu, i.questionRo),
      },
      a: {
        ro: i.answerRo,
        en: i.answerEn,
        ru: ruOr(i.answerRu, i.answerRo),
      },
    })),
  }));
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = biFor(locale);

  const [CATEGORIES, hours] = await Promise.all([
    loadCategories(),
    api.workingHours(),
  ]);
  const sla = formatSla(locale, hours.expressSlaMinutes);

  // FAQPage JSON-LD (rich snippets) — built from the current-locale answers.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CATEGORIES.flatMap((c) =>
      c.items.map((it) => ({
        '@type': 'Question',
        name: lc(it.q),
        acceptedAnswer: { '@type': 'Answer', text: lc(it.a) },
      })),
    ),
  };

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Частые вопросы' : en ? 'FAQ' : 'Întrebări frecvente' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1 · Hero — editorial split */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span
              className="size-1.5 rounded-full bg-sage"
              aria-hidden="true"
            />
            {ru ? 'Частые вопросы' : en ? 'FAQ' : 'Întrebări frecvente'}
          </p>
          <div className="grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[16ch] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.03] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    Частые <span className="serif-it text-sage">вопросы</span>
                  </>
                ) : en ? (
                  <>
                    Frequently <span className="serif-it text-sage">asked</span>
                  </>
                ) : (
                  <>
                    Întrebări{' '}
                    <span className="serif-it text-sage">frecvente</span>
                  </>
                )}
              </h1>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {ru
                  ? 'Ответы на самые частые вопросы о консультациях, записи, оплате и услугах.'
                  : en
                    ? 'Answers to the most common questions about consultations, booking, payment, and services.'
                    : 'Răspunsuri la cele mai des întâlnite întrebări despre consultații, programare, plată și servicii.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Category nav (sticky) + 3 · accordions */}
      {CATEGORIES.length === 0 ? (
        // Nothing written yet. Say so and point at the two places a question
        // can actually be asked, rather than showing a shelf of copy the
        // client never approved.
        <section className="shell py-20 md:py-28">
          <h2 className="serif max-w-[20ch] text-[clamp(1.7rem,3vw,2.4rem)] leading-tight tracking-[-0.02em] text-balance">
            {ru
              ? 'Вопросы и ответы готовятся'
              : en
                ? 'The questions and answers are being prepared'
                : 'Întrebările și răspunsurile sunt în pregătire'}
          </h2>
          <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {ru
              ? 'Пока раздел пуст — напишите нам, и мы ответим лично.'
              : en
                ? 'This section is still empty. Write to us and we will answer personally.'
                : 'Deocamdată secțiunea este goală. Scrie-ne și îți răspundem personal.'}
          </p>
          <Link href="/contact" className={`${btnDark} mt-8`}>
            {ru ? 'Контакт' : en ? 'Contact' : 'Contact'}
          </Link>
        </section>
      ) : (
        <section className="shell grid gap-12 py-16 md:grid-cols-[240px_1fr] md:gap-16 md:py-24 lg:gap-24">
          <nav
            aria-label={
              ru
                ? 'Категории вопросов'
                : en
                  ? 'FAQ categories'
                  : 'Categorii de întrebări'
            }
            className="min-w-0 md:sticky md:top-[133px] md:self-start"
          >
            <p className="eyebrow mb-4">
              {ru ? 'Категории' : en ? 'Categories' : 'Categorii'}
            </p>
            <ul className="-mx-1 flex gap-2 overflow-x-auto pb-1 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
              {CATEGORIES.map((c) => (
                <li key={c.key} className="shrink-0 md:shrink">
                  <a
                    href={`#${c.key}`}
                    className="mono inline-block whitespace-nowrap rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:rounded-none md:border-0 md:border-l md:px-3 md:py-1.5 md:text-[12px] md:normal-case md:tracking-normal"
                  >
                    {lc(c.title)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            {CATEGORIES.map((c) => (
              <section
                key={c.key}
                id={c.key}
                className="scroll-mt-28 border-t border-[var(--rule)] pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-14"
              >
                <h2 className="serif text-[clamp(1.7rem,3vw,2.4rem)] leading-tight tracking-[-0.02em] text-balance">
                  {lc(c.title)}
                </h2>
                <div className="mt-6">
                  {c.items.map((it, i) => (
                    <Reveal
                      key={it.q.en}
                      as="details"
                      className="group border-t border-[var(--rule)] last:border-b"
                      delay={i * 50}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage [&::-webkit-details-marker]:hidden">
                        <span className="serif text-[clamp(1.15rem,1.8vw,1.45rem)] leading-snug text-ink text-pretty">
                          {lc(it.q)}
                        </span>
                        <span
                          className="mono shrink-0 text-2xl text-sage transition-transform duration-300 group-open:rotate-45"
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </summary>
                      <p className="max-w-[68ch] pb-6 text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
                        {lc(it.a)}
                      </p>
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      )}

      {/* 4 · Still have a question? */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-[1fr_1fr] md:gap-16 md:py-20">
          <div>
            <p className="eyebrow mb-3">
              {ru
                ? 'Не нашли ответ?'
                : en
                  ? 'Still stuck?'
                  : 'Nu ai găsit răspunsul?'}
            </p>
            <h2 className="serif text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.05] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Спросите нас{' '}
                  <span className="serif-it text-sage">напрямую</span>
                </>
              ) : en ? (
                <>
                  Ask us <span className="serif-it text-sage">directly</span>
                </>
              ) : (
                <>
                  Întreabă-ne <span className="serif-it text-sage">direct</span>
                </>
              )}
            </h2>
          </div>
          <ul className="grid gap-4 self-center">
            <li className="border-t border-[var(--rule)] pt-4">
              <Link
                href="/contact"
                className="group flex items-baseline justify-between gap-4"
              >
                <span className="text-[1.05rem] leading-snug text-ink text-pretty">
                  {ru
                    ? 'Общий вопрос'
                    : en
                      ? 'A general question'
                      : 'O întrebare generală'}
                </span>
                <span className="shrink-0 text-[13px] font-medium uppercase tracking-[0.06em] text-sage-text">
                  {ru ? 'Контакт' : en ? 'Contact' : 'Contact'}{' '}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
            <li className="border-t border-[var(--rule)] pt-4">
              <Link
                href="/quick-question"
                className="group flex items-baseline justify-between gap-4"
              >
                <span className="text-[1.05rem] leading-snug text-ink text-pretty">
                  {ru
                    ? 'Медицинский вопрос'
                    : en
                      ? 'A medical question'
                      : 'O întrebare medicală'}
                </span>
                <span className="shrink-0 text-[13px] font-medium uppercase tracking-[0.06em] text-sage-text">
                  {ru
                    ? `Спросить врача · ${sla}`
                    : en
                      ? `Ask the doctor · ${sla}`
                      : `Întreabă medicul · ${sla}`}{' '}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* 5 · CTA — see services (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Готовы{' '}
                    <span className="serif-it text-[var(--sage-soft)]">
                      начать?
                    </span>
                  </>
                ) : en ? (
                  <>
                    Ready to{' '}
                    <span className="serif-it text-[var(--sage-soft)]">
                      start?
                    </span>
                  </>
                ) : (
                  <>
                    Gata să{' '}
                    <span className="serif-it text-[var(--sage-soft)]">
                      începi?
                    </span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/services" className={creamPill}>
                  {ru
                    ? 'Посмотреть услуги'
                    : en
                      ? 'See the services'
                      : 'Vezi serviciile'}
                </Link>
                <Link href="/quick-question" className={creamUnderline}>
                  {ru
                    ? `Или задайте экспресс-вопрос · ${sla} →`
                    : en
                      ? `Or ask an express question · ${sla} →`
                      : `Sau o întrebare EXPRESS · ${sla} →`}
                </Link>
              </div>
            </div>
            <p className="max-w-[28ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {ru
                ? 'Пять услуг в двух форматах — выберите подходящий.'
                : en
                  ? 'Five services in two formats — pick the one that fits.'
                  : 'Cinci servicii în două formate — alege-l pe cel potrivit.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
