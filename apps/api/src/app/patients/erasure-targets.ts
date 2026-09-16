/**
 * Which rows belong to one person, table by table (GDPR right to erasure).
 *
 * Audit A3 (F1) counted what `remove()` actually reached: it matched on
 * `patientId` only, so it missed every row that never got linked — the
 * Calendly booking made before the dossier existed, the public monitoring
 * lead, the EXPRESS ticket, the upload link and, underneath it, the medical
 * files the patient had sent. It missed `DeliverableOrder` and
 * `ContactMessage` outright, because neither had a patient relation at all;
 * `DeliverableOrder` grew one in A5 (F12) and is matched on both arms now.
 * And it left the `Payment` row whole while the foreign key quietly nulled
 * its `patientId`, so a dossier recreated later under the same address
 * re-adopted the history that was supposed to be gone (F9).
 *
 * The plan lives here, as data, for three reasons. It is the only way to test
 * the decision without a database, which `TESTING.md` asks for on anything
 * this expensive to get wrong. It puts the ten tables in one readable list,
 * so the next person who adds a model with a `clientEmail` column has an
 * obvious place to fail to add it. And every clause is typed against the
 * generated Prisma types, so renaming a column breaks the build here rather
 * than silently narrowing what erasure reaches.
 */
import { Prisma } from '../../generated/prisma/client';

/** Placeholders written over PII that has to stay a row (see each target). */
export const ANON_NAME = 'Pacient șters';
export const ANON_EMAIL = 'sters@gdpr.local';
export const ANON_TEXT = '[conținut șters la cererea de ștergere]';

/**
 * Calendly keeps its own copy of the invitee — the name, the address and the
 * answers they typed into the booking form. Nothing in this system deletes
 * it, so erasure has to say so out loud rather than let the report imply the
 * person is gone everywhere.
 */
export const CALENDLY_MANUAL_STEP =
  'Ștergeți manual invitatul din contul Calendly: programările sincronizate păstrează acolo numele, emailul și răspunsurile din formular, iar acest sistem nu le poate șterge.';

export type ErasureAction =
  /** The row goes. */
  | 'delete'
  /** The row stays, its PII is overwritten. */
  | 'anonymize'
  /** The row goes with its parent's, by a foreign key. */
  | 'cascade';

interface Anonymize<Where, Data> {
  action: 'anonymize';
  where: Where;
  data: Data;
}

interface Delete<Where> {
  action: 'delete';
  where: Where;
}

interface Cascade {
  action: 'cascade';
  /** Whose deletion takes these rows with it. */
  cascadesFrom: ErasureTable;
}

/**
 * The erasure plan for one person.
 *
 * The property order is the execution order, and it is load-bearing in two
 * places. `uploadLink` runs first because one of its legs reads
 * `appointment.patientId`, which the `appointment` step is about to null.
 * `patient` runs last because deleting it nulls `patientId` everywhere else
 * through the foreign keys, and every step before it still needs that column.
 * `ERASURE_ORDER` states it explicitly so a reordered object is a failing
 * test rather than a quietly weaker erasure.
 */
export interface ErasurePlan {
  uploadLink: Delete<Prisma.UploadLinkWhereInput>;
  uploadedDocument: Cascade;
  appointment: Anonymize<
    Prisma.AppointmentWhereInput,
    Prisma.AppointmentUncheckedUpdateManyInput
  >;
  subscription: Anonymize<
    Prisma.SubscriptionWhereInput,
    Prisma.SubscriptionUncheckedUpdateManyInput
  >;
  quickQuestion: Anonymize<
    Prisma.QuickQuestionWhereInput,
    Prisma.QuickQuestionUncheckedUpdateManyInput
  >;
  deliverableOrder: Anonymize<
    Prisma.DeliverableOrderWhereInput,
    Prisma.DeliverableOrderUncheckedUpdateManyInput
  >;
  contactMessage: Anonymize<
    Prisma.ContactMessageWhereInput,
    Prisma.ContactMessageUncheckedUpdateManyInput
  >;
  payment: Anonymize<
    Prisma.PaymentWhereInput,
    Prisma.PaymentUncheckedUpdateManyInput
  >;
  patientEntry: Cascade;
  patientEntrySend: Cascade;
  patient: Delete<Prisma.PatientWhereUniqueInput>;
}

