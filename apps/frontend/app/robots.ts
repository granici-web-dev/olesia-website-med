import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { siteUrl } from '@/lib/site-url';

/**
 * Two things must never be indexed, for different reasons.
 *
 * `/incarcare/<token>` is a patient's upload link. The token *is* the
 * credential — the page already sends `noindex` and `no-referrer` so it cannot
 * leak through a Referer header, and this is the second lock: a crawler that
 * somehow learns a token must not put it in a public index.
 *
 * `/payment/*` is where the bank returns a payer. The URL carries an order
 * reference and the page renders what somebody just bought, which is one
 * person's receipt and nobody else's business; the two pages send `noindex`
 * themselves as well. The prefix was listed here before the pages existed, so
 * they were excluded on the day they landed rather than on the day somebody
 * noticed an order id in a search result.
 *
 * `/checkout/*` is a step inside somebody's purchase rather than a page to
 * arrive at from a search result, and it is `force-dynamic`, so a crawler
 * walking every product and every material would put a request to the API
 * behind each one for nothing. It sends `noindex` of its own as well.
 *
 * Both prefixes are written once per locale as well as bare, because every
 * route on this site carries a locale prefix: the middleware redirects
 * `/incarcare/abc` to `/ro/incarcare/abc`, so the bare rule this file used to
 * carry alone matched no URL a crawler would ever be handed (audit A7, F1/F20).
 *
 * No `host` line. It is a Yandex-only extension that every other crawler
 * ignores, and its only effect here was to publish whatever `siteUrl()`
 * happened to resolve to as the canonical origin of the site.
 */
const PRIVATE_PREFIXES = ['/incarcare/', '/payment/', '/checkout/'] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        ...PRIVATE_PREFIXES,
        ...routing.locales.flatMap((locale) =>
          PRIVATE_PREFIXES.map((prefix) => `/${locale}${prefix}`),
        ),
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
