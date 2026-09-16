import type {
  PatientDto,
  PatientEntryDto,
  PatientEntrySendDto,
} from '@olesia/shared';
import type { Patient, Prisma } from '../../generated/prisma/client';
import type { Locale } from '../../generated/prisma/enums';

/** What every entry read loads, so no response can omit its send history. */
export const ENTRY_INCLUDE = {
  sends: {
    orderBy: { sentAt: 'desc' },
    include: { sentBy: { select: { name: true } } },
  },
} as const satisfies Prisma.PatientEntryInclude;

type PatientEntryRow = Prisma.PatientEntryGetPayload<{
  include: typeof ENTRY_INCLUDE;
}>;

export function toPatientDto(
  p: Patient,
  extra?: { entryCount?: number; lastKnownLocale?: Locale | null },
): PatientDto {
  return {
    id: p.id,
    fullName: p.fullName,
    email: p.email,
    phone: p.phone,
    birthDate: p.birthDate ? p.birthDate.toISOString() : null,
    gender: p.gender,
    notes: p.notes,
    consentAt: p.consentAt ? p.consentAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    ...(extra?.entryCount !== undefined
      ? { entryCount: extra.entryCount }
      : {}),
    ...(extra?.lastKnownLocale !== undefined
      ? {
          lastKnownLocale:
            extra.lastKnownLocale as PatientDto['lastKnownLocale'],
        }
      : {}),
  };
}

export function toPatientEntryDto(e: PatientEntryRow): PatientEntryDto {
  return {
    id: e.id,
    patientId: e.patientId,
    type: e.type as PatientEntryDto['type'],
    title: e.title,
    body: e.body,
    fileUrl: e.fileUrl,
    fileName: e.fileName,
    occurredAt: e.occurredAt.toISOString(),
    authorId: e.authorId,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    sends: e.sends.map(toPatientEntrySendDto),
  };
}

function toPatientEntrySendDto(
  send: PatientEntryRow['sends'][number],
): PatientEntrySendDto {
  return {
    id: send.id,
    sentAt: send.sentAt.toISOString(),
    toEmail: send.toEmail,
    locale: send.locale as PatientEntrySendDto['locale'],
    fileName: send.fileName,
    sentByName: send.sentBy?.name ?? null,
  };
}
