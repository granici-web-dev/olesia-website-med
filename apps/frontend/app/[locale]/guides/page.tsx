import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { pageMetadata } from '@/lib/page-metadata';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import { MaterialLibrary } from '@/components/sections/MaterialLibrary';
import { AGE_GROUPS } from '@/lib/age-taxonomy';
import { api } from '@/lib/api';
import { formatSla } from '@/lib/working-hours';
import { btnDark, underlineLg, creamPill, creamUnderline, cardCta } from '@/components/ui/cta';
import { biFor, type Bi } from '@/lib/i18n-types';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Biblioteca Digitală (brief §6a) — the downloads storefront. Nine categories,
   free + paid materials, search, child-age + category filters, and an
   email-gate before free downloads. Content comes from the back-office
   `materials` module; the interactive shelf is the client `MaterialLibrary`.
   Route kept as /guides (linked from the footer) to avoid nav churn.
   Trilingual (RO default · EN · RU).
   The gate stores the address through the `newsletter` module and then hands
   the file over on the spot — nothing is mailed. A paid material is bought at
   `/checkout/material/<slug>` and its file is released by a download grant, so
   nothing is mailed there either. A material without a file shows "în curând"
   rather than selling or asking for an address it cannot pay back.
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
    path: '/guides',
    title: ru
      ? 'Цифровая библиотека — гайды и материалы | Dr. Olesea Jalba'
      : en
      ? 'Digital library — guides & materials | Dr. Olesea Jalba'
      : 'Biblioteca digitală — ghiduri și materiale | Dr. Olesea Jalba',
    description: ru
      ? 'Материалы о здоровье и питании ребёнка от педиатра: бесплатные и платные, с поиском и фильтром по возрасту и теме.'
      : en
      ? 'Materials on child health and nutrition by a pediatrician: free and paid, with search and filters by age and topic.'
      : 'Materiale despre sănătatea și nutriția copilului, scrise de un medic pediatru: gratuite și cu plată, cu căutare și filtre după vârstă și temă.',
  });
}


