import type { UploadLinkDto } from '@olesia/shared';

import { API_BASE_URL } from '@/api/config';
import { http, tokenStore } from '@/api/http';
import type { UploadLink } from '@/features/uploads/types';

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
  appointmentId: string,
): Promise<UploadLink[]> {
  const r = await http.get<UploadLinkDto[]>(
    `/upload-links/appointment/${appointmentId}`,
  );
  return r.map(toView);
}

/** Issue or extend the link. Re-issuing keeps the same URL and its files. */
export async function issueUploadLink(
  appointmentId: string,
): Promise<UploadLink> {
  return toView(
    await http.post<UploadLinkDto>(
      `/upload-links/appointment/${appointmentId}`,
      {},
    ),
  );
}

/** `sent: false` means SMTP is not configured — the caller must say so. */
export async function sendUploadLink(id: string): Promise<{ sent: boolean }> {
  return http.post<{ sent: boolean }>(`/upload-links/${id}/send`, {});
}

export async function revokeUploadLink(id: string): Promise<UploadLink> {
  return toView(await http.post<UploadLinkDto>(`/upload-links/${id}/revoke`, {}));
}

export async function deleteUploadedDocument(
  documentId: string,
): Promise<void> {
  await http.del<void>(`/upload-links/documents/${documentId}`);
}

/**
 * Authenticated streamed download — medical files have no public URL, so this
 * fetches with the bearer token and hands the browser a blob.
 */
export async function downloadUploadedDocument(
  documentId: string,
  fileName: string,
): Promise<void> {
  const token = tokenStore.get();
  const res = await fetch(`${API_BASE_URL}/upload-links/documents/${documentId}`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`download_failed:${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'document';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
