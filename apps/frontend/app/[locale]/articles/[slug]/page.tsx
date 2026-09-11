import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { api, loc } from '../../../../lib/api';
import { renderMarkdown } from '../../../../lib/markdown';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { pageMetadata } from '@/lib/page-metadata';
import { articleJsonLd } from '@/lib/structured-data';

export const revalidate = 60;

/**
 * An article names itself. The post is fetched twice — here and in the page —
 * and served once: both calls hit the same URL through the same 60-second data
 * cache.
 *
 * A slug that does not exist gets the site's own 404 rather than a page titled
 * `undefined`; `notFound()` in the component does the rest.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await api.post(slug);
  if (!post) return {};

  const title = loc(locale, post.titleRo, post.titleEn, post.titleRu);
  const excerpt = loc(
    locale,
    post.excerptRo ?? '',
    post.excerptEn,
    post.excerptRu,
  ).trim();

  return pageMetadata({
    locale,
    path: `/articles/${post.slug}`,
    title: `${title} | Dr. Olesea Jalba`,
    description: excerpt,
    type: 'article',
    ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const en = locale === 'en';
  const ru = locale === 'ru';

  const post = await api.post(slug);
  if (!post) notFound();

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
      <JsonLd data={articleJsonLd(locale, post)} />
      <article className="mx-auto max-w-[760px] px-[var(--gutter)] py-14 md:py-20">
        <Breadcrumbs
          className="mb-10 md:mb-12"
          items={[
            { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
            {
              label: ru ? 'Статьи' : en ? 'Articles' : 'Articole',
              href: '/articles',
            },
            { label: title },
          ]}
        />

        <div className="flex flex-wrap items-center gap-3">
          {post.categories.map((c) => (
            <span key={c.id} className="eyebrow !text-sage-deep">
              {loc(locale, c.nameRo, c.nameEn, c.nameRu)}
            </span>
          ))}
          {date ? (
            <span className="mono text-xs text-ink-soft">{date}</span>
          ) : null}
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
          {renderMarkdown(
            loc(locale, post.contentRo, post.contentEn, post.contentRu),
          )}
        </div>
      </article>
    </main>
  );
}
