/**
 * What the HTTP client makes of answers that are not a JSON body with a 200 on
 * it. Each of these was a real screen: a 2FA switch that reported "Cod invalid"
 * after it had already turned the second factor off, and a stopped API that
 * left spinners running instead of saying anything.
 *
 * `fetch` is stubbed rather than mocked at the module boundary: the behaviour
 * under test is how a Response is read, so the Response has to be real.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, http, NETWORK_ERROR_STATUS } from '@/api/http';

function answers(res: Response | (() => never)) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => (typeof res === 'function' ? res() : res)),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a response with no body', () => {
  it('reads a 204 as nothing', async () => {
    answers(new Response(null, { status: 204 }));
    await expect(http.post('/auth/logout')).resolves.toBeUndefined();
  });

  it('reads an empty 200 as nothing rather than throwing', async () => {
    answers(new Response('', { status: 200 }));
    await expect(http.post('/auth/2fa/disable')).resolves.toBeUndefined();
  });
});

describe('a refused request', () => {
  it('carries the API’s own code, not its status text', async () => {
    answers(
      new Response(JSON.stringify({ message: 'totp_invalid_code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    await expect(http.post('/auth/2fa/disable')).rejects.toMatchObject({
      status: 400,
      message: 'totp_invalid_code',
    });
  });

  it('joins the list of complaints class-validator sends', async () => {
    answers(
      new Response(
        JSON.stringify({ message: ['email must be an email', 'too short'] }),
        {
          status: 400,
        },
      ),
    );
    await expect(http.post('/auth/login', {})).rejects.toMatchObject({
      message: 'email must be an email, too short',
    });
  });

  it('survives an error body that is not JSON at all', async () => {
    answers(new Response('<html>502</html>', { status: 502 }));
    await expect(http.get('/dashboard')).rejects.toMatchObject({
      status: 502,
    });
  });
});

describe('a throttled request', () => {
  /**
   * `Retry-After` is the only place Nest's throttler says how long the wait
   * is, and the login screen counts down on it. RFC 9110 allows a delay or a
   * date; the API sends the first and a proxy in front of it may send the
   * second, which would otherwise reach the countdown as `NaN`.
   */
  const refused = (headers: Record<string, string>) =>
    new Response(JSON.stringify({ message: 'ThrottlerException' }), {
      status: 429,
      headers,
    });

  it('carries the wait as seconds', async () => {
    answers(refused({ 'Retry-After': '60' }));
    await expect(http.post('/auth/login', {})).rejects.toMatchObject({
      status: 429,
      retryAfterSeconds: 60,
    });
  });

  it('turns an HTTP date into seconds from now', async () => {
    const at = new Date(Date.now() + 42_000).toUTCString();
    answers(refused({ 'Retry-After': at }));
    const failure = await http.post('/auth/login', {}).catch((e) => e);
    expect(failure.retryAfterSeconds).toBeGreaterThan(38);
    expect(failure.retryAfterSeconds).toBeLessThanOrEqual(42);
  });

  it('leaves the wait undefined when the header is absent or unreadable', async () => {
    answers(refused({}));
    await expect(http.post('/auth/login', {})).rejects.toMatchObject({
      retryAfterSeconds: undefined,
    });
    answers(refused({ 'Retry-After': 'soon' }));
    await expect(http.post('/auth/login', {})).rejects.toMatchObject({
      retryAfterSeconds: undefined,
    });
  });
});

describe('a request that never arrives', () => {
  it('is an ApiError with no HTTP status, not a raw TypeError', async () => {
    answers(() => {
      throw new TypeError('Failed to fetch');
    });
    const failure = await http.get('/dashboard').catch((e) => e);
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.status).toBe(NETWORK_ERROR_STATUS);
    expect(failure.message).toBe('network_error');
  });
});
