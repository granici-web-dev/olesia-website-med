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
  const ru = locale === 'ru';

  // Prefer the live API post; fall back to a placeholder article so a link from
  // the (placeholder-driven) listing always opens a real page instead of 404ing.
  const apiPost = await api.post(slug);
  const ph = apiPost ? null : findPlaceholderPost(slug);
  if (!apiPost && !ph) notFound();

  const post = apiPost ?? {
    titleRo: ph!.title.ro,
    titleEn: ph!.title.en,
    titleRu: ph!.title.ru,
    contentRo: ph!.body.ro,
    contentEn: ph!.body.en,
    contentRu: ph!.body.ru,
    publishedAt: ph!.date,
    coverImageUrl: null as string | null,
    categories: [
      {
        id: ph!.category,
        nameRo: placeholderCategoryLabel(ph!.category, 'ro'),
        nameEn: placeholderCategoryLabel(ph!.category, 'en'),
        nameRu: placeholderCategoryLabel(ph!.category, 'ru'),
      },
    ],
  };

  const title = loc(locale, post.titleRo, post.titleEn, post.titleRu);
  const date = post.publishedAt
    ? new Intl.DateTimeFormat(ru ? 'ru-RU' : en ? 'en-US' : 'ro-RO', {
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
            { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
            { label: ru ? 'Статьи' : en ? 'Articles' : 'Articole', href: '/articles' },
            { label: title },
          ]}
        />

        <div className="flex flex-wrap items-center gap-3">
          {post.categories.map((c) => (
            <span key={c.id} className="eyebrow !text-sage-deep">
              {loc(locale, c.nameRo, c.nameEn, c.nameRu)}
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
          {renderMarkdown(loc(locale, post.contentRo, post.contentEn, post.contentRu))}
        </div>
      </article>
    </main>
  );
}
