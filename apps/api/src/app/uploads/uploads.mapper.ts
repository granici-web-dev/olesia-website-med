import type {
  UploadLinkDto,
  UploadSessionDto,
  UploadedDocumentDto,
} from '@olesia/shared';
import type {
  UploadLink,
  UploadedDocument,
} from '../../generated/prisma/client';
import {
  PATIENT_UPLOAD_MAX_BYTES,
  PATIENT_UPLOAD_MIME,
} from '../storage/storage.service';
import { UPLOAD_MAX_FILES } from './uploads.constants';

export function toUploadedDocumentDto(d: UploadedDocument): UploadedDocumentDto {
  return {
    id: d.id,
    fileName: d.fileName,
    mimeType: d.mimeType,
    sizeBytes: d.sizeBytes,
    note: d.note,
    uploadedAt: d.uploadedAt.toISOString(),
  };
}

/** First name only — the upload page greets, it does not identify. */
function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? '';
}

/** What the public page may see. Nothing about the appointment itself. */
export function toUploadSessionDto(
  link: UploadLink & { documents: UploadedDocument[] },
): UploadSessionDto {
  return {
    target: link.target as UploadSessionDto['target'],
    greetingName: firstName(link.clientName),
    expiresAt: link.expiresAt.toISOString(),
    consentAt: link.consentAt ? link.consentAt.toISOString() : null,
    consentVersion: link.consentVersion,
    documents: link.documents.map(toUploadedDocumentDto),
    maxFileBytes: PATIENT_UPLOAD_MAX_BYTES,
    maxFiles: UPLOAD_MAX_FILES,
    acceptedTypes: PATIENT_UPLOAD_MIME,
  };
}

/** Back-office view — includes the URL to hand over and the full name. */
export function toUploadLinkDto(
  link: UploadLink & { documents: UploadedDocument[] },
  url: string,
): UploadLinkDto {
  return {
    id: link.id,
    target: link.target as UploadLinkDto['target'],
    appointmentId: link.appointmentId,
    orderId: link.orderId,
    clientName: link.clientName,
    clientEmail: link.clientEmail,
    url,
    expiresAt: link.expiresAt.toISOString(),
    consentAt: link.consentAt ? link.consentAt.toISOString() : null,
    revokedAt: link.revokedAt ? link.revokedAt.toISOString() : null,
    documents: link.documents.map(toUploadedDocumentDto),
    createdAt: link.createdAt.toISOString(),
  };
}
