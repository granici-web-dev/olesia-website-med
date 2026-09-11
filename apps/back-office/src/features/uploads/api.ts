import type { UploadLinkDto } from '@olesia/shared';

import { http } from '@/api/http';
import type { UploadLink, UploadTarget } from '@/features/uploads/types';

/** Real `upload-links` endpoints — the staff half of §11.14. */

function toView(d: UploadLinkDto): UploadLink {
  return {
    id: d.id,
    target: d.target as UploadLink['target'],
    appointmentId: d.appointmentId,
    orderId: d.orderId,
    clientName: d.clientName,
    clientEmail: d.clientEmail,
    url: d.url,
    expiresAt: d.expiresAt,
    consentAt: d.consentAt,
    revokedAt: d.revokedAt,
    documents: d.documents,
    createdAt: d.createdAt,
  };
}

export async function fetchUploadLinks(
  target: UploadTarget,
  id: string,
): Promise<UploadLink[]> {
  const r = await http.get<UploadLinkDto[]>(`/upload-links/${target}/${id}`);
  return r.map(toView);
}

/** Issue or extend the link. Re-issuing keeps the same URL and its files. */
export async function issueUploadLink(
  target: UploadTarget,
  id: string,
): Promise<UploadLink> {
  return toView(
    await http.post<UploadLinkDto>(`/upload-links/${target}/${id}`, {}),
  );
}

/** `sent: false` means SMTP is not configured — the caller must say so. */
export async function sendUploadLink(id: string): Promise<{ sent: boolean }> {
  return http.post<{ sent: boolean }>(`/upload-links/${id}/send`, {});
}

export async function revokeUploadLink(id: string): Promise<UploadLink> {
  return toView(
    await http.post<UploadLinkDto>(`/upload-links/${id}/revoke`, {}),
  );
}

export async function deleteUploadedDocument(
  documentId: string,
): Promise<void> {
  await http.del<void>(`/upload-links/documents/${documentId}`);
}

/** Authenticated streamed download of a document a patient uploaded. */
export function downloadUploadedDocument(
  documentId: string,
  fileName: string,
): Promise<void> {
  return http.download(
    `/upload-links/documents/${documentId}`,
    fileName || 'document',
  );
}
