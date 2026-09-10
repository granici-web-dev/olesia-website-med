/**
 * Which branch each lead kind takes into the dossier timeline.
 *
 * The order branch is the one that did not exist (audit A5, F12): group-C
 * orders had no patient relation, so the menus and protocols a person had
 * bought were simply absent from her record, with nothing on the page saying
 * so.
 */
import { toInteractions } from './interactions';

const at = (iso: string) => new Date(iso);

const rows = {
  appointments: [
    {
      id: 'appt-1',
      status: 'scheduled',
      paymentStatus: 'confirmed',
      reason: 'tuse de 3 zile',
      startTime: at('2026-09-05T09:00:00.000Z'),
    },
  ],
  subscriptions: [
    {
      id: 'sub-1',
      status: 'active',
      paymentStatus: 'pending',
      startsAt: at('2026-09-01T00:00:00.000Z'),
    },
  ],
  quickQuestions: [
    {
      id: 'qq-1',
      status: 'open',
      paymentStatus: 'pending',
      createdAt: at('2026-09-07T18:20:00.000Z'),
    },
  ],
  deliverableOrders: [
    {
      id: 'order-1',
      status: 'in_progress',
      paymentStatus: 'confirmed',
      titleRo: 'Meniu personalizat 7 zile',
      createdAt: at('2026-09-03T12:00:00.000Z'),
    },
  ],
};

describe('toInteractions', () => {
  it('gives a group-C order its own branch, labelled with the product ordered', () => {
    const order = toInteractions(rows).find((i) => i.source === 'deliverable_order');

    expect(order).toEqual({
      source: 'deliverable_order',
      sourceId: 'order-1',
      // Not "Comandă": the doctor needs to know which product she owes.
      label: 'Meniu personalizat 7 zile',
      occurredAt: '2026-09-03T12:00:00.000Z',
      status: 'in_progress',
      paymentStatus: 'confirmed',
    });
  });

  it('dates each kind by the moment that matters to the doctor', () => {
    const byId = new Map(toInteractions(rows).map((i) => [i.sourceId, i.occurredAt]));

    // The appointment by when it happens, the subscription by when it starts,
    // and the two requests by when they came in.
    expect(byId.get('appt-1')).toBe('2026-09-05T09:00:00.000Z');
    expect(byId.get('sub-1')).toBe('2026-09-01T00:00:00.000Z');
    expect(byId.get('qq-1')).toBe('2026-09-07T18:20:00.000Z');
    expect(byId.get('order-1')).toBe('2026-09-03T12:00:00.000Z');
  });

  it('merges the four kinds newest first', () => {
    expect(toInteractions(rows).map((i) => i.sourceId)).toEqual([
      'qq-1',
      'appt-1',
      'order-1',
      'sub-1',
    ]);
  });

  it('falls back to a generic label on an appointment booked without a reason', () => {
    const [only] = toInteractions({
      ...rows,
      appointments: [{ ...rows.appointments[0], reason: null }],
      subscriptions: [],
      quickQuestions: [],
      deliverableOrders: [],
    });
    expect(only.label).toBe('Consultație');
  });

  it('is empty for a dossier with nothing linked to it', () => {
    expect(
      toInteractions({
        appointments: [],
        subscriptions: [],
        quickQuestions: [],
        deliverableOrders: [],
      }),
    ).toEqual([]);
  });
});