export default async function LibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = biFor(locale);

  /** RU falls back to RO, an empty string counting as missing — as everywhere. */
  const tri = (ro: string, enText: string, ruText: string | null) =>
    ru ? (ruText?.trim() ? ruText : ro) : en ? enText : ro;

  const [materials, categories, hours] = await Promise.all([
    api.materials(),
    api.materialCategories(),
    api.workingHours(),
  ]);
  const sla = formatSla(locale, hours.expressSlaMinutes);

  const catLabel = (slug: string) => {
    const c = categories.find((x) => x.slug === slug);
    return c ? tri(c.nameRo, c.nameEn, c.nameRu) : slug;
  };
  // The hero highlights one material; with an empty library there is none, and
  // the block below is skipped rather than rendering a card full of blanks.
  const featured =
    materials.find((m) => m.flags.includes('recommended')) ?? materials[0];

  const HOW = [
    {
      title: { ro: 'Alege un material', en: 'Pick a material', ru: 'Выберите материал' },
      text: { ro: 'Caută și filtrează după vârstă și categorie.', en: 'Search and filter by age and category.', ru: 'Ищите и фильтруйте по возрасту и категории.' },
    },
    {
      title: { ro: 'Descarcă sau cumpără', en: 'Download or buy', ru: 'Скачайте или купите' },
      text: { ro: 'Materialele gratuite cer doar emailul; cele cu plată se achită cu cardul și se descarcă imediat.', en: 'Free materials only ask for your email; paid ones are paid for by card and download straight away.', ru: 'Для бесплатных нужен только email; платные оплачиваются картой и скачиваются сразу.' },
    },
    {
      title: { ro: 'Citește în ritmul tău', en: 'Read at your pace', ru: 'Читайте в своём ритме' },
      text: { ro: 'Salvează materialul și revino oricând ai nevoie.', en: 'Save the material and come back whenever you need it.', ru: 'Сохраните материал и возвращайтесь, когда понадобится.' },
    },
  ];

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Библиотека' : en ? 'Library' : 'Bibliotecă' },
        ]}
      />
      {/* 1 · Hero — editorial split: statement left, featured material right */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Цифровая библиотека' : en ? 'Digital library' : 'Biblioteca digitală'}
          </p>
          <div className="grid items-end gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.03] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    Цифровая <span className="serif-it text-sage">библиотека</span>
                  </>
                ) : en ? (
                  <>
                    The digital <span className="serif-it text-sage">library</span>
                  </>
                ) : (
                  <>
                    Biblioteca <span className="serif-it text-sage">digitală</span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[44ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {ru
                  ? 'Материалы о здоровье и питании ребёнка, написанные педиатром — бесплатные и платные. Ищите и фильтруйте по возрасту и теме.'
                  : en
                  ? 'Materials on your child’s health and nutrition, written by a pediatrician — free and paid. Search and filter by age and topic.'
                  : 'Materiale despre sănătatea și alimentația copilului, scrise de un medic pediatru — gratuite și cu plată. Caută și filtrează după vârstă și temă.'}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a href="#library" className={btnDark}>
                  {ru ? 'Открыть библиотеку' : en ? 'Browse the library' : 'Vezi biblioteca'}
                </a>
                <span className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-sage-text">
                  {ru ? 'Бесплатно и платно · PDF' : en ? 'Free & paid · PDF' : 'Gratuit & cu plată · PDF'}
                </span>
              </div>
            </div>

            {/* Featured material — skipped entirely when the library is empty,
               which is what an unreachable API looks like. Dereferencing an
               absent `featured` crashed the whole page. */}
            {featured && (
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="eyebrow mb-5">{ru ? 'Рекомендуем' : en ? 'Featured' : 'Recomandat'}</p>
              <article className="flex flex-col border border-[var(--rule)] bg-paper">
                <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-cream-2 text-sage">
                  <span className="mono absolute left-4 top-4 rounded-full border border-[var(--rule)] bg-paper/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-sage-text">
                    {catLabel(featured.categorySlug)}
                  </span>
                  <span
                    className={`mono absolute right-4 top-4 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                      featured.access === 'free' ? 'bg-sage/15 text-sage-text' : 'bg-ink text-cream'
                    }`}
                  >
                    {featured.access === 'free'
                      ? ru ? 'Бесплатно' : en ? 'Free' : 'Gratuit'
                      : `${featured.price ?? 0} €`}
                  </span>
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden="true">
                    <path d="M6 3.5h7L18 8v12.5H6V3.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M13 3.5V8h5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M12 11v5m0 0 2-2m-2 2-2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="p-6">
                  <h2 className="serif text-[1.5rem] leading-snug tracking-[-0.01em] text-pretty">
                    {tri(featured.titleRo, featured.titleEn, featured.titleRu)}
                  </h2>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
                    {tri(
                      featured.descriptionRo,
                      featured.descriptionEn,
                      featured.descriptionRu,
                    )}
                  </p>
                  <p className="mono mt-4 text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                    {['PDF',
                      featured.pageCount !== null
                        ? `${featured.pageCount} ${ru ? 'стр.' : en ? 'pp.' : 'pag.'}`
                        : null,
                      featured.fileLang,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <a
                    href="#library"
                    className={`mt-6 ${cardCta}`}
                  >
                    {ru ? 'Открыть в библиотеке' : en ? 'Open in the library' : 'Vezi în bibliotecă'}
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* 2 · Library — search + category & age filters + grid */}
      <section id="library" className="scroll-mt-24 shell py-20 md:py-28">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Библиотека' : en ? 'Library' : 'Bibliotecă'}</p>
            <h2 className="serif text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.0] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Найдите <span className="serif-it text-sage">материал</span>
                </>
              ) : en ? (
                <>
                  Find a <span className="serif-it text-sage">material</span>
                </>
              ) : (
                <>
                  Găsește un <span className="serif-it text-sage">material</span>
                </>
              )}
            </h2>
          </div>
          <p className="max-w-[340px] text-sm leading-[1.7] text-ink-soft">
            {ru
              ? 'Ищите по названию, фильтруйте по категории и возрасту. Оставьте адрес и скачайте материал. Можно также подписаться на новости.'
              : en
              ? 'Search by title, filter by category and age. Leave your address and download the material. You can also subscribe to updates.'
              : 'Caută după titlu, filtrează după categorie și vârstă. Lasă-ți adresa și descarcă materialul. Te poți abona și la noutăți.'}
          </p>
        </header>

        <MaterialLibrary
          locale={(ru ? 'ru' : en ? 'en' : 'ro') as 'ro' | 'en' | 'ru'}
          materials={materials}
          categories={categories}
          ages={AGE_GROUPS}
        />
      </section>

      {/* 3 · How it works (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
            {ru ? 'Как это работает' : en ? 'How it works' : 'Cum funcționează'}
          </p>
          <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
            {ru ? (
              <>
                В пару <span className="serif-it text-[var(--sage-soft)]">кликов</span>
              </>
            ) : en ? (
              <>
                In a few <span className="serif-it text-[var(--sage-soft)]">taps</span>
              </>
            ) : (
              <>
                În câțiva <span className="serif-it text-[var(--sage-soft)]">pași</span>
              </>
            )}
          </h2>

          <div className="relative mt-14 grid gap-x-8 gap-y-12 md:mt-16 md:grid-cols-3">
            <span
              className="pointer-events-none absolute inset-x-0 top-8 hidden h-px bg-[rgba(245,241,234,0.2)] md:block"
              aria-hidden="true"
            />
            {HOW.map((step, i) => (
              <div key={step.title.en} className="relative">
                <span
                  aria-hidden="true"
                  className="relative z-10 mb-7 grid size-16 place-items-center rounded-full border-[5px] border-[var(--sage-deep)] bg-sage text-cream"
                >
                  <span className="serif block translate-y-[0.05em] text-[1.6rem] italic leading-none lining-nums tabular-nums">
                    {i + 1}
                  </span>
                </span>
                <h3 className="serif text-[1.5rem] leading-snug text-cream">{lc(step.title)}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/80 text-pretty">
                  {lc(step.text)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · Author + disclaimer */}
      <section className="shell grid gap-12 border-b border-[var(--rule)] py-20 md:grid-cols-2 md:gap-20 md:py-24">
        <div>
          <p className="eyebrow mb-3">{ru ? 'Кто их пишет' : en ? 'Who writes them' : 'Cine le scrie'}</p>
          <h2 className="serif text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.05] tracking-[-0.02em] text-balance">
            {ru ? (
              <>
                Написаны <span className="serif-it text-sage">педиатром</span>
              </>
            ) : en ? (
              <>
                Written by a <span className="serif-it text-sage">pediatrician</span>
              </>
            ) : (
              <>
                Scrise de un medic <span className="serif-it text-sage">pediatru</span>
              </>
            )}
          </h2>
          <p className="mt-5 max-w-[48ch] leading-relaxed text-ink-soft text-pretty">
            {ru
              ? 'Материалы пишет Dr. Olesea Jalba — педиатр со степенью магистра нутрициологии.'
              : en
              ? 'The materials are written by Dr. Olesea Jalba, a pediatrician with a Master’s in Human Nutrition.'
              : 'Materialele sunt realizate de Dr. Olesea Jalba, medic pediatru cu master în nutriție umană.'}
          </p>
          <Link href="/about" className={`mt-7 ${underlineLg}`}>
            {ru ? 'О враче' : en ? 'About the doctor' : 'Despre medic'} →
          </Link>
        </div>

        <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
          <p className="eyebrow mb-3">{ru ? 'Важно знать' : en ? 'Good to know' : 'De reținut'}</p>
          <p className="max-w-[52ch] leading-relaxed text-ink-soft text-pretty">
            {ru
              ? 'Материалы дают общую информацию и не заменяют медицинскую консультацию. Если нужно разобраться в ситуации вашего ребёнка — запишитесь на приём.'
              : en
              ? 'The materials are for information only and don’t replace a medical consultation. For your child’s specific situation, book a consultation.'
              : 'Materialele au scop informativ și nu înlocuiesc o consultație medicală. Pentru situația specifică a copilului tău, programează o consultație.'}
          </p>
        </div>
      </section>

      {/* 5 · Conversion CTA (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Нужен личный <span className="serif-it text-[var(--sage-soft)]">совет?</span>
                  </>
                ) : en ? (
                  <>
                    Need personal <span className="serif-it text-[var(--sage-soft)]">advice?</span>
                  </>
                ) : (
                  <>
                    Ai nevoie de un sfat <span className="serif-it text-[var(--sage-soft)]">personalizat?</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/quick-question" className={creamPill}>
                  {ru
                    ? `Спросить врача · ${sla}`
                    : en
                      ? `Ask the doctor · ${sla}`
                      : `Întreabă medicul · ${sla}`}
                </Link>
                <Link href="/services" className={creamUnderline}>
                  {ru ? 'Смотреть консультации →' : en ? 'See the consultations →' : 'Vezi consultațiile →'}
                </Link>
              </div>
            </div>

            <p className="max-w-[30ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {ru
                ? 'Материал — это отправная точка. А с ситуацией вашего ребёнка поможет разобраться консультация.'
                : en
                ? 'A material is a starting point. For your child’s situation, a consultation goes further.'
                : 'Un material e un punct de plecare. Pentru situația copilului tău, o consultație merge mai departe.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
