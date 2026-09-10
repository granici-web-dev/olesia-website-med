/**
 * The captcha's failure behaviour, which is the part with a real cost.
 *
 * It is fail-open by design: a spam filter must never be the reason a parent
 * cannot send a medical question. Audit A3 (F11) found the design was only
 * half implemented — a thrown error passed through, but a *hanging* Google
 * did not, because Node's `fetch` has no default timeout, so every request to
 * the four public lead routes waited with it.
 */
import { CaptchaService } from './captcha.service';

const REAL_FETCH = global.fetch;

function respond(body: unknown): typeof global.fetch {
  return (async () => ({ json: async () => body })) as unknown as typeof global.fetch;
}

describe('CaptchaService', () => {
  const previousSecret = process.env.RECAPTCHA_SECRET;

  afterEach(() => {
    global.fetch = REAL_FETCH;
    process.env.RECAPTCHA_SECRET = previousSecret;
  });

  function withSecret(): CaptchaService {
    process.env.RECAPTCHA_SECRET = 'test-secret';
    return new CaptchaService();
  }

  it('is a no-op with no secret, so local dev is unaffected', async () => {
    delete process.env.RECAPTCHA_SECRET;
    const service = new CaptchaService();
    expect(service.enabled).toBe(false);
    await expect(service.verify(undefined, 'lead_contact')).resolves.toBe(true);
  });

  it('lets the request through when Google is unreachable', async () => {
    global.fetch = (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof global.fetch;

    await expect(withSecret().verify('token', 'lead_contact')).resolves.toBe(
      true,
    );
  });

  it('lets the request through when Google times out', async () => {
    // What `AbortSignal.timeout` raises once the deadline passes. Before the
    // fix there was no deadline, so this never happened and the request hung.
    global.fetch = (async () => {
      throw Object.assign(new Error('The operation was aborted due to timeout'), {
        name: 'TimeoutError',
      });
    }) as unknown as typeof global.fetch;

    await expect(withSecret().verify('token', 'lead_contact')).resolves.toBe(
      true,
    );
  });

  it('gives up on a request that carries no token at all', async () => {
    await expect(withSecret().verify(undefined, 'lead_contact')).resolves.toBe(
      false,
    );
  });

  it('rejects a token minted for a different form', async () => {
    global.fetch = respond({ success: true, score: 0.9, action: 'lead_contact' });
    await expect(
      withSecret().verify('token', 'lead_quick_question'),
    ).resolves.toBe(false);
  });

  it('rejects a response that names no action', async () => {
    global.fetch = respond({ success: true, score: 0.9 });
    await expect(withSecret().verify('token', 'lead_contact')).resolves.toBe(
      false,
    );
  });

  it('rejects a score below the threshold, and accepts one above', async () => {
    global.fetch = respond({ success: true, score: 0.1, action: 'lead_contact' });
    await expect(withSecret().verify('t', 'lead_contact')).resolves.toBe(false);

    global.fetch = respond({ success: true, score: 0.9, action: 'lead_contact' });
    await expect(withSecret().verify('t', 'lead_contact')).resolves.toBe(true);
  });
});
