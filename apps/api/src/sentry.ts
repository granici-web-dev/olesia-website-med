import * as Sentry from '@sentry/nestjs';
import { scrubSentryEvent } from '@olesia/shared';

/**
 * Error tracking, off unless `SENTRY_DSN` is set.
 *
 * Until this existed nothing reported a failure: a patient whose upload of an
 * analysis threw a 500 saw an error page, and the practice found out when the
 * patient telephoned, if they telephoned (audit A11, H3). The console is a
 * rotated container log nobody reads.
 *
 * This has to run before Nest loads, which is why `main.ts` calls it between
 * its imports rather than inside `bootstrap()`: the SDK patches http, express
 * and pg as they are required, and a module already in memory is a module it
 * cannot see.
 *
 * With no DSN the SDK is never initialised, so there is no client, no
 * transport and not one request to sentry.io — which is the state this runs in
 * until the account exists.
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE,
    // Errors only. Performance tracing on a practice this size would cost the
    // free tier's quota to tell us what nobody is asking.
    tracesSampleRate: 0,
    // The two switches that decide whether a report is a bug description or a
    // copy of a medical record.
    sendDefaultPii: false,
    beforeSend: (event) => scrubSentryEvent(event),
  });
}
