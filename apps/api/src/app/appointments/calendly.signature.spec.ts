import { createHmac } from 'node:crypto';

import { CalendlyService } from './calendly.service';

/**
 * The webhook signature is the only authentication on a public route that
 * creates medical appointments. Its layout is deliberately the mirror image of
 * the maib callback next door: HMAC-SHA256 over `{timestamp}.{rawBody}`,
 * hex-encoded, where maib hashes `{rawBody}.{timestamp}` and encodes base64
 * (docs/payments-maib-checkout.md §4). A refactor that "harmonises" the two
 * would break bookings silently, so both layouts are pinned, from both sides.
 *
 * The body is the shape Calendly sends for `invitee.created`.
 */
const SIGNING_KEY = 'PsF9CkFLZk0kSvT0nFB-Cvo1sQV0ScrEHOl_-hkOwEg';

const RAW_BODY = JSON.stringify({
  event: 'invitee.created',
  created_at: '2026-09-10T08:12:44.000000Z',
  payload: {
    uri: 'https://api.calendly.com/scheduled_events/EV1/invitees/IN1',
    email: 'parinte@example.md',
    name: 'Maria Ionescu',
    status: 'active',
    scheduled_event: {
      uri: 'https://api.calendly.com/scheduled_events/EV1',
      start_time: '2026-09-12T09:00:00.000000Z',
      end_time: '2026-09-12T09:50:00.000000Z',
      event_type: 'https://api.calendly.com/event_types/ET-PEDIATRIC',
    },
  },
});

/** Calendly's algorithm, spelled out so the test does not import the code it checks. */
function sign(body: string, t: string, key = SIGNING_KEY): string {
  return createHmac('sha256', key).update(`${t}.${body}`).digest('hex');
}

function header(body: string, atSeconds: number, key = SIGNING_KEY): string {
  const t = String(Math.floor(atSeconds));
  return `t=${t},v1=${sign(body, t, key)}`;
}

function serviceWith(key: string | undefined): CalendlyService {
  const previous = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (key === undefined) delete process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  else process.env.CALENDLY_WEBHOOK_SIGNING_KEY = key;
  const service = new CalendlyService();
  if (previous === undefined) delete process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  else process.env.CALENDLY_WEBHOOK_SIGNING_KEY = previous;
  return service;
}

describe('CalendlyService.verifySignature', () => {
  const body = Buffer.from(RAW_BODY, 'utf8');
  const nowSeconds = () => Date.now() / 1000;
  let service: CalendlyService;

  beforeEach(() => {
    service = serviceWith(SIGNING_KEY);
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  });

  it('accepts a signature over {timestamp}.{rawBody} in hex', () => {
    expect(service.verifySignature(body, header(RAW_BODY, nowSeconds()))).toBe(
      true,
    );
  });

  it('accepts a header whose parts carry whitespace', () => {
    const t = String(Math.floor(nowSeconds()));
    expect(
      service.verifySignature(body, `t=${t}, v1=${sign(RAW_BODY, t)}`),
    ).toBe(true);
  });

  it('rejects the maib layout, which reverses the order and uses base64', () => {
    const t = String(Math.floor(nowSeconds()));
    const maibStyle = createHmac('sha256', SIGNING_KEY)
      .update(`${RAW_BODY}.${t}`)
      .digest('base64');
    expect(service.verifySignature(body, `t=${t},v1=${maibStyle}`)).toBe(false);
  });

  it('rejects a signature made with another account’s key', () => {
    const t = String(Math.floor(nowSeconds()));
    const wrong = sign(RAW_BODY, t, 'another-account-signing-key');
    expect(service.verifySignature(body, `t=${t},v1=${wrong}`)).toBe(false);
  });

  it('rejects a valid signature over a body that was tampered with afterwards', () => {
    const signature = header(RAW_BODY, nowSeconds());
    const tampered = Buffer.from(
      RAW_BODY.replace('ET-PEDIATRIC', 'ET-INTEGRATIVE'),
      'utf8',
    );
    expect(tampered.equals(body)).toBe(false);
    expect(service.verifySignature(tampered, signature)).toBe(false);
  });

  it('rejects a v1 of a different length without throwing', () => {
    const t = String(Math.floor(nowSeconds()));
    expect(service.verifySignature(body, `t=${t},v1=abc`)).toBe(false);
  });

  it('rejects a replay from outside the three-minute window', () => {
    const stale = nowSeconds() - 181;
    expect(service.verifySignature(body, header(RAW_BODY, stale))).toBe(false);
  });

  it('accepts a delivery inside the window', () => {
    const recent = nowSeconds() - 120;
    expect(service.verifySignature(body, header(RAW_BODY, recent))).toBe(true);
  });

  it('accepts a clock that runs slightly ahead of ours', () => {
    const ahead = nowSeconds() + 60;
    expect(service.verifySignature(body, header(RAW_BODY, ahead))).toBe(true);
  });

  it('rejects a timestamp that is not a number', () => {
    const t = 'not-a-timestamp';
    expect(
      service.verifySignature(body, `t=${t},v1=${sign(RAW_BODY, t)}`),
    ).toBe(false);
  });

  it('rejects a header with no t part', () => {
    const t = String(Math.floor(nowSeconds()));
    expect(service.verifySignature(body, `v1=${sign(RAW_BODY, t)}`)).toBe(
      false,
    );
  });

  it('rejects a missing header and a missing body', () => {
    expect(service.verifySignature(body, undefined)).toBe(false);
    expect(
      service.verifySignature(undefined, header(RAW_BODY, nowSeconds())),
    ).toBe(false);
  });

  it('rejects everything when no signing key is configured', () => {
    const unconfigured = serviceWith(undefined);
    jest
      .spyOn(unconfigured['logger'], 'error')
      .mockImplementation(() => undefined);
    expect(
      unconfigured.verifySignature(body, header(RAW_BODY, nowSeconds())),
    ).toBe(false);
  });
});
