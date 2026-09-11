/**
 * Where the API is, without a trailing slash.
 *
 * Four modules read an API URL and trimmed its trailing slashes with four
 * copies of the same expression (audit A7), and all four silently fell back to
 * `http://localhost:3333/api` — which in production is not a degraded state
 * but a site that reads no content and forms that post to the visitor's own
 * machine. A production build now fails instead, the same way `siteUrl()` does.
 *
 * Two variables, on purpose, and the caller says which one it means. `API_URL`
 * is read on the server and may be a private address; `NEXT_PUBLIC_API_URL` is
 * baked into the browser bundle and has to be publicly reachable. They are the
 * same host in every deployment so far, and nothing here assumes they must be.
 */
export function normalizeApiBase(
  raw: string | undefined,
  /** The environment variable the value came from, so the error names it. */
  variable: string,
): string {
  const trimmed = raw?.trim();
  if (trimmed) return trimmed.replace(/\/+$/, '');

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `Set ${variable}: without it the site falls back to http://localhost:3333/api, which reads no content and posts no form.`,
    );
  }

  return 'http://localhost:3333/api';
}
