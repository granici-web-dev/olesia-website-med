/** Runtime API configuration, read from Vite env. */

/** API base URL, without a trailing slash. Defaults to a same-origin `/api`. */
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(
  /\/+$/,
  '',
);

/**
 * Whether to use the in-memory mock data layer instead of real HTTP.
 * Default ON; flip with `VITE_API_MOCKS=false` when the backend is ready.
 */
export const USE_MOCKS = import.meta.env.VITE_API_MOCKS !== 'false';
