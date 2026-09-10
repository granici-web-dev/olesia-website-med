import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { routing } from '@/i18n/routing';
import { siteUrl } from '@/lib/site-url';

/**
 * Every public path, once per locale, with the other two declared as
 * `alternates.languages` so a crawler treats them as one page in three
 * languages rather than three competing pages.
 *
 * Deliberately absent: `/incarcare/<token>` (the token is a credential) and the
 * `/payment/*` return pages that `PLAN.md` step 9 will add. `robots.ts`
 * disallows both.
 */
const STATIC_PATHS = [
  '',
  '/about',
  '/services',
  '/pediatrics',
  '/nutrition',
  '/integrative',
  '/monitoring',
  '/quick-question',
  '/pricing',
  '/guides',
  '/articles',
  '/media',
  '/faq',
  '/contact',
  '/terms',
  '/gdpr',
] as const;

/**
 * Rough editorial priority. The home page and the things a visitor is looking
 * for when they arrive rank above the legal pages, which have to be listed but
 * are nobody's entry point.
 */
function priorityFor(path: string): number {
  if (path === '') return 1;
  if (path === '/terms' || path === '/gdpr') return 0.3;
  if (path.startsWith('/articles/')) return 0.6;
  return 0.8;
}

const { locales } = routing;

function entry(path: string, lastModified?: Date): MetadataRoute.Sitemap[number] {
  const base = siteUrl();
  return {
    url: `${base}/${routing.defaultLocale}${path}`,
    lastModified,
    priority: priorityFor(path),
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${base}/${l}${path}`]),
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A sitemap that fails to build takes the whole route with it, and the API is
  // the one part of this that can be down. An incomplete sitemap is a far
  // smaller problem than a 500 where crawlers expect XML, so posts are
  // best-effort — `api.posts()` already swallows its own errors and returns [].
  const posts = await api.posts();

  const published = posts.filter((p) => p.publishedAt);

  return [
    ...STATIC_PATHS.map((p) => entry(p)),
    ...published.map((p) =>
      entry(`/articles/${p.slug}`, new Date(p.publishedAt as string)),
    ),
  ];
}
