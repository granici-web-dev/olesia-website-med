import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

/** Body we send to open a hosted checkout session. */
export interface MaibCheckoutRequest {
  amount: number;
  currency: string;
  language: 'ro' | 'ru' | 'en';
  callbackUrl: string;
  successUrl: string;
  failUrl: string;
  orderInfo: {
    id: string;
    description: string;
    /** ISO 8601. The hosted page prints it next to the order reference. */
    date?: string;
    items?: {
      externalId?: string;
      title: string;
      amount: number;
      currency: string;
      quantity: number;
    }[];
  };
  payerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    ip?: string;
    userAgent?: string;
  };
}

/** The bank's back-channel notification. Field names are maib's, verbatim. */
export interface MaibCallbackBody {
  checkoutId: string;
  terminalId?: string | null;
  amount: number;
  currency: string;
  completedAt?: string | null;
  payerName?: string | null;
  payerEmail?: string | null;
  payerPhone?: string | null;
  payerIp?: string | null;
  orderId?: string | null;
  orderDescription?: string | null;
  paymentId: string;
  paymentAmount: number;
  paymentCurrency: string;
  paymentStatus: string;
  paymentExecutedAt?: string | null;
  senderIban?: string | null;
  senderName?: string | null;
  senderCardNumber?: string | null;
  retrievalReferenceNumber?: string | null;
  processingStatus?: string | null;
  processingStatusCode?: string | null;
  approvalCode?: string | null;
  threeDsResult?: string | null;
  threeDsReason?: string | null;
  paymentMethod?: string | null;
}

/**
 * Checkout detail as returned by `GET /v2/checkouts/{id}`, after
 * `normalizeCheckout` has settled the casing.
 */
export interface MaibCheckout {
  id: string;
  status: string;
  amount: number;
  currency: string;
  expiresAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  order?: { id?: string | null } | null;
  payment?: {
    paymentId?: string;
    status?: string;
    amount?: number;
    currency?: string;
    paymentMethod?: string | null;
    refundedAmount?: number | null;
    approvalCode?: string | null;
    referenceNumber?: string | null;
    terminalId?: string | null;
  } | null;
}

/**
 * The same checkout as it actually arrives: maib's documented schema
 * capitalises the three timestamps and the sandbox sends them lower case, and
 * §18 says production may differ from sandbox in either direction. Everything
 * optional, everything `unknown`-adjacent, because this is what a remote
 * system sent us rather than a shape we control.
 */
export interface RawMaibCheckout
  extends Omit<
    MaibCheckout,
    'completedAt' | 'failedAt' | 'cancelledAt' | 'payment'
  > {
  completedAt?: string | null;
  CompletedAt?: string | null;
  failedAt?: string | null;
  FailedAt?: string | null;
  cancelledAt?: string | null;
  CancelledAt?: string | null;
  payment?:
    | (NonNullable<MaibCheckout['payment']> & { PaymentId?: string })
    | null;
}

/**
 * Settle the casing of the fields maib spells two ways, so nothing downstream
 * has to know the bank has opinions about capital letters.
 *
 * `paidAt` is taken from `completedAt` and the refund path is keyed by
 * `paymentId`, so reading only one spelling means a payment recorded as paid
 * with no date on it, or one that cannot be refunded — against a bank
 * statement that has both. Exported so the pairing can be pinned by a test
 * without a bank.
 *
 * A field with neither spelling stays absent rather than becoming the string
 * "undefined", which is what reading it straight into a template would have
 * produced.
 */
export function normalizeCheckout(raw: RawMaibCheckout): MaibCheckout {
  const {
    CompletedAt,
    FailedAt,
    CancelledAt,
    completedAt,
    failedAt,
    cancelledAt,
    payment,
    ...rest
  } = raw;
  const pick = (upper?: string | null, lower?: string | null) =>
    upper ?? lower ?? undefined;

  const { PaymentId, ...restOfPayment } = payment ?? {};

  return {
    ...rest,
    payment: payment
      ? { ...restOfPayment, paymentId: pick(PaymentId, payment.paymentId) }
      : payment,
    completedAt: pick(CompletedAt, completedAt),
    failedAt: pick(FailedAt, failedAt),
    cancelledAt: pick(CancelledAt, cancelledAt),
  };
}

interface MaibEnvelope<T> {
  result?: T;
  ok?: boolean;
  errors?: { errorCode: string; errorMessage: string }[] | null;
}

/** How long before a token's stated expiry we mint a fresh one. */
const TOKEN_REFRESH_RATIO = 0.8;
/** Callbacks older than this are rejected as replays. */
const SIGNATURE_MAX_AGE_MS = 5 * 60 * 1000;

/**
 * maib e-Commerce Checkout client (docs/payments-maib-checkout.md).
 *
 * Three things in here look odd and are all deliberate — see §11/§14 of that
 * doc for the evidence:
 *  - `ok === true` is the only success test; errors come back as HTTP 200 with
 *    no `ok` field at all.
 *  - `Content-Type` is set only on requests that carry a body: the WAF in front
 *    of the API answers a GET that has one with 403.
 *  - the callback HMAC is over `{rawBody}.{timestamp}` and base64-encoded,
 *    which is the opposite order and a different encoding from our Calendly
 *    webhook. Do not "fix" one to match the other.
 */
