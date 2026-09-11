import type { MetadataRoute } from 'next';
import { ApiUnavailableError, api } from '@/lib/api';
import { routing } from '@/i18n/routing';
import { siteUrl } from '@/lib/site-url';

/**
 * Every public path, once per locale, with the other two declared as
 * `alternates.languages` so a crawler treats them as one page in three
 * languages rather than three competing pages.
 *
 * Deliberately absent: `/incarcare/<token>` (the token is a credential), the
 * `/payment/*` return pages (one person's receipt, carrying their order
 * reference) and `/quick-question/checkout`, which is a step inside somebody's
 * purchase rather than a page to arrive at. `robots.ts` disallows the first
 * two; all three send `noindex` of their own.
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
      // `x-default` is what a crawler serves a reader whose language is none
      // of the three, and without it the Romanian entry and the other two look
      // like three competing pages rather than one page in three languages
      // (audit A7, F21).
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])),
        'x-default': `${base}/${routing.defaultLocale}${path}`,
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A sitemap that fails takes the whole route with it, and this one is
  // prerendered — so an unreachable API would fail the *build*, not just a
  // request. An incomplete sitemap is a far smaller problem than a deploy that
  // cannot happen while the API restarts, so the posts are best-effort. This is
  // the one place that catches `ApiUnavailableError` instead of letting it
  // reach `error.tsx`: there is no page here to show it on.
  let published: Awaited<ReturnType<typeof api.posts>> = [];
  try {
    published = (await api.posts()).filter((p) => p.publishedAt);
  } catch (e) {
    if (!(e instanceof ApiUnavailableError)) throw e;
  }

  return [
    ...STATIC_PATHS.map((p) => entry(p)),
    ...published.map((p) =>
      entry(`/articles/${p.slug}`, new Date(p.publishedAt as string)),
    ),
  ];
}
