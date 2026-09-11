/**
 * What must not leave this system inside an error report.
 *
 * Sentry's defaults are built for products whose worst-case payload is an
 * email address. Here the request bodies carry a child's symptoms, the URLs
 * carry the single-use token that *is* a patient's credential for their upload
 * link, and the headers carry a session. `PRINCIPLES.md` says PII stays out of
 * logs and URLs; a crash report is a log that leaves the building.
 *
 * One implementation for three SDKs (`@sentry/nestjs`, `@sentry/nextjs`,
 * `@sentry/react`), which is why it is typed structurally rather than against
 * any of their `Event` types: all three pass the same shape through
 * `beforeSend`, and this file has no dependency on any of them.
 */

export type ScrubbableRequest = {
  url?: string;
  data?: unknown;
  query_string?: unknown;
  headers?: Record<string, string>;
  cookies?: unknown;
};

export type ScrubbableEvent = {
  request?: ScrubbableRequest;
  extra?: Record<string, unknown>;
};

/**
 * Paths whose next segment is a credential rather than an identifier. The
 * upload link is the one that matters most: `/incarcare/<token>` is what a
 * patient is emailed, and anyone holding it can read and add documents.
 */
const SECRET_AFTER = ['/incarcare/', '/uploads/', '/download/'];

const HEADERS_TO_DROP = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];

/**
 * Replaces the segment after each of the paths above, in a full URL or a bare
 * path, and drops any query string. Exported for the test, and because the
 * route handler for CSP reports scrubs a URL without an event around it.
 */
export function scrubUrl(url: string): string {
  const queryAt = url.indexOf('?');
  let path = queryAt === -1 ? url : url.slice(0, queryAt);

  for (const prefix of SECRET_AFTER) {
    const at = path.indexOf(prefix);
    if (at === -1) continue;
    const rest = path.slice(at + prefix.length);
    const nextSlash = rest.indexOf('/');
    path =
      path.slice(0, at + prefix.length) +
      '[redacted]' +
      (nextSlash === -1 ? '' : rest.slice(nextSlash));
  }

  return queryAt === -1 ? path : `${path}?[redacted]`;
}

/**
 * Mutates and returns the event, which is the contract `beforeSend` expects.
 * Returning `null` is not an option here: an error with its body removed is
 * still the error we need to see.
 */
export function scrubSentryEvent<T extends ScrubbableEvent>(event: T): T {
  const { request } = event;
  if (!request) return event;

  // The request body. Every form on this site posts something a doctor would
  // call confidential, and none of it helps identify a bug.
  delete request.data;
  delete request.query_string;
  delete request.cookies;

  if (request.url) request.url = scrubUrl(request.url);

  if (request.headers) {
    for (const name of Object.keys(request.headers)) {
      if (HEADERS_TO_DROP.includes(name.toLowerCase())) {
        delete request.headers[name];
      }
    }
  }

  return event;
}
