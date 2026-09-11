import * as Sentry from '@sentry/react';
import { scrubSentryEvent } from '@olesia/shared';

/**
 * Error tracking for the panel, off unless `VITE_SENTRY_DSN` is set at build
 * time — a Vite variable is compiled into the bundle, so this one is decided
 * when the image is built, not when the container starts (see
 * docker/Dockerfile.caddy).
 *
 * The panel is where a failure is least likely to be reported by the person
 * who hits it: the doctor sees a screen that will not save and carries on with
 * her day (audit A11, H3). Every screen here shows patient data, which is why
 * the filter is not optional.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: (event) => scrubSentryEvent(event),
  });
}
