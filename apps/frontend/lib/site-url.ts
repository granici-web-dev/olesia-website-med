/**
 * The site's own public origin, without a trailing slash.
 *
 * `robots.txt`, `sitemap.xml` and every canonical/hreflang link must carry
 * absolute URLs — a relative one is ignored by every crawler — so this is the
 * one place that has to know where the site is deployed. Vercel injects
 * `VERCEL_PROJECT_PRODUCTION_URL` (the production domain, on every deployment
 * including previews), which keeps the sitemap pointing at production instead
 * of at a preview host that will stop resolving in a week.
 *
 * `NEXT_PUBLIC_SITE_URL` overrides it, and is what to set once the real domain
 * is delegated.
 *
 * With neither set, a production build fails here rather than shipping
 * (audit A7, F6). The old fallback was `http://localhost:3000`, which is not a
 * wrong-looking value: it is a `robots.txt` pointing a crawler at its own
 * machine, a sitemap of unreachable URLs, and a canonical tag telling Google
 * the real page is somewhere it cannot fetch. In development the fallback
 * stands, because that is where the site genuinely is.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Set NEXT_PUBLIC_SITE_URL (or deploy on Vercel, which sets VERCEL_PROJECT_PRODUCTION_URL): a production build cannot write robots.txt, sitemap.xml or a canonical URL without knowing the site origin.',
    );
  }

  return 'http://localhost:3000';
}
