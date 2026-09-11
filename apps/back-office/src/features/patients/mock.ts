import type { VariantProps } from 'class-variance-authority';
import { PatientEntryType, PaymentStatus } from '@olesia/shared';

import type { badgeVariants } from '@/components/ui/badge';
import type {
  EntryFormValues,
  EntryType,
  LeadSource,
  PatientDto,
  PatientEntryDto,
  PatientErasureReportDto,
  PatientFormValues,
  PatientInteractionDto,
  PatientTimeline,
} from '@/features/patients/types';

/** The same wording the API returns; kept here so mock mode reads the same. */
const MOCK_CALENDLY_MANUAL_STEP =
  'Ștergeți manual invitatul din contul Calendly: programările sincronizate păstrează acolo numele, emailul și răspunsurile din formular, iar acest sistem nu le poate șterge.';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

/* ------------------------------ formatting ------------------------------ */

const dateFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(iso: string | null | undefined): string {
  return iso ? dateFmt.format(new Date(iso)) : '—';
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTimeFmt.format(new Date(iso)) : '—';
}

/** Whole-year age from a birth date, or null when unset. */
export function ageYears(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) years -= 1;
  return years >= 0 ? years : null;
}

/* ------------------------------ badge maps ------------------------------ */

export const entryTypeBadgeVariant: Record<EntryType, BadgeVariant> = {
  anamnesis: 'info',
  note: 'muted',
  prescription: 'success',
  document: 'secondary',
};

export const consentBadgeVariant = {
  given: 'success',
  missing: 'warning',
} satisfies Record<string, BadgeVariant>;

export const paymentBadgeVariant: Record<string, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
};

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory store shaped like the `patients` REST API
 * (module_patients.md). Opt in with VITE_API_MOCKS=true.
 * ------------------------------------------------------------------ */

const now = () => new Date().toISOString();

let patients: PatientDto[] = [
  {
    id: 'pat1',
    fullName: 'Irina Bejan',
    email: 'irina.bejan@gmail.com',
    phone: '+373 69 112 233',
    birthDate: '2017-03-14',
    gender: 'female',
    notes: 'Mama: Elena. Preferă comunicarea pe email.',
    consentAt: '2026-05-01T09:00:00+03:00',
    createdAt: '2026-05-01T09:00:00+03:00',
    updatedAt: '2026-05-20T11:00:00+03:00',
    entryCount: 3,
  },
  {
    id: 'pat2',
    fullName: 'Mihai Olaru',
    email: 'mihai.olaru@outlook.com',
    phone: null,
    birthDate: '2019-09-02',
    gender: 'male',
    notes: null,
    consentAt: null,
    createdAt: '2026-06-04T09:00:00+03:00',
    updatedAt: '2026-06-04T09:00:00+03:00',
    entryCount: 1,
  },
  {
    id: 'pat3',
    fullName: 'Carmen Dascălu',
    email: 'carmen.dascalu@gmail.com',
    phone: '+373 60 778 899',
    birthDate: '2014-11-21',
    gender: 'female',
    notes: null,
    consentAt: '2026-04-20T08:00:00+03:00',
    createdAt: '2026-04-20T08:00:00+03:00',
    updatedAt: '2026-04-20T08:00:00+03:00',
    entryCount: 2,
  },
];

