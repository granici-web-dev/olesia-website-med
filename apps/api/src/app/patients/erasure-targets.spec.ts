/**
 * The erasure plan, checked against one row per table.
 *
 * The rows below are the ones audit A3 (F1) found surviving: a Calendly
 * booking that never got a `patientId`, a group-C order whose model has no
 * patient relation at all, a contact message nobody was matching on, and a
 * payment that used to be left whole. Each is written the way it really
 * exists in the database, so a target that stops reaching it fails here.
 */
import { Prisma } from '../../generated/prisma/client';
import {
  ANON_EMAIL,
  ANON_NAME,
  ANON_TEXT,
  ERASURE_ORDER,
  erasureTargets,
} from './erasure-targets';

const PATIENT_ID = 'patient-1';
const EMAIL = 'ana@gmail.com';

type Row = Record<string, unknown>;
type Clause = Record<string, unknown>;

/**
 * Evaluates the three clause shapes the plan emits — field equality, `OR`
 * over such clauses, and one level of relation nesting — against a plain row.
 * Deliberately not a Prisma emulator: an unsupported shape throws rather than
 * guessing, which is the signal to look at the target rather than at this.
 */
function matches(where: Clause, row: Row): boolean {
  const or = where['OR'];
  if (Array.isArray(or)) return or.some((c) => matches(c as Clause, row));

  return Object.entries(where).every(([field, expected]) => {
    const actual = row[field];
    if (expected !== null && typeof expected === 'object') {
      if (actual === null || typeof actual !== 'object') return false;
      return matches(expected as Clause, actual as Row);
    }
    if (actual !== null && typeof actual === 'object') {
      throw new Error(`unsupported clause shape for field "${field}"`);
    }
    return actual === expected;
  });
}

describe('erasureTargets', () => {
  const plan = erasureTargets(PATIENT_ID, EMAIL);

  it('covers every table that holds this person, in execution order', () => {
    expect(Object.keys(plan)).toEqual([...ERASURE_ORDER]);
    expect(ERASURE_ORDER).toHaveLength(10);
  });

  it('reaches an appointment that was never linked to the dossier', () => {
    // Booked through Calendly before the patient existed: `patientId` is null
    // and the address is the only thing tying the row to the person.
    const where = plan.appointment.where as Clause;
    expect(
      matches(where, {
        id: 'appt-1',
        patientId: null,
        clientEmail: EMAIL,
        reason: 'tuse de 3 zile',
      }),
    ).toBe(true);
    // And one booked with no address at all, linked only by the dossier.
    expect(
      matches(where, { id: 'appt-2', patientId: PATIENT_ID, clientEmail: '' }),
    ).toBe(true);
    expect(
      matches(where, { id: 'appt-3', patientId: null, clientEmail: 'x@y.md' }),
    ).toBe(false);
  });

  it('reaches a group-C order, which has no patient relation to match on', () => {
    const where = plan.deliverableOrder.where as Clause;
    expect(
      matches(where, {
        id: 'order-1',
        clientEmail: EMAIL,
        notes: 'alergie la ou, copil 3 ani',
      }),
    ).toBe(true);
    expect(matches(where, { id: 'order-2', clientEmail: 'x@y.md' })).toBe(false);
    expect(plan.deliverableOrder.data).toEqual({
      clientName: ANON_NAME,
      clientEmail: ANON_EMAIL,
      phone: null,
      notes: null,
    });
  });

  it('reaches the contact message, the subscription and the ticket by address', () => {
    expect(
      matches(plan.contactMessage.where as Clause, {
        id: 'msg-1',
        email: EMAIL,
        message: 'Când pot programa?',
      }),
    ).toBe(true);
    expect(plan.contactMessage.data).toMatchObject({ message: ANON_TEXT });

    for (const target of [plan.subscription, plan.quickQuestion]) {
      expect(
        matches(target.where as Clause, {
          id: 'lead-1',
          patientId: null,
          clientEmail: EMAIL,
        }),
      ).toBe(true);
    }
    // The free text on both is the client's own words about a child.
    expect(plan.subscription.data).toMatchObject({ notes: null, phone: null });
    expect(plan.quickQuestion.data).toMatchObject({ question: ANON_TEXT });
  });

  it('reaches an upload link through its own address or its appointment', () => {
    const where = plan.uploadLink.where as Clause;
    // The link for a group-C order: no appointment behind it at all.
    expect(matches(where, { id: 'l1', clientEmail: EMAIL, appointment: null })).toBe(
      true,
    );
    // The link for a Calendly booking that carried no address.
    expect(
      matches(where, {
        id: 'l2',
        clientEmail: '',
        appointment: { patientId: PATIENT_ID },
      }),
    ).toBe(true);
    expect(
      matches(where, {
        id: 'l3',
        clientEmail: 'x@y.md',
        appointment: { patientId: 'other' },
      }),
    ).toBe(false);
    // Deleted, never anonymized: the token is a credential of its own, and
    // the medical files the patient sent hang off it.
    expect(plan.uploadLink.action).toBe('delete');
    expect(plan.uploadedDocument).toEqual({
      action: 'cascade',
      cascadesFrom: 'uploadLink',
    });
  });

  it('anonymizes the payment instead of deleting it, and keeps only the ledger', () => {
    expect(plan.payment.action).toBe('anonymize');

    expect(
      matches(plan.payment.where as Clause, {
        id: 'pay-1',
        patientId: null,
        payerEmail: EMAIL,
      }),
    ).toBe(true);

    // The payer goes; the money and the bank's own references stay, because
    // an accounting record has its own retention period.
    expect(plan.payment.data).toEqual({
      payerName: null,
      payerEmail: ANON_EMAIL,
      payerPhone: null,
      // The bank's payload verbatim — the payer's details in full. A nullable
      // Json column needs the DB NULL sentinel; a bare `null` means "leave it".
      rawCallback: Prisma.DbNull,
      patientId: null,
    });
    for (const kept of [
      'amount',
      'currency',
      'orderId',
      'checkoutId',
      'rrn',
      'approvalCode',
      'terminalId',
    ]) {
      expect(plan.payment.data).not.toHaveProperty(kept);
    }
  });

  it('strips the Calendly capability URLs from an anonymized appointment', () => {
    // Anonymizing the row and leaving these standing lets anyone holding the
    // link cancel or reschedule the erased person's consultation (F6).
    expect(plan.appointment.data).toMatchObject({
      cancelUrl: null,
      rescheduleUrl: null,
      calendlyInviteeUri: null,
      planText: null,
      planFileKey: null,
      patientId: null,
    });
  });

  it('deletes the upload links before the appointment loses its patientId', () => {
    expect(ERASURE_ORDER.indexOf('uploadLink')).toBeLessThan(
      ERASURE_ORDER.indexOf('appointment'),
    );
    // And the dossier goes last: every step before it matches on `patientId`,
    // which the foreign keys null the moment the patient row disappears.
    expect(ERASURE_ORDER.at(-1)).toBe('patient');
  });
});
