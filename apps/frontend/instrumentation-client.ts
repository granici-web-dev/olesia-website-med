import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN, sentryOptions } from './sentry.shared';

/**
 * The browser half of error tracking. Next runs this file before the app
 * hydrates (`instrumentation-client.ts` is a framework convention, not an
 * import anybody makes).
 */
if (SENTRY_DSN) Sentry.init(sentryOptions);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