let entries: PatientEntryDto[] = [
  {
    id: 'ent1',
    patientId: 'pat1',
    type: PatientEntryType.Anamnesis,
    title: 'Anamneză inițială',
    body: '**Motivul prezentării:** evaluare nutrițională.\n\nGreutate la limita superioară pentru vârstă. Apetit selectiv, refuză legumele. Fără antecedente patologice semnificative.',
    fileUrl: null,
    fileName: null,
    occurredAt: '2026-05-02T10:00:00+03:00',
    authorId: 'usr1',
    createdAt: '2026-05-02T10:30:00+03:00',
    updatedAt: '2026-05-02T10:30:00+03:00',
  },
  {
    id: 'ent2',
    patientId: 'pat1',
    type: PatientEntryType.Prescription,
    title: 'Plan nutrițional — luna 1',
    body: 'Introducere graduală a legumelor (3 porții/zi). Reducerea sucurilor zaharate. Reevaluare în 4 săptămâni.',
    fileUrl: null,
    fileName: null,
    occurredAt: '2026-05-02T10:15:00+03:00',
    authorId: 'usr1',
    createdAt: '2026-05-02T10:35:00+03:00',
    updatedAt: '2026-05-02T10:35:00+03:00',
  },
  {
    id: 'ent3',
    patientId: 'pat1',
    type: PatientEntryType.Document,
    title: 'Analize de sânge — mai 2026',
    body: null,
    fileUrl: 'private/mock/analize-mai-2026.pdf',
    fileName: 'analize-mai-2026.pdf',
    occurredAt: '2026-05-20T11:00:00+03:00',
    authorId: 'usr1',
    createdAt: '2026-05-20T11:05:00+03:00',
    updatedAt: '2026-05-20T11:05:00+03:00',
  },
  {
    id: 'ent4',
    patientId: 'pat2',
    type: PatientEntryType.Note,
    title: null,
    body: 'Părinții solicită monitorizare pe 3 luni. De confirmat plata înainte de prima consultație.',
    fileUrl: null,
    fileName: null,
    occurredAt: '2026-06-05T10:00:00+03:00',
    authorId: 'usr1',
    createdAt: '2026-06-05T10:00:00+03:00',
    updatedAt: '2026-06-05T10:00:00+03:00',
  },
  {
    id: 'ent5',
    patientId: 'pat3',
    type: PatientEntryType.Anamnesis,
    title: 'Anamneză inițială',
    body: 'Consult integrativ. Somn fragmentat, episoade de anxietate ușoară. Recomandat jurnal de somn.',
    fileUrl: null,
    fileName: null,
    occurredAt: '2026-04-21T09:00:00+03:00',
    authorId: 'usr1',
    createdAt: '2026-04-21T09:00:00+03:00',
    updatedAt: '2026-04-21T09:00:00+03:00',
  },
  {
    id: 'ent6',
    patientId: 'pat3',
    type: PatientEntryType.Prescription,
    title: 'Recomandări integrative',
    body: 'Rutină de seară fără ecrane. Magneziu seara, 1 lună. Reevaluare la nevoie.',
    fileUrl: null,
    fileName: null,
    occurredAt: '2026-04-21T09:20:00+03:00',
    authorId: 'usr1',
    createdAt: '2026-04-21T09:20:00+03:00',
    updatedAt: '2026-04-21T09:20:00+03:00',
  },
];

