import { type ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';

/**
 * The second `@Catch` filter in the API, and it earns its place the same way
 * the first one does: there is no other point at which this can be observed.
 * Nest catches everything a handler throws, so an endpoint that fails with a
 * 500 never becomes an uncaught error, and an SDK that only watches the
 * process would report nothing (audit A11, H3).
 *
 * It changes no response. `super.catch` is Nest's own behaviour, byte for
 * byte; the only thing added is the report.
 *
 * Written here rather than using `SentryGlobalFilter` from
 * `@sentry/nestjs/setup`, which is the documented setup and does not work in
 * this workspace: pnpm resolves a second copy of `@nestjs/core` for
 * `@sentry/nestjs`, so that filter extends a `BaseExceptionFilter` whose
 * `HttpAdapterHost` token is not the one our DI container holds. The injected
 * property stays undefined (it is `@Optional()`), and every 500 becomes
 * `Cannot read properties of undefined (reading 'isHeadersSent')` — the real
 * error replaced by an error in the reporter. Extending the class we import
 * ourselves is what keeps both on the same instance.
 */
@Catch()
export class SentryReportingFilter extends BaseExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost): void {
    if (worthReporting(exception)) Sentry.captureException(exception);
    super.catch(exception, host);
  }
}

/**
 * A 4xx is the API doing its job — a bad payload, a missing row, an expired
 * token — and forwarding those would spend the free tier's quota on the
 * request log. What is worth waking up for is a server fault, and anything
 * thrown that was not meant as an HTTP answer at all.
 */
function worthReporting(exception: unknown): boolean {
  return !(exception instanceof HttpException) || exception.getStatus() >= 500;
}
