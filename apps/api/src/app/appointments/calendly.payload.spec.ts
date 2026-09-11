import { CalendlyService } from './calendly.service';
import {
  CLIENT_NAME_MAX,
  REASON_MAX,
  clampText,
  normalizeCalendlyBooking,
  rescheduleCarryOver,
} from './appointments.service';
import { PaymentStatus } from '../../generated/prisma/enums';

/**
 * What we keep from a Calendly payload, and what we refuse to keep. The
 * bodies below follow the shape Calendly documents for `invitee.created`;
 * the reschedule pair cannot be reproduced against the test account (free
 * plan, one active event type), so the linking rule is pinned here rather
 * than by a live booking.
 */
const calendly = new CalendlyService();

function createdBody(payload: Record<string, unknown>) {
  return {
    event: 'invitee.created',
    payload: {
      uri: 'https://api.calendly.com/scheduled_events/EV2/invitees/IN2',
      name: 'Maria Ionescu',
      email: 'parinte@example.md',
      cancel_url: 'https://calendly.com/cancellations/EV2',
      reschedule_url: 'https://calendly.com/reschedulings/EV2',
      scheduled_event: {
        uri: 'https://api.calendly.com/scheduled_events/EV2',
        start_time: '2026-09-14T07:00:00.000000Z',
        end_time: '2026-09-14T07:50:00.000000Z',
        event_type: 'https://api.calendly.com/event_types/ET-PEDIATRIC',
        location: {
          type: 'google_conference',
          join_url: 'https://meet.google.com/abc-defg-hij',
        },
      },
      ...payload,
    },
  };
}

describe('CalendlyService.extractReason', () => {
  it('joins the answers in the order the questions were asked', () => {
    expect(
      calendly.extractReason([
        { question: 'Altceva?', answer: 'Alergie la lactoză', position: 1 },
        { question: 'Motivul vizitei', answer: 'Somn agitat', position: 0 },
      ]),
    ).toBe('Somn agitat · Alergie la lactoză');
  });

  it('drops blank answers rather than joining empty separators', () => {
    expect(
      calendly.extractReason([
        { question: 'Motivul vizitei', answer: '  Tuse  ', position: 0 },
        { question: 'Altceva?', answer: '   ', position: 1 },
      ]),
    ).toBe('Tuse');
  });

  it('reads an unanswered form and a missing form the same way', () => {
    expect(
      calendly.extractReason([
        { question: 'Motivul vizitei', answer: '', position: 0 },
      ]),
    ).toBeNull();
    expect(calendly.extractReason(undefined)).toBeNull();
    expect(calendly.extractReason([])).toBeNull();
  });
});

describe('CalendlyService.extractVideoUrl', () => {
  it('takes the conference link', () => {
    expect(
      calendly.extractVideoUrl({
        join_url: 'https://meet.google.com/abc-defg-hij',
      }),
    ).toBe('https://meet.google.com/abc-defg-hij');
  });

  it('refuses a link that is not https', () => {
    expect(
      calendly.extractVideoUrl({ join_url: 'http://meet.example/x' }),
    ).toBeNull();
    expect(
      calendly.extractVideoUrl({ join_url: 'javascript:alert(1)' }),
    ).toBeNull();
  });

  it('ignores the free-text location the invitee typed', () => {
    expect(
      calendly.extractVideoUrl({ location: 'https://evil.example/pay-here' }),
    ).toBeNull();
    expect(
      calendly.extractVideoUrl({ location: 'Strada Mihai Eminescu 4' }),
    ).toBeNull();
  });

  it('reads a conference still being provisioned as no link yet', () => {
    expect(calendly.extractVideoUrl({ join_url: null })).toBeNull();
    expect(calendly.extractVideoUrl(undefined)).toBeNull();
  });
});

describe('clampText', () => {
  it('trims and keeps text inside the ceiling', () => {
    expect(clampText('  Somn agitat  ', REASON_MAX)).toBe('Somn agitat');
  });

  it('truncates rather than rejecting, so the booking is still recorded', () => {
    const long = 'a'.repeat(REASON_MAX + 500);
    expect(clampText(long, REASON_MAX)).toHaveLength(REASON_MAX);
  });

  it('treats blank and missing as absent', () => {
    expect(clampText('   ', REASON_MAX)).toBeNull();
    expect(clampText(null, REASON_MAX)).toBeNull();
    expect(clampText(undefined, REASON_MAX)).toBeNull();
  });
});

