/**
 * Everything the smoke path needs to know about where things are running.
 *
 * Defaults are the local arrangement TESTING.md documents: the site on 3100
 * rather than 3000, because the API's `CORS_ORIGINS` has to name the site's
 * origin and 3000 is the port most often already taken.
 */
export const SITE_URL = process.env.E2E_SITE_URL ?? 'http://localhost:3100';
export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3333/api';

/** The dev seed's administrator (`apps/api/src/seed/seed.ts`). */
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@olesia.md';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'admin12345';

/**
 * maib's sandbox test card — `docs/payments-maib-checkout.md` §6. It is a test
 * card on a test acquirer, which is why it is written down here rather than
 * read from the environment.
 */
export const TEST_CARD = {
  number: '5102180060101124',
  expiry: '06/28',
  cvv: '760',
  holder: 'Test Test',
} as const;
