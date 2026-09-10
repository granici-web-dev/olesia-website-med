import { Injectable, Logger } from '@nestjs/common';

/**
 * Verifies Google reCAPTCHA v3 tokens for the public endpoints
 * (client requirement, answers v2 §10: "protecție anti-spam — Google reCAPTCHA").
 *
 * Env:
 *   RECAPTCHA_SECRET      — server-side secret. **Unset ⇒ verification is
 *                           skipped entirely**, so local dev and every
 *                           environment without the client's keys keeps working.
 *   RECAPTCHA_MIN_SCORE   — v3 score below which a request is treated as a bot
 *                           (default 0.5, Google's own suggestion).
 *
 * Deliberately fail-open on Google being unreachable: a spam filter must never
 * become the reason a parent cannot send a medical question. Bad scores are
 * still rejected — only infrastructure failures pass through, and they are
 * logged.
 *
 * "Unreachable" includes slow. Node's `fetch` has no default timeout, so a
 * hanging siteverify used to hold every request to all four public lead
 * routes open indefinitely — fail-open in intent, hang in practice
 * (audit A3, F11).
 */
const VERIFY_TIMEOUT_MS = 3_000;

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly secret = process.env.RECAPTCHA_SECRET ?? '';
  private readonly minScore = Number(process.env.RECAPTCHA_MIN_SCORE ?? '0.5');

  /** True when the client's keys are configured and tokens must be checked. */
  get enabled(): boolean {
    return Boolean(this.secret);
  }

  /**
   * @returns true when the request may proceed.
   */
  async verify(token: string | undefined, action: string): Promise<boolean> {
    if (!this.enabled) return true;
    if (!token) return false;

    try {
      const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: this.secret, response: token }),
        signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      });
      const data = (await res.json()) as {
        success?: boolean;
        score?: number;
        action?: string;
        'error-codes'?: string[];
      };

      if (!data.success) {
        // Never log the token itself — it is request-scoped but still a credential.
        this.logger.warn(
          `captcha rejected (action=${action}): ${(data['error-codes'] ?? []).join(',')}`,
        );
        return false;
      }

      // A token minted for another form must not be replayed here. A response
      // with no action at all is treated as a mismatch rather than waved
      // through: v3 always returns one, so its absence is not a normal case.
      const claimed = data.action ?? '';
      if (claimed !== action) {
        this.logger.warn(`captcha action mismatch: expected ${action}, got ${claimed || '(none)'}`);
        return false;
      }

      const score = data.score ?? 1;
      if (score < this.minScore) {
        this.logger.warn(`captcha score ${score} < ${this.minScore} (action=${action})`);
        return false;
      }

      return true;
    } catch (err) {
      this.logger.error(
        `captcha verification unavailable, letting the request through: ${String(err)}`,
      );
      return true;
    }
  }
}
