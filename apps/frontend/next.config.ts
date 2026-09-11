import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * next-intl resolves this path against `process.cwd()`, and the cwd differs by
 * caller: `pnpm dev` runs from apps/frontend, while Nx evaluates this config
 * from the workspace root when it builds the project graph — where the default
 * `./(src/)i18n/request.ts` does not exist and the whole graph fails. Turbopack
 * rejects absolute paths, so derive a relative one from wherever we are.
 */
const requestConfig = `./${path.relative(
  process.cwd(),
  path.join(fileURLToPath(new URL('.', import.meta.url)), 'i18n/request.ts'),
)}`;

const withNextIntl = createNextIntlPlugin(requestConfig);

/**
 * The origins the API is reached at. Two variables, because the browser and the
 * server do not necessarily use the same one: `API_URL` is what server
 * components fetch and what image `src` values end up pointing at, while
 * `NEXT_PUBLIC_API_URL` is what the forms post to from the visitor's machine.
 */
function apiOrigins(): string[] {
  const raw = [
    process.env.API_URL ?? 'http://localhost:3333/api',
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api',
  ];
  const origins = new Set<string>();
  for (const value of raw) {
    try {
      origins.add(new URL(value).origin);
    } catch {
      // An unparseable value is a misconfiguration the fetch will report far
      // more clearly than a header would.
    }
  }
  return [...origins];
}

/**
 * Content-Security-Policy, in **Report-Only** (audit A7).
 *
 * The header this file used to carry a comment instead of was waiting for the
 * analytics stack to be settled. That was the wrong order: the trackers are
 * already written (`components/analytics/Analytics.tsx`), so the origins are
 * knowable, and a policy that is never written is not safer than one that
 * reports. Report-Only blocks nothing and mails a report to the route below,
 * which is how the list gets corrected before it is enforced.
 *
 * `script-src` keeps `'unsafe-inline'` on purpose. The GTM and Meta Pixel
 * bootstraps are inline scripts by design, next/script writes more, and a
 * nonce means every page becomes dynamic — which is exactly the prerendering
 * this audit just restored. Hashes are the way out, and the decision on them
 * waits for the reports: **run Report-Only for a week on a preview deployment,
 * then decide between hashes and keeping `'unsafe-inline'` with a tighter
 * origin list.**
 *
 * Every origin below is one the code actually contacts:
 * assets.calendly.com / calendly.com (the booking popup and its iframe),
 * www.google.com + www.gstatic.com (reCAPTCHA v3, loaded on first submit),
 * www.googletagmanager.com + www.google-analytics.com (GTM and GA4),
 * connect.facebook.net + www.facebook.com (the Meta Pixel and the video
 * embeds), www.youtube-nocookie.com + i.ytimg.com (the media gallery).
 */
function contentSecurityPolicy(): string {
  const api = apiOrigins();
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      'https://assets.calendly.com',
      'https://www.google.com',
      'https://www.gstatic.com',
      'https://www.googletagmanager.com',
      'https://connect.facebook.net',
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://assets.calendly.com'],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      ...api,
      'https://i.ytimg.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://www.facebook.com',
    ],
    'font-src': ["'self'", 'data:'],
    'media-src': ["'self'", 'blob:', ...api],
    'connect-src': [
      "'self'",
      ...api,
      'https://calendly.com',
      'https://www.google.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://connect.facebook.net',
    ],
    'frame-src': [
      'https://calendly.com',
      'https://www.google.com',
      'https://www.youtube-nocookie.com',
      'https://www.facebook.com',
    ],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
    'report-uri': ['/api/csp-report'],
  };

  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Security headers (client answers v2 §10, "protecție împotriva atacurilor").
 */
const securityHeaders = [
  // No MIME sniffing — an uploaded file must not be executed as something else.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Clickjacking: nothing here is meant to be framed by anyone else.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Third parties get the origin, never the full path a patient was reading.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Nothing on this site needs a camera, a microphone or a location.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // HTTPS only. Vercel serves HTTPS already; this also covers the real domain.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: contentSecurityPolicy(),
  },
];

/**
 * Images uploaded through the back office (media thumbnails, article covers)
 * are served by the API, and `next/image` refuses any host it was not told
 * about. Derive it from the same variable the API client reads, because the
 * origin differs per environment — localhost in dev, the deployed API in prod.
 */
const apiImagePatterns = (() => {
  const raw = process.env.API_URL ?? 'http://localhost:3333/api';
  try {
    const { protocol, hostname, port } = new URL(raw);
    return [
      {
        protocol: protocol.replace(':', '') as 'http' | 'https',
        hostname,
        ...(port ? { port } : {}),
      },
    ];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: apiImagePatterns,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  /**
   * The EXPRESS checkout used to live at `/<locale>/quick-question/checkout`
   * and now lives at `/<locale>/checkout/express`, along with the other two
   * purchases. Permanent, and per locale, because the old path was live: it
   * is what `BookGroupBButton` linked to, what the "try again" link on a
   * failed payment pointed at, and what anybody who bookmarked the page mid
   * purchase still holds.
   */
  async redirects() {
    return [
      {
        source: '/:locale(ro|en|ru)/quick-question/checkout',
        destination: '/:locale/checkout/express',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
