import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicServiceDto } from '@olesia/shared';

import { serviceTag } from './api';

/**
 * `serviceTag` knew two languages and the site has three (audit A6, F11), so a
 * Russian reader was shown Romanian category tags above Russian titles. Every
 * branch is checked in every language for that reason, not for coverage.
 */
const service = (
  code: PublicServiceDto['code'],
  group: PublicServiceDto['group'] = 'A_booking',
): PublicServiceDto => ({ code, group }) as PublicServiceDto;

describe('serviceTag', () => {
  const CODES: PublicServiceDto['code'][] = [
    'pediatric',
    'nutrition_copii',
    'nutrition_adulti',
    'integrative',
    'monitoring',
    'quick_question',
  ];

  it('answers in Russian for a Russian reader, on every code', () => {
    for (const code of CODES) {
      const ru = serviceTag('ru', service(code));
      expect(ru).not.toBe(serviceTag('ro', service(code)));
      expect(ru).toMatch(/[А-Яа-я]/);
    }
  });

  it('answers in English for an English reader, on every code', () => {
    for (const code of CODES) {
      expect(serviceTag('en', service(code))).not.toBe(
        serviceTag('ro', service(code)),
      );
    }
  });

  it('separates the two nutrition audiences in each language', () => {
    for (const locale of ['ro', 'en', 'ru']) {
      expect(serviceTag(locale, service('nutrition_copii'))).not.toBe(
        serviceTag(locale, service('nutrition_adulti')),
      );
    }
  });

  it('falls back on the group for a code it does not know', () => {
    expect(serviceTag('ru', service('free_consult', 'A_booking'))).toBe(
      'Видеоконсультация',
    );
    expect(serviceTag('ru', service('free_consult', 'B_portal'))).toBe(
      'Сопровождение',
    );
  });

  it('treats an unknown locale as Romanian', () => {
    expect(serviceTag('de', service('pediatric'))).toBe('Pediatrie');
  });
});

/**
 * `next build` prerenders every page, so an API that was down at build time
 * failed the whole deployment — and the site is deployed before its API has a
 * host, so that was every build (A7, the regression found after `harden`).
 * Emptiness at build time, an outage at runtime: both branches are pinned
 * here, because getting the phase test wrong is silent in either direction —
 * a build that fails for nothing, or a live visitor shown a confident empty
 * site instead of the error page.
 */
describe('an API that does not answer', () => {
  const BUILD = 'phase-production-build';

  /** Re-imported per test: the module reads `API_URL` when it loads. */
  async function load() {
    vi.resetModules();
    return import('./api');
  }

  const respond = (init: ResponseInit) =>
    vi.fn(async () => new Response('{}', init));
  const refuse = () =>
    vi.fn(async () => {
      throw new TypeError('fetch failed');
    });

  beforeEach(() => {
    vi.stubEnv('API_URL', 'https://api.example.test');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('at runtime', () => {
    beforeEach(() => vi.stubEnv('NEXT_PHASE', ''));

    it('throws when the request never reaches the API', async () => {
      vi.stubGlobal('fetch', refuse());
      const { api, ApiUnavailableError } = await load();
      await expect(api.services()).rejects.toBeInstanceOf(ApiUnavailableError);
    });

    it('throws on a 5xx', async () => {
      vi.stubGlobal('fetch', respond({ status: 503 }));
      const { api, ApiUnavailableError } = await load();
      await expect(api.services()).rejects.toBeInstanceOf(ApiUnavailableError);
    });

    it('throws for the working-hours singleton too', async () => {
      vi.stubGlobal('fetch', refuse());
      const { api, ApiUnavailableError } = await load();
      await expect(api.workingHours()).rejects.toBeInstanceOf(
        ApiUnavailableError,
      );
    });

    it('still reads a 404 as emptiness, not an outage', async () => {
      vi.stubGlobal('fetch', respond({ status: 404 }));
      const { api } = await load();
      await expect(api.post('nothing-here')).resolves.toBeNull();
    });
  });

  describe('while prerendering', () => {
    beforeEach(() => vi.stubEnv('NEXT_PHASE', BUILD));

    it('renders empty when the request never reaches the API', async () => {
      vi.stubGlobal('fetch', refuse());
      const { api } = await load();
      await expect(api.services()).resolves.toEqual([]);
      await expect(api.about()).resolves.toBeNull();
    });

    it('renders empty on a 5xx', async () => {
      vi.stubGlobal('fetch', respond({ status: 503 }));
      const { api } = await load();
      await expect(api.materials()).resolves.toEqual([]);
    });

    it('gives the working-hours singleton the row the API would create', async () => {
      vi.stubGlobal('fetch', refuse());
      const { api } = await load();
      const hours = await api.workingHours();
      expect(hours.days).toEqual([]);
      // It says "provisional", so no page states a schedule we do not have.
      expect(hours.isPlaceholder).toBe(true);
    });

    it('warns once per route, naming the route but not the host', async () => {
      vi.stubGlobal('fetch', refuse());
      const { api } = await load();
      await api.services();
      expect(console.warn).toHaveBeenCalledTimes(1);
      const [line] = vi.mocked(console.warn).mock.calls[0];
      expect(line).toContain('/services');
      expect(line).not.toContain('api.example.test');
    });

    it('passes a good answer through unchanged', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => Response.json([{ code: 'pediatric' }])),
      );
      const { api } = await load();
      await expect(api.services()).resolves.toEqual([{ code: 'pediatric' }]);
    });
  });
});
