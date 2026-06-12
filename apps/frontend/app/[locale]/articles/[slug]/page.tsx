import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, loc } from '../../../../lib/api';
import { renderMarkdown } from '../../../../lib/markdown';

export const revalidate = 60;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await api.post(slug);
  if (!post) notFound();

  const date = post.publishedAt
    ? new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ro-RO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(post.publishedAt))
    : '';

  return (
    <main className="bg-cream text-ink">
      <article className="mx-auto max-w-[760px] px-[var(--gutter)] py-20 md:py-28">
        <Link
          href={`/${locale}/articles`}
          className="mono text-xs text-ink-soft underline-offset-4 hover:text-sage-deep hover:underline"
        >
          ← {loc(locale, 'Toate articolele', 'All articles')}
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {post.categories.map((c) => (
            <span key={c.id} className="eyebrow !text-sage-deep">
              {loc(locale, c.nameRo, c.nameEn)}
            </span>
          ))}
          {date ? <span className="mono text-xs text-ink-soft">{date}</span> : null}
        </div>

        <h1 className="serif mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.08] tracking-[-0.02em] text-balance">
          {loc(locale, post.titleRo, post.titleEn)}
        </h1>

        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt=""
            className="mt-10 aspect-[16/9] w-full rounded-2xl object-cover"
          />
        ) : null}

        <div className="mt-10 text-[1.08rem]">
          {renderMarkdown(loc(locale, post.contentRo, post.contentEn))}
        </div>
      </article>
    </main>
  );
}
