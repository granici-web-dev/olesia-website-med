/**
 * What the banner above the service list is allowed to call green.
 *
 * Audit A13 found it green on the test account, where four of the five event
 * types are switched off and exactly one booking works. It was asking whether
 * a text field had been filled in; these cases pin the question it asks now —
 * whether the event that field names can be booked today.
 */
import { describe, expect, it } from 'vitest';

import { calendlyReadiness } from '@/features/services/calendly-readiness';
import type { CalendlyEventType } from '@/features/services/calendly-event-types';
import type { Service } from '@/features/services/types';

const service = (
  titleRo: string,
  calendlyEventTypeUri: string | null,
  group: Service['group'] = 'A_booking',
): Service =>
  ({ id: titleRo, titleRo, group, calendlyEventTypeUri }) as Service;

const event = (uri: string, active?: boolean): CalendlyEventType =>
  ({
    uri,
    name: uri,
    scheduling_url: `https://calendly.com/${uri}`,
    active,
  }) as CalendlyEventType;

const account = (eventTypes: CalendlyEventType[]) => ({
  configured: true,
  eventTypes,
});

describe('calendlyReadiness', () => {
  it('is green when every bookable service points at a live event', () => {
    const state = calendlyReadiness(
      [service('Pediatrie', 'uri-a'), service('Nutriție', 'uri-b')],
      account([event('uri-a', true), event('uri-b', true)]),
    );
    expect(state.ok).toBe(true);
    expect(state.eventCount).toBe(2);
  });

  it('is not green when a mapped event is switched off in Calendly', () => {
    // The test account's own shape: a URI that resolves, to an event nobody
    // can book. This is what used to read as "everything is ready".
    const state = calendlyReadiness(
      [service('Pediatrie', 'uri-a'), service('Nutriție', 'uri-b')],
      account([event('uri-a', true), event('uri-b', false)]),
    );
    expect(state.ok).toBe(false);
    expect(state.unbookable).toEqual(['Nutriție']);
    expect(state.unmapped).toEqual([]);
  });

  it('names a mapped event that is not in the account at all', () => {
    // A deleted or re-created event leaves the URI behind, pointing nowhere.
    const state = calendlyReadiness(
      [service('Integrativă', 'uri-gone')],
      account([event('uri-a', true)]),
    );
    expect(state.unbookable).toEqual(['Integrativă']);
  });

  it('treats an event that does not say whether it is active as active', () => {
    // The same rule the event picker uses to label an option `inactiv`.
    // Disagreeing with it would put two readings of one event in one screen.
    const state = calendlyReadiness(
      [service('Pediatrie', 'uri-a')],
      account([event('uri-a', undefined)]),
    );
    expect(state.ok).toBe(true);
  });

  it('separates "nobody mapped it" from "the mapping is dead"', () => {
    const state = calendlyReadiness(
      [service('Pediatrie', null), service('Nutriție', 'uri-off')],
      account([event('uri-off', false)]),
    );
    expect(state.unmapped).toEqual(['Pediatrie']);
    expect(state.unbookable).toEqual(['Nutriție']);
  });

  it('ignores portal services, which never book through Calendly', () => {
    const state = calendlyReadiness(
      [service('Întrebare EXPRESS', null, 'B_portal')],
      account([]),
    );
    expect(state.ok).toBe(true);
    expect(state.unmapped).toEqual([]);
  });

  it('calls an unconnected account unmapped, never unbookable', () => {
    // With no token there is no list to check against, so a mapping is
    // unverified rather than broken — the "not connected" sentence covers it.
    const state = calendlyReadiness([service('Pediatrie', 'uri-a')], {
      configured: false,
      eventTypes: [],
    });
    expect(state.connected).toBe(false);
    expect(state.ok).toBe(false);
    expect(state.unbookable).toEqual([]);
  });

  it('is not green while the event types are still loading', () => {
    const state = calendlyReadiness([service('Pediatrie', 'uri-a')], undefined);
    expect(state.ok).toBe(false);
  });
});
