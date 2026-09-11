import { describe, expect, it } from 'vitest';

import { CALENDLY_FALLBACK_URLS, calendlyUrlFor } from './calendly';

/**
 * The precedence rule, pinned because getting it backwards is invisible: the
 * site would keep booking into the developer's test account after the client's
 * links were saved in the back office, and every page would still render a
 * working button (audit A6, F13).
 */
describe('calendlyUrlFor', () => {
  it('prefers the link the API supplied', () => {
    expect(
      calendlyUrlFor('pediatric', 'https://calendly.com/dr-olesea/pediatrie'),
    ).toBe('https://calendly.com/dr-olesea/pediatrie');
  });

  it('falls back to the built-in link when the API has none', () => {
    expect(calendlyUrlFor('pediatric', null)).toBe(
      CALENDLY_FALLBACK_URLS.pediatric,
    );
    expect(calendlyUrlFor('pediatric')).toBe(CALENDLY_FALLBACK_URLS.pediatric);
  });

  it('keeps the two nutrition audiences on separate links', () => {
    expect(calendlyUrlFor('nutrition_copii')).not.toBe(
      calendlyUrlFor('nutrition_adulti'),
    );
  });

  it('has nothing to say about a code it does not know', () => {
    expect(calendlyUrlFor('monitoring')).toBeUndefined();
    expect(calendlyUrlFor('nutrition')).toBeUndefined();
  });
});
