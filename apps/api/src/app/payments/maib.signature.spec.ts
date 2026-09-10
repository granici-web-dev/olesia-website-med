import { createHmac } from 'node:crypto';

import { MaibService } from './maib.service';

/**
 * The callback signature is the only thing standing between the bank's
 * notification and our ledger, and its layout is deliberately the opposite of
 * the Calendly webhook next door: HMAC-SHA256 over `{rawBody}.{timestamp}`,
 * base64, where Calendly hashes `{timestamp}.{rawBody}` and encodes hex
 * (docs/payments-maib-checkout.md §4). That difference is exactly the kind a
 * later refactor "harmonises", and nobody would notice until callbacks
 * silently stopped verifying. These tests pin it.
 *
 * The body is the real payload shape from the sandbox validation run (§13).
 */
const SIGNATURE_KEY = '4cde378d-43b6-405f-94aa-55c010d4d42a';

const RAW_BODY = JSON.stringify({
  checkoutId: '21e8f276-4ff5-49ff-829b-7faec3d49771',
  terminalId: '0149587',
  amount: 160.0,
  currency: 'MDL',
  completedAt: '2026-09-10T08:42:49.4167142+00:00',
  payerName: 'Test Test',
  payerEmail: 'test@example.md',
  orderId: 'VALIDARE-20260910-1042',
  paymentId: '3a8b125b-165f-4fdb-b97c-51d1fb4d11ac',
  paymentAmount: 160.0,
  paymentCurrency: 'MDL',
  paymentStatus: 'Executed',
  retrievalReferenceNumber: '625308713525',
  approvalCode: '413316',
  threeDsResult: 'Y',
  paymentMethod: 'Card',
});

/** The bank's algorithm, spelled out here so the test does not import the
 *  implementation it is checking. */
function sign(body: string, timestamp: string, key = SIGNATURE_KEY): string {
  return createHmac('sha256', key).update(`${body}.${timestamp}`).digest('base64');
}

function serviceWith(key: string | undefined): MaibService {
  const previous = process.env.MAIB_SIGNATURE_KEY;
  if (key === undefined) delete process.env.MAIB_SIGNATURE_KEY;
  else process.env.MAIB_SIGNATURE_KEY = key;
  const service = new MaibService();
  if (previous === undefined) delete process.env.MAIB_SIGNATURE_KEY;
  else process.env.MAIB_SIGNATURE_KEY = previous;
  return service;
}

describe('MaibService.verifySignature', () => {
  const body = Buffer.from(RAW_BODY, 'utf8');
  let service: MaibService;

  beforeEach(() => {
    service = serviceWith(SIGNATURE_KEY);
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  });

  it('accepts a signature over {rawBody}.{timestamp} in base64', () => {
    const ts = String(Date.now());
    expect(service.verifySignature(body, `sha256=${sign(RAW_BODY, ts)}`, ts)).toBe(
      true,
    );
  });

  it('accepts the signature without the sha256= prefix', () => {
    const ts = String(Date.now());
    expect(service.verifySignature(body, sign(RAW_BODY, ts), ts)).toBe(true);
  });

  it('rejects the Calendly layout, which reverses the order and uses hex', () => {
    const ts = String(Date.now());
    const calendlyStyle = createHmac('sha256', SIGNATURE_KEY)
      .update(`${ts}.${RAW_BODY}`)
      .digest('hex');
    expect(service.verifySignature(body, `sha256=${calendlyStyle}`, ts)).toBe(false);
  });

  it('rejects a signature made with the wrong key', () => {
    const ts = String(Date.now());
    const wrong = sign(RAW_BODY, ts, '00000000-0000-0000-0000-000000000000');
    expect(service.verifySignature(body, `sha256=${wrong}`, ts)).toBe(false);
  });

  it('rejects a valid signature over a body that was tampered with afterwards', () => {
    const ts = String(Date.now());
    const signature = `sha256=${sign(RAW_BODY, ts)}`;
    const tampered = Buffer.from(
      RAW_BODY.replace('"paymentAmount":160', '"paymentAmount":1'),
      'utf8',
    );
    expect(tampered.equals(body)).toBe(false);
    expect(service.verifySignature(tampered, signature, ts)).toBe(false);
  });

  it('rejects a replay from outside the five-minute window', () => {
    const stale = String(Date.now() - 6 * 60 * 1000);
    expect(
      service.verifySignature(body, `sha256=${sign(RAW_BODY, stale)}`, stale),
    ).toBe(false);
  });

  it('accepts a timestamp inside the window', () => {
    const recent = String(Date.now() - 4 * 60 * 1000);
    expect(
      service.verifySignature(body, `sha256=${sign(RAW_BODY, recent)}`, recent),
    ).toBe(true);
  });

  it('rejects a timestamp that is not a number', () => {
    expect(service.verifySignature(body, 'sha256=whatever', 'not-a-timestamp')).toBe(
      false,
    );
  });

  it('rejects everything when no signing key is configured', () => {
    const unconfigured = serviceWith('');
    jest.spyOn(unconfigured['logger'], 'error').mockImplementation(() => undefined);
    const ts = String(Date.now());
    expect(
      unconfigured.verifySignature(body, `sha256=${sign(RAW_BODY, ts)}`, ts),
    ).toBe(false);
  });

  it.each([
    ['missing body', undefined, 'sha256=x', String(Date.now())],
    ['missing signature', Buffer.from('{}'), undefined, String(Date.now())],
    ['missing timestamp', Buffer.from('{}'), 'sha256=x', undefined],
  ])('rejects a callback with a %s', (_name, b, sig, ts) => {
    expect(service.verifySignature(b as Buffer | undefined, sig, ts)).toBe(false);
  });
});
