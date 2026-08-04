/**
 * Patient upload client (browser → NestJS API).
 *
 * The token in the URL is the whole credential — there are no patient accounts
 * (client answers v2 §11.14). Every call carries it and nothing else, and the
 * API answers a bad, expired or revoked token with the same 404, so this module
 * has exactly one failure mode to render: "the link no longer works".
 */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api'
).replace(/\/+$/, '');

export interface UploadedDocument {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  note: string | null;
  uploadedAt: string;
}

export interface UploadSession {
  target: 'appointment' | 'deliverable_order';
  greetingName: string;
  expiresAt: string;
  consentAt: string | null;
  documents: UploadedDocument[];
  maxFileBytes: number;
  maxFiles: number;
  acceptedTypes: string[];
}

/** Thrown when the API says the link is gone — the only expected failure. */
export class UploadLinkGone extends Error {
  constructor() {
    super('upload_link_gone');
  }
}

async function parse(res: Response): Promise<UploadSession> {
  if (res.status === 404) throw new UploadLinkGone();
  if (!res.ok) {
    // Surface the API's machine code so the page can pick its own wording
    // (too_many_files, file_too_large, unsupported_file_type, …).
    let code = `upload_failed_${res.status}`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      const m = Array.isArray(body.message) ? body.message[0] : body.message;
      if (m) code = m;
    } catch {
      /* keep the status-based code */
    }
    throw new Error(code);
  }
  return (await res.json()) as UploadSession;
}

export function fetchUploadSession(token: string): Promise<UploadSession> {
  return fetch(`${API_BASE}/uploads/${token}`, { cache: 'no-store' }).then(parse);
}

export function acceptUploadConsent(token: string): Promise<UploadSession> {
  return fetch(`${API_BASE}/uploads/${token}/consent`, {
    method: 'POST',
  }).then(parse);
}

export function uploadPatientFile(
  token: string,
  file: File,
  note?: string,
): Promise<UploadSession> {
  const body = new FormData();
  body.append('file', file);
  if (note?.trim()) body.append('note', note.trim());
  return fetch(`${API_BASE}/uploads/${token}/documents`, {
    method: 'POST',
    body,
  }).then(parse);
}

export function deletePatientFile(
  token: string,
  documentId: string,
): Promise<UploadSession> {
  return fetch(`${API_BASE}/uploads/${token}/documents/${documentId}`, {
    method: 'DELETE',
  }).then(parse);
}
