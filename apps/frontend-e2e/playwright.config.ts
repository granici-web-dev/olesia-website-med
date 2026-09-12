import { defineConfig, devices } from '@playwright/test';

/**
 * One end-to-end path, run by hand. See TESTING.md, "The end-to-end path".
 *
 * There is no `webServer` block on purpose. This suite needs four things a
 * Playwright config cannot start for itself — a Postgres with the seed in it,
 * an API holding the maib sandbox keys, a production build of the site, and a
 * reachable third party (the bank). Starting one of the four and leaving the
 * rest to fail produces a timeout instead of a sentence, so `global-setup.ts`
 * checks all of them first and says which one is missing.
 *
 * Never in CI. It talks to maib's sandbox over the network and writes a real
 * row to a real database; the three unit suites are what every push runs.
 */
const SITE_URL = process.env.E2E_SITE_URL ?? 'http://localhost:3100';

export default defineConfig({
  testDir: './src',
  globalSetup: './src/global-setup.ts',

  // The bank is a third party on the far side of two redirects and a
  // 3-D-Secure handler. Its hosted page has taken 20 s to paint the card form.
  timeout: 5 * 60 * 1000,
  expect: { timeout: 30 * 1000 },

  // One purchase at a time, and no retries: a retry would open a second
  // checkout against the sandbox and charge a second test card, which makes
  // the failure harder to read rather than easier.
  workers: 1,
  retries: 0,
  fullyParallel: false,

  // A trace and a video, always — the interesting half of this test happens on
  // somebody else's page, and "it failed at the bank" is not a bug report.
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../test-output/e2e', open: 'never' }],
  ],
  outputDir: '../../test-output/e2e-artifacts',
  use: {
    baseURL: SITE_URL,
    trace: 'on',
    video: 'on',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
});