describe('normalizeCalendlyBooking', () => {
  it('keeps the invitee URI a later reschedule will point back at', () => {
    const booking = normalizeCalendlyBooking(createdBody({}), calendly);
    expect(booking?.inviteeUri).toBe(
      'https://api.calendly.com/scheduled_events/EV2/invitees/IN2',
    );
    expect(booking?.rescheduledFromInviteeUri).toBeNull();
  });

  it('names the invitee it replaces when Calendly says it is a reschedule', () => {
    const booking = normalizeCalendlyBooking(
      createdBody({
        rescheduled: true,
        old_invitee:
          'https://api.calendly.com/scheduled_events/EV1/invitees/IN1',
      }),
      calendly,
    );
    expect(booking?.rescheduledFromInviteeUri).toBe(
      'https://api.calendly.com/scheduled_events/EV1/invitees/IN1',
    );
  });

  it('ignores old_invitee when the booking is not a reschedule', () => {
    const booking = normalizeCalendlyBooking(
      createdBody({
        old_invitee:
          'https://api.calendly.com/scheduled_events/EV1/invitees/IN1',
      }),
      calendly,
    );
    expect(booking?.rescheduledFromInviteeUri).toBeNull();
  });

  it('caps the name and the reason at the column ceilings', () => {
    const booking = normalizeCalendlyBooking(
      createdBody({
        name: 'M'.repeat(CLIENT_NAME_MAX + 50),
        questions_and_answers: [
          {
            question: 'Motivul vizitei',
            answer: 'x'.repeat(REASON_MAX + 50),
            position: 0,
          },
        ],
      }),
      calendly,
    );
    expect(booking?.clientName).toHaveLength(CLIENT_NAME_MAX);
    expect(booking?.reason).toHaveLength(REASON_MAX);
  });

  it('falls back to a placeholder name but never invents an email', () => {
    const booking = normalizeCalendlyBooking(
      createdBody({ name: '  ', email: undefined }),
      calendly,
    );
    expect(booking?.clientName).toBe('Necunoscut');
    expect(booking?.clientEmail).toBe('');
  });

  it('refuses a payload with no event type, since the service cannot be resolved', () => {
    const body = createdBody({});
    delete (body.payload.scheduled_event as Record<string, unknown>).event_type;
    expect(normalizeCalendlyBooking(body, calendly)).toBeNull();
  });
});

describe('rescheduleCarryOver', () => {
  const previous = {
    id: 'appt-old',
    paymentStatus: PaymentStatus.confirmed,
    patientId: 'patient-1',
    planText: 'Plan scris după consultație.',
    planFileKey: '9f0c1f4e-2b7a-4f0e-9a0e-1f2c3d4e5f60.pdf',
    planFileName: 'plan-maria.pdf',
    planUploadedAt: new Date('2026-09-01T10:00:00.000Z'),
  };

  it('carries the payment and the patient onto the new booking', () => {
    const { next } = rescheduleCarryOver(previous);
    expect(next.paymentStatus).toBe(PaymentStatus.confirmed);
    expect(next.patientId).toBe('patient-1');
  });

  it('moves the plan, so the stored file has exactly one owner', () => {
    const { next, clearedOnPrevious } = rescheduleCarryOver(previous);
    expect(next.planFileKey).toBe(previous.planFileKey);
    expect(next.planFileName).toBe(previous.planFileName);
    expect(next.planUploadedAt).toEqual(previous.planUploadedAt);
    expect(clearedOnPrevious).toEqual({
      planText: null,
      planFileKey: null,
      planFileName: null,
      planUploadedAt: null,
    });
  });

  it('owes the preparation instructions again, because the time changed', () => {
    expect(rescheduleCarryOver(previous).next.prepSentAt).toBeNull();
  });

  it('carries an unpaid, unpromoted booking without inventing anything', () => {
    const { next } = rescheduleCarryOver({
      id: 'appt-old',
      paymentStatus: PaymentStatus.pending,
      patientId: null,
      planText: null,
      planFileKey: null,
      planFileName: null,
      planUploadedAt: null,
    });
    expect(next).toEqual({
      paymentStatus: PaymentStatus.pending,
      patientId: null,
      planText: null,
      planFileKey: null,
      planFileName: null,
      planUploadedAt: null,
      prepSentAt: null,
    });
  });
});
