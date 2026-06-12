import { API_BASE_URL } from '@/api/config';

/** Normalized API error thrown by the HTTP client on non-2xx responses. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

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
type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

/** Subscribe to "session lost" (refresh failed). Returns an unsubscribe fn. */
export function onUnauthorized(fn: Listener): () => void {
  unauthorizedListeners.add(fn);
  return () => unauthorizedListeners.delete(fn);
}

function emitUnauthorized() {
  unauthorizedListeners.forEach((fn) => fn());
}

/* --------------------------- refresh flow ---------------------------- */
let refreshInFlight: Promise<boolean> | null = null;

/** Single-flight refresh: concurrent 401s share one refresh request. */
function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = (await res.json()) as { accessToken: string };
        accessToken = data.accessToken;
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/* ----------------------------- request ------------------------------- */
export interface RequestOptions {
  body?: unknown;
  signal?: AbortSignal;
  /** Skip the Authorization header (e.g. login/refresh). Default false. */
  noAuth?: boolean;
  /** Return the raw text body instead of parsed JSON. */
  raw?: boolean;
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const isForm = opts.body instanceof FormData;

  const exec = (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (opts.body !== undefined && !isForm) {
      headers['Content-Type'] = 'application/json';
    }
    if (!opts.noAuth && accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      signal: opts.signal,
      body:
        opts.body === undefined
          ? undefined
          : isForm
            ? (opts.body as FormData)
            : JSON.stringify(opts.body),
    });
  };

  let res = await exec();

  // Transparent refresh-and-retry on a single 401.
  if (res.status === 401 && !opts.noAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await exec();
    } else {
      tokenStore.set(null);
      emitUnauthorized();
    }
  }

  if (!res.ok) {
    let message = res.statusText || `HTTP ${res.status}`;
    let details: unknown;
    try {
      const data = await res.json();
      details = data;
      if (data?.message) {
        message = Array.isArray(data.message)
          ? data.message.join(', ')
          : String(data.message);
      }
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, message, details);
  }

  if (res.status === 204) return undefined as T;
  if (opts.raw) return (await res.text()) as unknown as T;
  return (await res.json()) as T;
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
};

export { refreshAccessToken };
