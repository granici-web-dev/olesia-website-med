import { API_BASE_URL } from '@/api/config';

/** Normalized API error thrown by the HTTP client on non-2xx responses. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
    /**
     * Seconds until the caller may try again, off the `Retry-After` header.
     *
     * Only a 429 carries one, and only the throttler sets it: the per-account
     * 2FA lock reports its wait in the body instead. The panel needs both, so
     * `session-rules` reads whichever is there.
     */
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * `Retry-After` as whole seconds, or undefined when there is nothing to read.
 *
 * RFC 9110 allows either a delay in seconds or an HTTP date, and Nest's
 * throttler sends the first — a proxy in front of it may rewrite it as the
 * second, so both are parsed here rather than after the first outage that
 * turns a countdown into `NaN`.
 */
function retryAfterSeconds(res: Response): number | undefined {
  const header = res.headers.get('Retry-After');
  if (!header) return undefined;
  const seconds = Number(header.trim());
  if (Number.isFinite(seconds)) return seconds > 0 ? Math.ceil(seconds) : 0;
  const at = Date.parse(header);
  if (Number.isNaN(at)) return undefined;
  return Math.max(0, Math.ceil((at - Date.now()) / 1000));
}

/**
 * The status on an `ApiError` that never reached the API: the request failed or
 * timed out. It is not an HTTP status, and callers that branch on 404 or 409
 * must not read it as one.
 */
export const NETWORK_ERROR_STATUS = 0;

/**
 * How long a request may hang before it is given up on.
 *
 * `fetch` has no timeout of its own, so a request that left while the API was
 * going down never settles: the spinner on the screen is permanent and the
 * doctor has no way to tell a slow save from a lost one. Twenty seconds is well
 * past anything this API does — the slowest read is a list of a few hundred
 * rows — and short enough that a stuck request is reported inside one attention
 * span.
 *
 * Uploads and downloads are exempt: a medical document is megabytes over
 * whatever connection the surgery has, and aborting that at twenty seconds
 * would break the feature rather than harden it.
 */
export const REQUEST_TIMEOUT_MS = 20_000;

/* --------------------------- access token ---------------------------- *
 * The short-lived access token is held in memory only (never localStorage);
 * the refresh token lives in an httpOnly cookie the browser sends with
 * `credentials: 'include'`. See module_calendly.md §4.
 * -------------------------------------------------------------------- */
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
};

/* ----------------------- forced-logout signal ------------------------ */

/**
 * Why the session ended, as far as the panel can tell the user. `expired` is
 * the ordinary case; `refresh_reused` is the API reporting that the refresh
 * token was replayed, which ends every session of the account and is worth
 * saying out loud rather than showing as another blank login form.
 */
export type SessionEndReason = 'expired' | 'refresh_reused';

type Listener = (reason: SessionEndReason) => void;
const unauthorizedListeners = new Set<Listener>();

/** Subscribe to "session lost" (refresh failed). Returns an unsubscribe fn. */
export function onUnauthorized(fn: Listener): () => void {
  unauthorizedListeners.add(fn);
  return () => unauthorizedListeners.delete(fn);
}

function emitUnauthorized(reason: SessionEndReason) {
  unauthorizedListeners.forEach((fn) => fn(reason));
}

/* --------------------------- refresh flow ---------------------------- */

export type RefreshOutcome =
  { ok: true } | { ok: false; reason: SessionEndReason };

/**
 * One refresh at a time across every tab of the panel.
 *
 * Refresh tokens rotate, so two requests carrying the same cookie cannot both
 * win, and the loser used to be read as a replay — which revoked every session
 * of the account. Within a tab `refreshInFlight` settles it; between tabs this
 * lock does, because the cookie the second tab sends is the one the first tab
 * has already been handed by then. The API keeps a short grace window behind
 * both of these for the browsers that have neither.
 */
const REFRESH_LOCK = 'olesia-refresh';

let refreshInFlight: Promise<RefreshOutcome> | null = null;

async function postRefresh(): Promise<RefreshOutcome> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, reason: 'expired' };
  }

  if (!res.ok) {
    const body = await readBody(res);
    return { ok: false, reason: sessionEndReason(body) };
  }

  const data = (await readBody(res)) as { accessToken?: string } | undefined;
  if (!data?.accessToken) return { ok: false, reason: 'expired' };
  accessToken = data.accessToken;
  return { ok: true };
}

