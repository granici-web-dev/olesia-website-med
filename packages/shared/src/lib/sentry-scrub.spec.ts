/**
 * The filter that stands between a crash and Sentry.
 *
 * It exists because error tracking arrived on a system where the request body
 * is a child's symptoms and the URL is a patient's upload credential (audit
 * A11, H3). The failure mode is silent by construction: the report goes to a
 * third party, and nobody here ever sees what was in it.
 */
import { scrubSentryEvent, scrubUrl } from './sentry-scrub.js';

describe('scrubUrl', () => {
  it('redacts the token in a patient upload link', () => {
    expect(
      scrubUrl('https://oleseajalba.md/ro/incarcare/9f3a-secret-token'),
    ).toBe('https://oleseajalba.md/ro/incarcare/[redacted]');
  });

  it('keeps what comes after the token, which names the action', () => {
    expect(scrubUrl('/ro/incarcare/9f3a-secret-token/multumim')).toBe(
      '/ro/incarcare/[redacted]/multumim',
    );
  });

  it('redacts a stored file name and a signed download', () => {
    // The file name is the whole authorisation for a public upload, and a
    // grant link is what a buyer was emailed.
    expect(
      scrubUrl('https://api.oleseajalba.md/uploads/2b1c-analize.pdf'),
    ).toBe('https://api.oleseajalba.md/uploads/[redacted]');
    expect(scrubUrl('/api/materials/download/grant-8817')).toBe(
      '/api/materials/download/[redacted]',
    );
  });

  it('drops the query string whole', () => {
    // Nothing here needs it, and it is where an email address ends up when a
    // form submits by GET.
    expect(
      scrubUrl('/ro/checkout/express?email=ana@example.md&amount=350'),
    ).toBe('/ro/checkout/express?[redacted]');
  });

  it('leaves an ordinary path alone', () => {
    expect(scrubUrl('https://oleseajalba.md/ro/servicii/pediatrie')).toBe(
      'https://oleseajalba.md/ro/servicii/pediatrie',
    );
  });
});

describe('scrubSentryEvent', () => {
  it('removes the body, the cookies and the two headers that carry a session', () => {
    const event = scrubSentryEvent({
      request: {
        url: 'https://api.oleseajalba.md/api/leads/quick-question',
        data: {
          childAge: 4,
          symptoms: 'febră de 3 zile',
          email: 'ana@example.md',
        },
        query_string: 'utm_source=fb',
        cookies: 'refresh_token=abc',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer eyJhbGciOi',
          Cookie: 'refresh_token=abc',
          'User-Agent': 'Mozilla/5.0',
        },
      },
    });

    expect(event.request?.data).toBeUndefined();
    expect(event.request?.query_string).toBeUndefined();
    expect(event.request?.cookies).toBeUndefined();
    expect(event.request?.headers).toEqual({
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    });
  });

  it('matches header names whatever their casing', () => {
    // Node lower-cases them, the browser SDK does not.
    const event = scrubSentryEvent({
      request: { headers: { authorization: 'Bearer x', COOKIE: 'a=b' } },
    });

    expect(event.request?.headers).toEqual({});
  });

  it('scrubs the URL it reports the error against', () => {
    const event = scrubSentryEvent({
      request: {
        url: 'https://oleseajalba.md/ru/incarcare/token-9f3a?lang=ru',
      },
    });

    expect(event.request?.url).toBe(
      'https://oleseajalba.md/ru/incarcare/[redacted]?[redacted]',
    );
  });

  it('passes an event with no request through untouched', () => {
    // A client-side exception has no request at all, and dropping it would
    // mean the error never arrives.
    const event = scrubSentryEvent({ extra: { route: '/ro/blog' } });

    expect(event).toEqual({ extra: { route: '/ro/blog' } });
  });
});
