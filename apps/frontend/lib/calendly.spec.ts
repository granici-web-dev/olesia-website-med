import { describe, expect, it } from 'vitest';

import {
  calendlyUrlFor,
  freeConsultTarget,
  type SchedulableService,
} from './calendly';

/**
 * The rule this pins is the absence of a fallback (audit A7).
 *
 * Until 2026-09-11 a service with no scheduling URL fell back to a table of
 * events on the developer's personal Calendly account, so the site rendered a
 * working-looking button that booked a stranger's calendar — and the day the
 * client's own links were saved in the back office, a single missing one would
 * have gone back to that table silently. A service the catalog has no link for
 * gets `null`, and every caller renders no button.
 */
const service = (
  code: string,
  calendlySchedulingUrl: string | null,
): SchedulableService => ({ code, calendlySchedulingUrl });

describe('calendlyUrlFor', () => {
  const catalog = [
    service('pediatric', 'https://calendly.com/dr-olesea/pediatrie'),
    service('nutrition_copii', 'https://calendly.com/dr-olesea/nutritie-copii'),
    service(
      'nutrition_adulti',
      'https://calendly.com/dr-olesea/nutritie-adulti',
    ),
    service('monitoring', null),
  ];

  it('returns the link the catalog carries', () => {
    expect(calendlyUrlFor('pediatric', catalog)).toBe(
      'https://calendly.com/dr-olesea/pediatrie',
    );
  });

  it('keeps the two nutrition audiences on separate links', () => {
    expect(calendlyUrlFor('nutrition_copii', catalog)).not.toBe(
      calendlyUrlFor('nutrition_adulti', catalog),
    );
  });

  it('answers null for a service with no link, rather than borrowing one', () => {
    expect(calendlyUrlFor('monitoring', catalog)).toBeNull();
  });

  it('answers null for a code the catalog does not have', () => {
    expect(calendlyUrlFor('free_consult', catalog)).toBeNull();
    expect(calendlyUrlFor('pediatric', [])).toBeNull();
  });
});

/**
 * The standing "book" button in the header, the hero and the footer is not a
 * per-service button: it is the site's invitation on every page, and a page
 * with no way to start is worse than one whose first step is the service list.
 * So it survives a catalog with no bookable free consultation, as a link to
 * `/services` — never as a link to somebody else's calendar.
 */
describe('freeConsultTarget', () => {
  it('opens the catalog link when the free consultation is bookable', () => {
    expect(
      freeConsultTarget([
        service('free_consult', 'https://calendly.com/dr-olesea/gratuit'),
      ]),
    ).toEqual({
      kind: 'calendly',
      url: 'https://calendly.com/dr-olesea/gratuit',
    });
  });

  it('sends people to the services page when it is not', () => {
    expect(freeConsultTarget([])).toEqual({ kind: 'page', href: '/services' });
    expect(freeConsultTarget([service('free_consult', null)])).toEqual({
      kind: 'page',
      href: '/services',
    });
  });
});
