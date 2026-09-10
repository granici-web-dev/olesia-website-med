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
 * Security headers (client answers v2 §10, "protecție împotriva atacurilor").
 * Deliberately no Content-Security-Policy yet: the site embeds YouTube and
 * Facebook players, loads reCAPTCHA, and will load GTM/GA4/Pixel once the IDs
 * arrive — a CSP written before those are settled would either be so loose it
 * proves nothing or would break a page in production. Worth adding once the
 * analytics stack is final; noted in docs/brief-changes-2026-06-24.md.
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
};

export default withNextIntl(nextConfig);
