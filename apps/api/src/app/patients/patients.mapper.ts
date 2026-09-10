import type { PatientDto, PatientEntryDto } from '@olesia/shared';
import type { Patient, PatientEntry } from '../../generated/prisma/client';

export function toPatientDto(
  p: Patient,
  extra?: { entryCount?: number },
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
    ...(extra?.entryCount !== undefined ? { entryCount: extra.entryCount } : {}),
  };
}

export function toPatientEntryDto(e: PatientEntry): PatientEntryDto {
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
  };
}
