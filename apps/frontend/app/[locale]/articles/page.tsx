import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { api, type PostDto } from '@/lib/api';
import {
  BlogList,
  type BlogPostItem,
  type BlogCategory,
} from '@/components/sections/BlogList';
import {
  PLACEHOLDER_POSTS,
  PLACEHOLDER_CATEGORIES as CATEGORIES,
  type Bi,
} from '@/lib/placeholder-posts';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Blog — the site's SEO engine. Top of funnel: organic traffic → trust → soft
   conversion into services. Health content for children is YMYL, so trust
   signals matter (author with credentials, dates, disclaimer — these live on
   the article page). This listing is API-driven (`/blog/published`); when the
   API has no posts yet it falls back to local placeholder posts so the design
   is reviewable. The category filter doubles as SEO clusters. The empty state
   is built in (pass no posts to see it). Bilingual (RO default · EN).
   ⚠ Placeholder posts have no real article pages — their links 404 until real
   posts exist (back office, later).
   ────────────────────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  return {
    title: en
      ? 'Blog — child health & nutrition | Dr. Olesea Jalba'
      : 'Blog — sănătatea și nutriția copilului | Dr. Olesea Jalba',
    description: en
      ? 'Articles on your child’s health and nutrition, written by a pediatrician. Information you can trust.'
      : 'Articole despre sănătatea și alimentația copilului, scrise de un medic pediatru. Informații în care poți avea încredere.',
  };
}

/* Categories + placeholder posts now live in lib/placeholder-posts.ts — the
   single source shared with the article page, so listing links never 404. */

const btnDark =
  'inline-flex cursor-pointer items-center bg-ink px-[22px] py-[14px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';
const underlineLg =
  'inline-block cursor-pointer border-b border-ink pb-1 text-sm text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';
const creamPill =
  'inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-soft)]';