@Injectable()
export class MaibService {
  private readonly logger = new Logger(MaibService.name);
  private readonly baseUrl = process.env.MAIB_BASE_URL ?? '';
  private readonly clientId = process.env.MAIB_CLIENT_ID ?? '';
  private readonly clientSecret = process.env.MAIB_CLIENT_SECRET ?? '';
  private readonly signatureKey = process.env.MAIB_SIGNATURE_KEY ?? '';

  private token: string | null = null;
  private tokenExpiresAt = 0;
  /** In-flight mint, so concurrent callers share one round-trip. */
  private minting: Promise<string> | null = null;

  constructor() {
    if (!this.isConfigured()) {
      this.logger.warn(
        'maib not configured — online payment is off (set MAIB_BASE_URL/MAIB_CLIENT_ID/MAIB_CLIENT_SECRET).',
      );
    }
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.clientId && this.clientSecret);
  }

  /* ------------------------------- API ------------------------------- */

  async createCheckout(
    body: MaibCheckoutRequest,
  ): Promise<{ checkoutId: string; checkoutUrl: string }> {
    return this.request('POST', '/v2/checkouts', body);
  }

  async getCheckout(checkoutId: string): Promise<MaibCheckout> {
    return normalizeCheckout(
      await this.request<RawMaibCheckout>('GET', `/v2/checkouts/${checkoutId}`),
    );
  }

  async cancelCheckout(checkoutId: string): Promise<{ status: string }> {
    return this.request('POST', `/v2/checkouts/${checkoutId}/cancel`, {});
  }

  async refund(
    payId: string,
    amount: number,
    reason: string,
  ): Promise<{ refundId: string; status: string }> {
    return this.request('POST', `/v2/payments/${payId}/refund`, {
      amount,
      reason,
    });
  }

  async getRefund(refundId: string): Promise<{
    id: string;
    status: string;
    refundType?: string;
    amount: number;
    currency: string;
    executedAt?: string | null;
  }> {
    return this.request('GET', `/v2/payments/refunds/${refundId}`);
  }

  /* ---------------------------- signature ---------------------------- */

  /**
   * Verify `X-Signature: sha256=<base64>` over `"{rawBody}.{timestamp}"`.
   * Rejects anything older than SIGNATURE_MAX_AGE_MS to block replays.
   */
  verifySignature(
    rawBody: Buffer | undefined,
    signatureHeader: string | undefined,
    timestampHeader: string | undefined,
  ): boolean {
    if (!this.signatureKey) {
      this.logger.error('MAIB_SIGNATURE_KEY is not set — rejecting callback.');
      return false;
    }
    if (!rawBody || !signatureHeader || !timestampHeader) return false;

    const ts = Number(timestampHeader);
    if (!Number.isFinite(ts)) return false;
    if (Math.abs(Date.now() - ts) > SIGNATURE_MAX_AGE_MS) {
      this.logger.warn('Rejected a maib callback outside the replay window.');
      return false;
    }

    const received = signatureHeader.startsWith('sha256=')
      ? signatureHeader.slice('sha256='.length)
      : signatureHeader;

    const expected = createHmac('sha256', this.signatureKey)
      .update(`${rawBody.toString('utf8')}.${timestampHeader}`)
      .digest('base64');

    const a = Buffer.from(expected);
    const b = Buffer.from(received);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  /* ----------------------------- internals ---------------------------- */

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    retryOn401 = true,
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('maib_not_configured');
    }

    const token = await this.accessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    // Only when there is a body: a GET carrying Content-Type gets 403 from the
    // WAF, with a `{"supportID": …}` body that is not an API error at all.
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (res.status === 401 && retryOn401) {
      this.token = null;
      return this.request<T>(method, path, body, false);
    }

    const json = (await res.json().catch(() => null)) as MaibEnvelope<T> | null;

    // `ok === true` is the only success test — see the class comment.
    if (!json || json.ok !== true || json.result === undefined) {
      const err = json?.errors?.[0];
      this.logger.error(
        `maib ${method} ${path} failed: http=${res.status} code=${
          err?.errorCode ?? 'none'
        } message=${err?.errorMessage ?? 'none'}`,
      );
      throw new ServiceUnavailableException(
        err?.errorCode ?? 'maib_request_failed',
      );
    }

    return json.result;
  }

  private async accessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) return this.token;
    this.minting ??= this.mintToken().finally(() => {
      this.minting = null;
    });
    return this.minting;
  }

  private async mintToken(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/v2/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      }),
    });

    const json = (await res.json().catch(() => null)) as MaibEnvelope<{
      accessToken: string;
      expiresIn: number;
    }> | null;

    if (!json || json.ok !== true || !json.result?.accessToken) {
      this.logger.error(`maib auth failed: http=${res.status}`);
      throw new ServiceUnavailableException('maib_auth_failed');
    }

    // The docs example says 300s, sandbox returns 1800 — always read it.
    this.token = json.result.accessToken;
    this.tokenExpiresAt =
      Date.now() + json.result.expiresIn * 1000 * TOKEN_REFRESH_RATIO;
    return this.token;
  }
}
