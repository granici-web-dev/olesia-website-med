/** Runtime API configuration, read from Vite env. */

/** API base URL, without a trailing slash. Defaults to a same-origin `/api`. */
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(
  /\/+$/,
  '',
);

/**
 * The panel and the API have to share an origin. The refresh cookie is
 * `SameSite=Lax`, which is the whole CSRF defence (docs/deployment.md), and the
 * browser will not send it to another site: every request works until the
 * access token expires fifteen minutes in, and then the session ends with no
 * explanation anyone can connect to the URL they typed in `.env.local`. Said
 * here, in development, because production has no console anyone reads.
 */
if (import.meta.env.DEV && /^https?:\/\//i.test(API_BASE_URL)) {
  const target = new URL(API_BASE_URL);
  if (target.origin !== window.location.origin) {
    console.warn(
      `VITE_API_URL points at ${target.origin}, not ${window.location.origin}. ` +
        'The refresh cookie is SameSite=Lax and will not be sent there, so the ' +
        'session will end silently. Use the dev proxy (/api) instead.',
    );
  }
}

/**
 * Whether to use the in-memory mock data layer instead of real HTTP.
 *
 * Off unless asked for, because the failure modes are not symmetric: a build
 * that should have had mocks shows connection errors, while a build that should
 * not have had them shows invented patients, invented payments and a demo admin
 * who is logged in without a password — silently, and indistinguishably from
 * real data. That was the default until 2026-09-10.
 */
export const USE_MOCKS = import.meta.env.VITE_API_MOCKS === 'true';
