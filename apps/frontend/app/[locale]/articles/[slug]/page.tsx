import { notFound } from 'next/navigation';
import { api, loc } from '../../../../lib/api';
import { renderMarkdown } from '../../../../lib/markdown';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  findPlaceholderPost,
  placeholderCategoryLabel,
} from '@/lib/placeholder-posts';

export const revalidate = 60;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const en = locale === 'en';

  // Prefer the live API post; fall back to a placeholder article so a link from
  // the (placeholder-driven) listing always opens a real page instead of 404ing.
  const apiPost = await api.post(slug);
  const ph = apiPost ? null : findPlaceholderPost(slug);
  if (!apiPost && !ph) notFound();

  const post = apiPost ?? {
    titleRo: ph!.title.ro,
    titleEn: ph!.title.en,
    contentRo: ph!.body.ro,
    contentEn: ph!.body.en,
    publishedAt: ph!.date,
    coverImageUrl: null as string | null,
    categories: [
      {
        id: ph!.category,
        nameRo: placeholderCategoryLabel(ph!.category, false),
        nameEn: placeholderCategoryLabel(ph!.category, true),
      },
    ],
  };

  const title = loc(locale, post.titleRo, post.titleEn);
  const date = post.publishedAt
    ? new Intl.DateTimeFormat(en ? 'en-US' : 'ro-RO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(post.publishedAt))
    : '';

  return (
    <main className="bg-cream text-ink">
      <article className="mx-auto max-w-[760px] px-[var(--gutter)] py-14 md:py-20">
        <Breadcrumbs
          className="mb-10 md:mb-12"
          items={[
            { label: en ? 'Home' : 'Acasă', href: '/' },
            { label: en ? 'Articles' : 'Articole', href: '/articles' },
            { label: title },
          ]}
        />

        <div className="flex flex-wrap items-center gap-3">
          {post.categories.map((c) => (
            <span key={c.id} className="eyebrow !text-sage-deep">
              {loc(locale, c.nameRo, c.nameEn)}
            </span>
          ))}
          {date ? <span className="mono text-xs text-ink-soft">{date}</span> : null}
        </div>

        <h1 className="serif mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.08] tracking-[-0.02em] text-balance">
          {title}
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
