import { API_URL, SITE_URL } from './env';

/**
 * Refuse to start on a half-built stack, and say which half.
 *
 * Each of these has been the actual reason a run failed, and each of them
 * failed as a 60-second timeout somewhere in the middle of the purchase rather
 * than as a sentence at the start:
 *
 *  - the site not running, or running against a different API;
 *  - `CORS_ORIGINS` not naming the site's origin, so the form's POST is
 *    blocked in the browser and the page just sits there;
 *  - `LEGAL_ENTITY_*` unset, so the checkout route answers 503
 *    `legal_entity_missing` — which is correct behaviour, the practice has no
 *    registered entity yet, and it means this test cannot run without
 *    placeholder values;
 *  - maib unconfigured, so no checkout session is ever opened.
 */
async function get(url: string): Promise<Response> {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch (err) {
    throw new Error(`${url} is not answering (${String(err)}).`);
  }
}

export default async function globalSetup(): Promise<void> {
  const problems: string[] = [];

  const health = await get(`${API_URL.replace(/\/api$/, '')}/health`);
  if (!health.ok) {
    problems.push(`API /health answered ${health.status}.`);
  } else {
    const body = (await health.json()) as { checks?: Record<string, string> };
    if (body.checks?.db !== 'pass') {
      problems.push(`API cannot reach its database (db: ${body.checks?.db}).`);
    }
  }

  // `canSell()` is all three legal-entity fields or none, and the checkout
  // route is the one place that refuses without them.
  const entity = await get(`${API_URL}/contacts/legal-entity`);
  if (entity.ok) {
    const e = (await entity.json()) as { registeredName?: string };
    if (!e.registeredName?.trim()) {
      problems.push(
        'LEGAL_ENTITY_NAME / _IDNO / _ADDRESS are unset, so the checkout ' +
          'answers 503 legal_entity_missing. Set placeholder values on the API.',
      );
    }
  } else {
    problems.push(`GET /contacts/legal-entity answered ${entity.status}.`);
  }

  const page = await get(`${SITE_URL}/ro/checkout/express`);
  if (!page.ok) {
    problems.push(
      `${SITE_URL}/ro/checkout/express answered ${page.status} — is the ` +
        'production build of the site running, and is EXPRESS on sale?',
    );
  }

  // The one precondition no request can prove: whether the API will let this
  // origin post. A wrong CORS_ORIGINS shows up only in the browser.
  const preflight = await fetch(`${API_URL}/leads/quick-question/checkout`, {
    method: 'OPTIONS',
    headers: {
      Origin: SITE_URL,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  }).catch(() => null);
  if (preflight?.headers.get('access-control-allow-origin') !== SITE_URL) {
    problems.push(
      `The API does not allow ${SITE_URL} — add it to CORS_ORIGINS, or the ` +
        "checkout form's POST is blocked in the browser and the page hangs.",
    );
  }

  if (problems.length) {
    throw new Error(
      'The end-to-end smoke path needs a running stack. See TESTING.md, ' +
        '"The end-to-end path".\n\n  - ' +
        problems.join('\n  - '),
    );
  }
}