export type ErasureTable = keyof ErasurePlan;

/** Execution order, and the order the report lists tables in. */
export const ERASURE_ORDER = [
  'uploadLink',
  'uploadedDocument',
  'appointment',
  'subscription',
  'quickQuestion',
  'deliverableOrder',
  'contactMessage',
  'payment',
  'patientEntry',
  'patientEntrySend',
  'patient',
] as const satisfies readonly ErasureTable[];

export function erasureTargets(patientId: string, email: string): ErasurePlan {
  /** Linked by the dossier, or by the address the person used at the time. */
  const byPatient = { patientId };

  return {
    uploadLink: {
      action: 'delete',
      // Not anonymized: a link carries the name, the address and a working
      // token of its own, so overwriting two of the three leaves a credential
      // standing. The documents underneath go with it, by cascade.
      where: {
        OR: [{ clientEmail: email }, { appointment: byPatient }],
      },
    },

    uploadedDocument: { action: 'cascade', cascadesFrom: 'uploadLink' },

    appointment: {
      action: 'anonymize',
      where: { OR: [byPatient, { clientEmail: email }] },
      data: {
        clientName: ANON_NAME,
        clientEmail: ANON_EMAIL,
        reason: null,
        // The treatment plan is medical data: erase the text, detach the file.
        planText: null,
        planFileKey: null,
        planFileName: null,
        planUploadedAt: null,
        // Live capability URLs into Calendly, where this person's data still
        // sits. Anonymizing the row and leaving these is not erasure (F6).
        // `calendlyEventUri` stays: it is an opaque id, it carries no PII, and
        // it is what stops a re-delivered webhook recreating the booking.
        cancelUrl: null,
        rescheduleUrl: null,
        calendlyInviteeUri: null,
        patientId: null,
      },
    },

    subscription: {
      action: 'anonymize',
      where: { OR: [byPatient, { clientEmail: email }] },
      data: {
        clientName: ANON_NAME,
        clientEmail: ANON_EMAIL,
        phone: null,
        // Free text from the public form — goals, a child's age, a diagnosis.
        notes: null,
        patientId: null,
      },
    },

    quickQuestion: {
      action: 'anonymize',
      where: { OR: [byPatient, { clientEmail: email }] },
      data: {
        clientName: ANON_NAME,
        clientEmail: ANON_EMAIL,
        phone: null,
        question: ANON_TEXT,
        answer: null,
        patientId: null,
      },
    },

    deliverableOrder: {
      action: 'anonymize',
      // Both arms, like the three above it. There was no patient relation on
      // this model at all until audit A5 (F12), which is why erasure never saw
      // a group-C order before A3 (F1) and then saw it only by address — so an
      // order whose client later changed their email was left whole.
      where: { OR: [byPatient, { clientEmail: email }] },
      data: {
        clientName: ANON_NAME,
        clientEmail: ANON_EMAIL,
        phone: null,
        notes: null,
        patientId: null,
      },
    },

    contactMessage: {
      action: 'anonymize',
      where: { email },
      data: {
        name: ANON_NAME,
        email: ANON_EMAIL,
        message: ANON_TEXT,
        reply: null,
      },
    },

    payment: {
      action: 'anonymize',
      where: { OR: [byPatient, { payerEmail: email }] },
      // Anonymized rather than deleted, and this is the one documented
      // exception in the plan: a payment is an accounting record with its own
      // retention period. What survives is the money and the bank's own
      // references — amount, currency, orderId, checkoutId, rrn, approvalCode,
      // terminalId, cardMask — never the payer. `rawCallback` is the bank's
      // payload verbatim, which means the payer's details in full, and no
      // ledger needs it.
      data: {
        payerName: null,
        payerEmail: ANON_EMAIL,
        payerPhone: null,
        // A nullable Json column takes the DB NULL sentinel, not `null`,
        // which Prisma reads as "leave it alone".
        rawCallback: Prisma.DbNull,
        patientId: null,
      },
    },

    patientEntry: { action: 'cascade', cascadesFrom: 'patient' },

    // Each row holds the address the email went to, so it has to go with the
    // entry rather than outlive the dossier (docs/shape-send-prescription.md).
    patientEntrySend: { action: 'cascade', cascadesFrom: 'patientEntry' },

    patient: { action: 'delete', where: { id: patientId } },
  };
}