const interactions: Record<string, PatientInteractionDto[]> = {
  pat1: [
    {
      source: 'appointment',
      sourceId: 'apt-mock-1',
      label: 'Consultație nutriție',
      occurredAt: '2026-05-28T14:00:00+03:00',
      status: 'completed',
      paymentStatus: PaymentStatus.Confirmed,
    },
    {
      source: 'appointment',
      sourceId: 'apt-mock-2',
      label: 'Consultație nutriție',
      occurredAt: '2026-05-02T10:00:00+03:00',
      status: 'completed',
      paymentStatus: PaymentStatus.Confirmed,
    },
  ],
  pat2: [
    {
      source: 'subscription',
      sourceId: 'sub-mock-1',
      label: 'Monitorizare 3 luni',
      occurredAt: '2026-06-05T10:00:00+03:00',
      status: 'active',
      paymentStatus: PaymentStatus.Pending,
    },
  ],
  pat3: [],
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getOrThrow(id: string): PatientDto {
  const p = patients.find((x) => x.id === id);
  if (!p) throw new Error(`Patient ${id} not found`);
  return p;
}

function countEntries(id: string): number {
  return entries.filter((e) => e.patientId === id).length;
}

function toEntryType(t: EntryFormValues['type']): PatientEntryType {
  return t as PatientEntryType;
}

/* --------------------------------- reads -------------------------------- */

export async function fetchPatients(search?: string): Promise<PatientDto[]> {
  await delay(500);
  const q = (search ?? '').trim().toLowerCase();
  return patients
    .filter(
      (p) =>
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q),
    )
    .map((p) => ({ ...p, entryCount: countEntries(p.id) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fetchPatient(id: string): Promise<PatientDto> {
  await delay(350);
  return { ...getOrThrow(id), entryCount: countEntries(id) };
}

export async function fetchTimeline(id: string): Promise<PatientTimeline> {
  await delay(400);
  getOrThrow(id);
  return {
    entries: entries
      .filter((e) => e.patientId === id)
      .slice()
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    interactions: (interactions[id] ?? [])
      .slice()
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
  };
}

/* ------------------------------- mutations ------------------------------ */

export async function createPatient(
  values: PatientFormValues,
): Promise<PatientDto> {
  await delay(450);
  if (patients.some((p) => p.email === values.email.trim())) {
    throw new Error('email_taken');
  }
  const ts = now();
  const patient: PatientDto = {
    id: `pat-${Math.round(performance.now())}`,
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    birthDate: values.birthDate || null,
    gender: values.gender || null,
    notes: values.notes.trim() || null,
    consentAt: null,
    createdAt: ts,
    updatedAt: ts,
    entryCount: 0,
  };
  patients = [patient, ...patients];
  return patient;
}

export async function updatePatient(
  id: string,
  values: PatientFormValues,
): Promise<PatientDto> {
  await delay(450);
  const current = getOrThrow(id);
  if (
    values.email.trim() !== current.email &&
    patients.some((p) => p.email === values.email.trim())
  ) {
    throw new Error('email_taken');
  }
  const updated: PatientDto = {
    ...current,
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    birthDate: values.birthDate || null,
    gender: values.gender || null,
    notes: values.notes.trim() || null,
    updatedAt: now(),
  };
  patients = patients.map((p) => (p.id === id ? updated : p));
  return updated;
}

export async function deletePatient(
  id: string,
): Promise<PatientErasureReportDto> {
  await delay(450);
  getOrThrow(id);
  const erasedEntries = entries.filter((e) => e.patientId === id).length;
  patients = patients.filter((p) => p.id !== id);
  entries = entries.filter((e) => e.patientId !== id);
  // Row counts the mock store cannot know; the shape is what the UI renders.
  return {
    tables: [
      { table: 'UploadLink', action: 'delete', rows: 1 },
      { table: 'UploadedDocument', action: 'cascade', rows: 2 },
      { table: 'Appointment', action: 'anonymize', rows: 2 },
      { table: 'Subscription', action: 'anonymize', rows: 0 },
      { table: 'QuickQuestion', action: 'anonymize', rows: 1 },
      { table: 'DeliverableOrder', action: 'anonymize', rows: 1 },
      { table: 'ContactMessage', action: 'anonymize', rows: 1 },
      { table: 'Payment', action: 'anonymize', rows: 1 },
      { table: 'PatientEntry', action: 'cascade', rows: erasedEntries },
      { table: 'Patient', action: 'delete', rows: 1 },
    ],
    manualSteps: [MOCK_CALENDLY_MANUAL_STEP],
  };
}

export async function setConsent(id: string): Promise<PatientDto> {
  await delay(350);
  const updated: PatientDto = {
    ...getOrThrow(id),
    consentAt: now(),
    updatedAt: now(),
  };
  patients = patients.map((p) => (p.id === id ? updated : p));
  return updated;
}

export async function addEntry(
  id: string,
  values: EntryFormValues,
): Promise<PatientEntryDto> {
  await delay(400);
  getOrThrow(id);
  const ts = now();
  const entry: PatientEntryDto = {
    id: `ent-${Math.round(performance.now())}`,
    patientId: id,
    type: toEntryType(values.type),
    title: values.title.trim() || null,
    body: values.body.trim() || null,
    fileUrl: null,
    fileName: null,
    occurredAt: values.occurredAt
      ? new Date(values.occurredAt).toISOString()
      : ts,
    authorId: 'usr1',
    createdAt: ts,
    updatedAt: ts,
  };
  entries = [entry, ...entries];
  return entry;
}

export async function updateEntry(
  id: string,
  entryId: string,
  values: EntryFormValues,
): Promise<PatientEntryDto> {
  await delay(400);
  const current = entries.find((e) => e.id === entryId && e.patientId === id);
  if (!current) throw new Error(`Entry ${entryId} not found`);
  const updated: PatientEntryDto = {
    ...current,
    type: toEntryType(values.type),
    title: values.title.trim() || null,
    body: values.body.trim() || null,
    occurredAt: values.occurredAt
      ? new Date(values.occurredAt).toISOString()
      : current.occurredAt,
    updatedAt: now(),
  };
  entries = entries.map((e) => (e.id === entryId ? updated : e));
  return updated;
}

export async function deleteEntry(id: string, entryId: string): Promise<void> {
  await delay(350);
  entries = entries.filter((e) => !(e.id === entryId && e.patientId === id));
}

export async function uploadDocument(
  id: string,
  file: File,
  title?: string,
): Promise<PatientEntryDto> {
  await delay(700);
  getOrThrow(id);
  const ts = now();
  const entry: PatientEntryDto = {
    id: `ent-${Math.round(performance.now())}`,
    patientId: id,
    type: PatientEntryType.Document,
    title: (title ?? '').trim() || file.name,
    body: null,
    fileUrl: `private/mock/${file.name}`,
    fileName: file.name,
    occurredAt: ts,
    authorId: 'usr1',
    createdAt: ts,
    updatedAt: ts,
  };
  entries = [entry, ...entries];
  return entry;
}

export async function downloadDocument(
  _id: string,
  _entry: PatientEntryDto,
): Promise<void> {
  await delay(300);
  // No real bytes in mock mode. The page reports a failed download, which is
  // what this is: a demo-only wording would have to live in the production
  // dictionary to be read from there.
  throw new Error('download_failed:mock');
}

export async function fromLead(
  _source: LeadSource,
  _sourceId: string,
): Promise<PatientDto> {
  await delay(500);
  // In mock mode the lead isn't in this store; return the first patient as a
  // stand-in so the "open patient" navigation has a target.
  return { ...patients[0], entryCount: countEntries(patients[0].id) };
}

export async function linkLead(
  id: string,
  _source: LeadSource,
  _sourceId: string,
): Promise<PatientDto> {
  await delay(400);
  return { ...getOrThrow(id), entryCount: countEntries(id) };
}
