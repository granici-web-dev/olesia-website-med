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

/** Google's own suggestion, and what an unreadable RECAPTCHA_MIN_SCORE becomes. */
export const DEFAULT_MIN_SCORE = 0.5;

/**
 * Read RECAPTCHA_MIN_SCORE, or say why it could not be.
 *
 * `Number('abc')` is `NaN`, and every comparison against `NaN` is false — so a
 * typo in this variable did not tighten the filter or loosen it, it switched
 * the score check off entirely and let every bot through silently (audit A5,
 * F19). `Number('')` is 0, which is the same thing spelled differently. Both
 * now fall back to the default and say so; `main.ts` refuses to start on one
 * in production, where "silently off" is the expensive answer.
 */
export function readMinScore(raw: string | undefined): {
  score: number;
  problem: string | null;
} {
  if (raw === undefined) return { score: DEFAULT_MIN_SCORE, problem: null };

  const complaint = {
    score: DEFAULT_MIN_SCORE,
    problem: `RECAPTCHA_MIN_SCORE is "${raw}", which is not a number between 0 and 1. Using ${DEFAULT_MIN_SCORE}. Remove the variable to accept the default deliberately.`,
  };

  // Blank is its own trap and the quietest one: `Number('')` is 0, a threshold
  // no score can fall below, so `RECAPTCHA_MIN_SCORE=` reads as "accept
  // everything" while looking like "not configured".
  if (raw.trim() === '') return complaint;

  const score = Number(raw);
  if (!Number.isFinite(score) || score < 0 || score > 1) return complaint;

  return { score, problem: null };
}

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly secret = process.env.RECAPTCHA_SECRET ?? '';
  private readonly minScore: number;

  constructor() {
    // Read once, at construction, rather than on every request: the complaint
    // about a bad value belongs in the startup log, where somebody reads it.
    const { score, problem } = readMinScore(process.env.RECAPTCHA_MIN_SCORE);
    if (problem) this.logger.error(problem);
    this.minScore = score;
  }

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
      const res = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ secret: this.secret, response: token }),
          signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
        },
      );
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
        this.logger.warn(
          `captcha action mismatch: expected ${action}, got ${claimed || '(none)'}`,
        );
        return false;
      }

      // A success with no score is v2, a proxy, or something we do not
      // understand — not a clean pass. It used to default to 1.
      const score = data.score ?? 0;
      if (score < this.minScore) {
        this.logger.warn(
          `captcha score ${score} < ${this.minScore} (action=${action})`,
        );
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
