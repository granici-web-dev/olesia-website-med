import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN, sentryOptions } from './sentry.shared';

/**
 * The server half. `register()` runs once per runtime when the server starts,
 * and `onRequestError` is what Next hands a server-side exception to — without
 * it a page that throws is a 500 in a Vercel log nobody is watching (audit
 * A11, H3).
 */
export function register(): void {
  if (SENTRY_DSN) Sentry.init(sentryOptions);
}

export const onRequestError = Sentry.captureRequestError;
