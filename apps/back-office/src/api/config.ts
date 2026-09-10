/** Runtime API configuration, read from Vite env. */

/** API base URL, without a trailing slash. Defaults to a same-origin `/api`. */
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(
  /\/+$/,
  '',
);

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
