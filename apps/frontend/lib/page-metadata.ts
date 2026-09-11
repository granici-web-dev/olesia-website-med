import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

/**
 * The head of every page: canonical, the three hreflang links, and what a link
 * preview shows.
 *
 * Before audit A7 the site had titles and descriptions and nothing else: no
 * page declared its own address, so the three language versions of a page
 * competed with each other in the index instead of being read as one page in
 * three languages (F4, F5, F19, F21). Every page calls this; the pages that
 * need a dynamic title build the strings first and pass them in.
 *
 * `x-default` points at Romanian, which is the site's default locale and the
 * language of the country the practice is in — it is what a crawler shows
 * someone whose own language is none of the three.
 *
 * The picture is deliberately not a parameter: one cover carries the doctor's
 * portrait and her name, which is what a shared link should show for any page
 * on a single practitioner's site. It is a plain file under `public/` rather
 * than Next's `app/opengraph-image` convention, because that convention is a
 * *default* — a page that declares its own `openGraph` block, as every page
 * here now does, drops it, and the result is a link preview with no picture.
 */

const OG_IMAGE = {
  url: '/assets/og-cover.png',
  width: 1200,
  height: 630,
  alt: 'Dr. Olesea Jalba — pediatru și nutriționist',
};

/** OG wants a full locale, not a language code. */
const OPEN_GRAPH_LOCALE: Record<string, string> = {
  ro: 'ro_RO',
  en: 'en_US',
  ru: 'ru_RU',
};

const SITE_NAME = 'Dr. Olesea Jalba';

export interface PageMetadataInput {
  locale: string;
  /** The path after the locale prefix: `''` for the home page, `/about`, … */
  path: string;
  title: string;
  description: string;
  type?: 'website' | 'article';
  /** ISO date, articles only. */
  publishedTime?: string;
}

export function pageMetadata({
  locale,
  path,
  title,
  description,
  type = 'website',
  publishedTime,
}: PageMetadataInput): Metadata {
  const languages = Object.fromEntries([
    ...routing.locales.map((l) => [l, `/${l}${path}`]),
    ['x-default', `/${routing.defaultLocale}${path}`],
  ]);

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages,
    },
    openGraph: {
      type,
      url: `/${locale}${path}`,
      title,
      description,
      siteName: SITE_NAME,
      images: [OG_IMAGE],
      locale: OPEN_GRAPH_LOCALE[locale] ?? OPEN_GRAPH_LOCALE.ro,
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OPEN_GRAPH_LOCALE[l]),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