const creamUnderline =
  'inline-block cursor-pointer border-b border-[var(--sage-soft)] pb-0.5 text-sm text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage-soft)]';

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const lc = (b: Bi) => (en ? b.en : b.ro);

  const fmtDate = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat(en ? 'en-US' : 'ro-RO', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(new Date(iso))
      : '';
  const readMin = (content: string) =>
    Math.max(1, Math.round(content.trim().split(/\s+/).filter(Boolean).length / 200));
  const minLabel = (n: number) => `${n} ${en ? 'min read' : 'min de citit'}`;
  const metaLine = (dateIso: string | null, minutes: number) =>
    [fmtDate(dateIso), minLabel(minutes)].filter(Boolean).join(' · ');
  const href = (slug: string) => `/${locale}/articles/${slug}`;

  let live: PostDto[] = [];
  try {
    live = await api.posts();
  } catch {
    live = [];
  }
  // ⚠ Review mode: prefer local placeholders so the full listing design (filter
  // + grid) is visible regardless of how many posts the API has. Flip USE_LIVE
  // to true (or just delete the placeholders) once the blog has real content.
  const USE_LIVE = false;
  const usingLive = USE_LIVE && live.length > 0;

  // Build the listing from live posts, else from placeholders (for review).
  const items: BlogPostItem[] = usingLive
    ? live.map((p) => ({
        slug: p.slug,
        categoryKey: p.categories[0]?.slug ?? 'all',
        categoryLabel: p.categories[0] ? lc({ ro: p.categories[0].nameRo, en: p.categories[0].nameEn }) : '',
        title: lc({ ro: p.titleRo, en: p.titleEn }),
        excerpt: lc({ ro: p.excerptRo ?? '', en: p.excerptEn ?? '' }),
        meta: metaLine(p.publishedAt, readMin(en ? p.contentEn : p.contentRo)),
        coverUrl: p.coverImageUrl,
        href: href(p.slug),
      }))
    : PLACEHOLDER_POSTS.map((p) => ({
        slug: p.slug,
        categoryKey: p.category,
        categoryLabel: lc(CATEGORIES.find((c) => c.key === p.category) ?? { ro: '', en: '' }),
        title: lc(p.title),
        excerpt: lc(p.excerpt),
        meta: metaLine(p.date, p.minutes),
        coverUrl: null,
        href: href(p.slug),
      }));

  // Categories present in the current item set, in CATEGORIES order.
  const presentKeys = new Set(items.map((i) => i.categoryKey));
  const categories: BlogCategory[] = usingLive
    ? Array.from(
        new Map(
          live
            .flatMap((p) => p.categories)
            .map((c) => [c.slug, { key: c.slug, label: lc({ ro: c.nameRo, en: c.nameEn }) }]),
        ).values(),
      )
    : CATEGORIES.filter((c) => presentKeys.has(c.key)).map((c) => ({ key: c.key, label: lc(c) }));

  const featured = items[0];
  const rest = items.slice(1);

  return (
    <main className="bg-cream text-ink">
      {/* 1 · Hero — editorial split: title left, trust note right (E-E-A-T) */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {en ? 'Blog' : 'Blog'}
          </p>
          <div className="grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.8rem,6.5vw,5.8rem)] leading-[1.02] tracking-[-0.015em] text-balance">
                Blog<span className="serif-it text-sage">.</span>
              </h1>
              <p className="mt-7 max-w-[42ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {en
                  ? 'Articles on your child’s health and nutrition, written by a pediatrician.'
                  : 'Articole despre sănătatea și alimentația copilului, scrise de un medic pediatru.'}
              </p>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="max-w-[42ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {en
                  ? 'Information you can trust — reviewed against current pediatric and nutrition guidance, not forum hearsay.'
                  : 'Informații în care poți avea încredere — bazate pe recomandări actuale de pediatrie și nutriție, nu pe zvonuri de pe forumuri.'}
              </p>
              <p className="mono mt-8 border-t border-[var(--rule)] pt-6 text-[11px] uppercase tracking-[0.1em] leading-relaxed text-ink-soft">
                {en
                  ? 'By Dr. Olesea Jalba · Pediatrician · MSc Human Nutrition'
                  : 'De Dr. Olesea Jalba · Medic pediatru · MSc Nutriția Omului'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="shell py-20 md:py-28">
          <BlogList
            posts={[]}
            categories={[]}
            labels={{
              all: en ? 'All' : 'Toate',
              emptyTitle: en ? 'First articles are coming soon' : 'Primele articole vin în curând',
              emptyBody: en
                ? 'We’re working on the first articles. In the meantime, you can ask the doctor your question directly.'
                : 'Lucrăm la primele articole. Între timp, dacă ai o întrebare, o poți adresa direct medicului.',
              emptyCta: en ? 'Ask the doctor' : 'Întreabă medicul',
              emptyCtaHref: `/${locale}/quick-question`,
            }}
          />
        </section>
      ) : (
        <>
          {/* 2 · Featured / latest post */}
          {featured && (
            <section className="shell py-16 md:py-20">
              <p className="eyebrow mb-6">{en ? 'Latest' : 'Cel mai recent'}</p>
              <a
                href={featured.href}
                className="group grid items-stretch gap-8 md:grid-cols-2 md:gap-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
              >
                <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-cream-2 text-sage md:aspect-auto md:min-h-[320px]">
                  {featured.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.coverUrl}
                      alt=""
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" aria-hidden="true" className="transition-transform duration-500 group-hover:scale-110">
                      <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                      <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                  <span className="mono absolute left-5 top-5 rounded-full border border-[var(--rule)] bg-paper/70 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-sage-text">
                    {featured.categoryLabel}
                  </span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                    {featured.meta}
                  </p>
                  <h2 className="serif mt-3 text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.05] tracking-[-0.02em] text-balance transition-colors group-hover:text-[var(--walnut)]">
                    {featured.title}
                  </h2>
                  {featured.excerpt ? (
                    <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
                      {featured.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-7 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.04em] text-ink">
                    {en ? 'Read article' : 'Citește articolul'}
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </a>
            </section>
          )}

          {/* 3 · Categories filter + post grid */}
          {rest.length > 0 && (
          <section className="bg-paper">
            <div className="shell py-20 md:py-28">
              <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
                <h2 className="serif text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.0] tracking-[-0.02em] text-balance">
                  {en ? (
                    <>
                      All <span className="serif-it text-sage">articles</span>
                    </>
                  ) : (
                    <>
                      Toate <span className="serif-it text-sage">articolele</span>
                    </>
                  )}
                </h2>
                <p className="max-w-[320px] text-sm leading-[1.7] text-ink-soft">
                  {en ? 'Filter by category.' : 'Filtrează după categorie.'}
                </p>
              </header>

              <BlogList
                posts={rest}
                categories={categories}
                labels={{
                  all: en ? 'All' : 'Toate',
                  emptyTitle: '',
                  emptyBody: '',
                  emptyCta: '',
                  emptyCtaHref: '',
                }}
              />
            </div>
          </section>
          )}
        </>
      )}

      {/* 4 · Conversion CTA (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {en ? (
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
                  {en ? 'Ask the doctor · 48h' : 'Întreabă medicul · 48h'}
                </Link>
                <Link href="/services" className={creamUnderline}>
                  {en ? 'See the consultations →' : 'Vezi consultațiile →'}
                </Link>
              </div>
            </div>
            <p className="max-w-[30ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {en
                ? 'An article is a starting point. For your child, a consultation goes further.'
                : 'Un articol e un punct de plecare. Pentru copilul tău, o consultație merge mai departe.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
