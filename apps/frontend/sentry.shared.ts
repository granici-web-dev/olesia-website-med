import { scrubSentryEvent } from '@olesia/shared';

/**
 * What every Sentry entry point on this site passes to `init`.
 *
 * The DSN is `NEXT_PUBLIC_SENTRY_DSN` on the server as well as in the browser:
 * a DSN is public by design (it only grants the right to send events), and one
 * variable on Vercel is one variable that cannot be set in half the runtimes.
 * Empty means the SDK is never initialised at all — no client, no transport,
 * no request — which is the state this ships in until the account exists.
 */
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? '';

export const sentryOptions = {
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Errors only: performance tracing on a site this size would spend the free
  // tier's quota on answers nobody is looking for.
  tracesSampleRate: 0,
  // The visitor's IP and cookies stay out of the report. The site is read by
  // parents about their children's health, and a crash report is a log that
  // leaves the building.
  sendDefaultPii: false,
  beforeSend: scrubSentryEvent,
};