async function refreshUnderLock(): Promise<RefreshOutcome> {
  // `navigator.locks` is absent in an insecure context, where one tab at a
  // time is all we get; the API's grace window covers the rest.
  if (!navigator.locks) return postRefresh();
  return await navigator.locks.request(REFRESH_LOCK, postRefresh);
}

/** Single-flight refresh: concurrent 401s share one refresh request. */
function refreshAccessToken(): Promise<RefreshOutcome> {
  const pending = refreshInFlight;
  if (pending) return pending;

  const started = refreshUnderLock().finally(() => {
    refreshInFlight = null;
  });
  refreshInFlight = started;
  return started;
}

/** What the API said about a refused refresh, as a reason we can show. */
function sessionEndReason(body: unknown): SessionEndReason {
  const message =
    typeof body === 'object' && body !== null
      ? (body as { message?: unknown }).message
      : body;
  return String(message) === 'refresh_reused' ? 'refresh_reused' : 'expired';
}

/* ----------------------------- request ------------------------------- */
export interface RequestOptions {
  body?: unknown;
  signal?: AbortSignal;
  /** Skip the Authorization header (e.g. login/refresh). Default false. */
  noAuth?: boolean;
  /** Return the response body as a Blob instead of parsed JSON. */
  blob?: boolean;
}

/**
 * The body, whatever the response chose to send.
 *
 * `res.json()` throws on an empty body, and a 200 with nothing in it is a
 * perfectly ordinary answer from a route that has nothing to say. `2fa/disable`
 * was one: the second factor came off on the server and the panel showed
 * "Cod invalid", because the parse error and a rejected code arrived at the
 * caller as the same thrown thing.
 */
async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** The caller's signal, with a deadline on it unless the payload is a file. */
function signalFor(
  opts: RequestOptions,
  isForm: boolean,
): AbortSignal | undefined {
  if (isForm || opts.blob) return opts.signal;
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  if (!opts.signal) return timeout;
  return AbortSignal.any([opts.signal, timeout]);
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const isForm = opts.body instanceof FormData;

  const exec = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (opts.body !== undefined && !isForm) {
      headers['Content-Type'] = 'application/json';
    }
    if (!opts.noAuth && accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        credentials: 'include',
        signal: signalFor(opts, isForm),
        body:
          opts.body === undefined
            ? undefined
            : isForm
              ? (opts.body as FormData)
              : JSON.stringify(opts.body),
      });
    } catch (cause) {
      // A query the caller cancelled is not a failure to report.
      if (opts.signal?.aborted) throw cause;
      throw new ApiError(NETWORK_ERROR_STATUS, 'network_error', cause);
    }
  };

  let res = await exec();

  // Transparent refresh-and-retry on a single 401.
  if (res.status === 401 && !opts.noAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed.ok) {
      res = await exec();
    } else {
      tokenStore.set(null);
      emitUnauthorized(refreshed.reason);
    }
  }

  if (!res.ok) {
    const details = await readBody(res);
    let message = res.statusText || `HTTP ${res.status}`;
    const reported =
      typeof details === 'object' && details !== null
        ? (details as { message?: unknown }).message
        : undefined;
    if (reported) {
      message = Array.isArray(reported)
        ? reported.join(', ')
        : String(reported);
    }
    throw new ApiError(res.status, message, details, retryAfterSeconds(res));
  }

  if (opts.blob) return (await res.blob()) as unknown as T;
  return (await readBody(res)) as T;
}

/**
 * Save a file the API will only hand to an authenticated caller.
 *
 * Medical documents and plan attachments have no public URL, so the browser
 * cannot be pointed at one: the bytes are fetched with the access token and
 * handed over as a blob. Going through `request` is what makes an expired token
 * refresh and retry here as it does everywhere else, instead of the download
 * failing once and silently.
 */
async function download(path: string, fileName: string): Promise<void> {
  const blob = await request<Blob>('GET', path, { blob: true });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Typed HTTP verbs over the NestJS API. */
export const http = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),
  del: <T>(path: string, opts?: RequestOptions) =>
    request<T>('DELETE', path, opts),
  download,
};

export { refreshAccessToken };
