import Link from 'next/link';
import { api, loc, type PostDto } from '../../../lib/api';

export const revalidate = 60;

function fmtDate(locale: string, iso: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await api.posts();

  const t = {
    eyebrow: loc(locale, 'Articole', 'Articles'),
    title: loc(locale, 'Jurnal', 'Journal'),
    intro: loc(
      locale,
      'Articole despre nutriție, somn și dezvoltarea armonioasă a copilului.',
      'Articles on nutrition, sleep and the harmonious development of the child.',
    ),
    empty: loc(locale, 'Niciun articol publicat încă.', 'No published articles yet.'),
    read: loc(locale, 'Citește', 'Read'),
  };

  const excerpt = (p: PostDto) => loc(locale, p.excerptRo, p.excerptEn);

  return (
    <main className="bg-cream text-ink">
      <section className="shell py-20 md:py-28">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="serif mt-4 text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.04] tracking-[-0.02em] text-balance">
          {t.title}
        </h1>
        <p className="mt-6 max-w-[48ch] text-[1.05rem] leading-relaxed text-ink-soft text-pretty">
          {t.intro}
        </p>

        {posts.length === 0 ? (
          <p className="mt-16 text-ink-soft">{t.empty}</p>
        ) : (
          <ul className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/${locale}/articles/${p.slug}`} className="group block">
                  <div className="overflow-hidden rounded-2xl bg-cream-2">
                    {p.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.coverImageUrl}
                        alt=""
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="aspect-[16/10] w-full bg-[var(--cream-2)]" />
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {p.categories.slice(0, 2).map((c) => (
                      <span key={c.id} className="eyebrow !text-sage-deep">
                        {loc(locale, c.nameRo, c.nameEn)}
                      </span>
                    ))}
                    <span className="mono text-xs text-ink-soft">
                      {fmtDate(locale, p.publishedAt)}
                    </span>
                  </div>
                  <h2 className="serif mt-2 text-[1.6rem] leading-snug text-balance transition-colors group-hover:text-[var(--walnut)]">
                    {loc(locale, p.titleRo, p.titleEn)}
                  </h2>
                  {excerpt(p) ? (
                    <p className="mt-2 max-w-[44ch] text-ink-soft text-pretty">
                      {excerpt(p)}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
