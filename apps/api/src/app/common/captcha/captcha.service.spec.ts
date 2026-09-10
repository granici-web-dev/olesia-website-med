/**
 * The captcha's failure behaviour, which is the part with a real cost.
 *
 * It is fail-open by design: a spam filter must never be the reason a parent
 * cannot send a medical question. Audit A3 (F11) found the design was only
 * half implemented — a thrown error passed through, but a *hanging* Google
 * did not, because Node's `fetch` has no default timeout, so every request to
 * the four public lead routes waited with it.
 */
import { CaptchaService, DEFAULT_MIN_SCORE, readMinScore } from './captcha.service';

const REAL_FETCH = global.fetch;

function respond(body: unknown): typeof global.fetch {
  return (async () => ({ json: async () => body })) as unknown as typeof global.fetch;
}

/**
 * The threshold, which is the other half of "fail-open" and the half that was
 * wrong. `Number('abc')` is `NaN` and every comparison against `NaN` is false,
 * so a typo in RECAPTCHA_MIN_SCORE did not tighten or loosen the filter — it
 * switched the score check off and let every bot through (audit A5, F19).
 */
describe('readMinScore', () => {
  it('uses Google\'s default when the variable is unset', () => {
    expect(readMinScore(undefined)).toEqual({
      score: DEFAULT_MIN_SCORE,
      problem: null,
    });
  });

  it('takes a score the operator really wrote', () => {
    expect(readMinScore('0.7')).toEqual({ score: 0.7, problem: null });
    expect(readMinScore('0')).toEqual({ score: 0, problem: null });
    expect(readMinScore('1')).toEqual({ score: 1, problem: null });
  });

  it('falls back and complains about anything that is not a score', () => {
    // '' is the one that hid best: `Number('')` is 0, so the filter silently
    // accepted everything rather than obviously misbehaving.
    for (const raw of ['abc', '', ' ', 'NaN', '-0.1', '1.5', '0,7']) {
      const { score, problem } = readMinScore(raw);
      expect(score).toBe(DEFAULT_MIN_SCORE);
      expect(problem).toContain('RECAPTCHA_MIN_SCORE');
    }
  });
});

describe('CaptchaService', () => {
  const previousSecret = process.env.RECAPTCHA_SECRET;
  const previousMinScore = process.env.RECAPTCHA_MIN_SCORE;

  afterEach(() => {
    global.fetch = REAL_FETCH;
    process.env.RECAPTCHA_SECRET = previousSecret;
    if (previousMinScore === undefined) delete process.env.RECAPTCHA_MIN_SCORE;
    else process.env.RECAPTCHA_MIN_SCORE = previousMinScore;
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

  it('honours a threshold the operator raised', async () => {
    process.env.RECAPTCHA_MIN_SCORE = '0.7';
    global.fetch = respond({ success: true, score: 0.6, action: 'lead_contact' });
    await expect(withSecret().verify('t', 'lead_contact')).resolves.toBe(false);
  });

  it('keeps filtering when the threshold is a typo', async () => {
    process.env.RECAPTCHA_MIN_SCORE = 'abc';
    global.fetch = respond({ success: true, score: 0.1, action: 'lead_contact' });
    await expect(withSecret().verify('t', 'lead_contact')).resolves.toBe(false);
  });

  it('treats a success carrying no score as a failure, not a pass', async () => {
    global.fetch = respond({ success: true, action: 'lead_contact' });
    await expect(withSecret().verify('t', 'lead_contact')).resolves.toBe(false);
  });
});
