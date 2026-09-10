import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';

/**
 * Two things must never be indexed, for different reasons.
 *
 * `/incarcare/<token>` is a patient's upload link. The token *is* the
 * credential — the page already sends `noindex` and `no-referrer` so it cannot
 * leak through a Referer header, and this is the second lock: a crawler that
 * somehow learns a token must not put it in a public index.
 *
 * `/payment/*` does not exist yet (`PLAN.md` step 9), and is listed now so the
 * return pages are excluded the day they land rather than the day someone
 * notices an order id in a search result.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/incarcare/', '/payment/'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
