/**
 * The site's own public origin, without a trailing slash.
 *
 * `robots.txt` and `sitemap.xml` must carry absolute URLs — a relative one is
 * ignored by every crawler — so this is the one place that has to know where
 * the site is deployed. Vercel injects `VERCEL_PROJECT_PRODUCTION_URL` (the
 * production domain, on every deployment including previews), which keeps the
 * sitemap pointing at production instead of at a preview host that will stop
 * resolving in a week.
 *
 * `NEXT_PUBLIC_SITE_URL` overrides it, and is what to set once the real domain
 * is delegated.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;

  return 'http://localhost:3000';
}
