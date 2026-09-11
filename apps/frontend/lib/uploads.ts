/**
 * Patient upload client (browser → NestJS API).
 *
 * The token in the URL is the whole credential — there are no patient accounts
 * (client answers v2 §11.14). Every call carries it and nothing else, and the
 * API answers a bad, expired or revoked token with the same 404, so this module
 * has exactly one failure mode to render: "the link no longer works".
 */

import { normalizeApiBase } from './api-base';

const API_BASE = normalizeApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  'NEXT_PUBLIC_API_URL',
);

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
  /** Which wording was accepted; older than ours means ask again. */
  consentVersion: string | null;
  documents: UploadedDocument[];
  maxFileBytes: number;
  maxFiles: number;
  acceptedTypes: string[];
}

/** Thrown when the API says the link is gone — the page replaces itself. */
export class UploadLinkGone extends Error {
  constructor() {
    super('upload_link_gone');
  }
}

/**
 * Any other refusal, carrying what `describeUploadError` needs to name it.
 * `status` is 0 when the request never reached the API.
 */
export class UploadError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(`upload_failed_${status}${code ? `_${code}` : ''}`);
  }
}

async function parse(res: Response): Promise<UploadSession> {
  if (res.status === 404) throw new UploadLinkGone();
  if (!res.ok) {
    // Surface the API's machine code alongside the status: 413 arrives from a
    // proxy with no body at all, and `file_too_large` from our own filter.
    let code = '';
    try {
      const body = (await res.json()) as { message?: string | string[] };
      const m = Array.isArray(body.message) ? body.message[0] : body.message;
      if (typeof m === 'string') code = m;
    } catch {
      /* a proxy answering with HTML; the status is all there is */
    }
    throw new UploadError(res.status, code);
  }
  return (await res.json()) as UploadSession;
}

/** `fetch` rejects only when the request never happened: offline, DNS, CORS. */
async function send(path: string, init?: RequestInit): Promise<UploadSession> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new UploadError(0, '');
  }
  return parse(res);
}

export function fetchUploadSession(token: string): Promise<UploadSession> {
  return send(`/uploads/${token}`, { cache: 'no-store' });
}

export function acceptUploadConsent(token: string): Promise<UploadSession> {
  return send(`/uploads/${token}/consent`, { method: 'POST' });
}

/**
 * Refuse a file the API would refuse, before it goes over the wire.
 *
 * A patient on a phone uploading a 40 MB photo waited for the whole transfer
 * and then read "too large" (audit A6, F15). The session already carries the
 * limit and the accepted types, so the same answer costs nothing here.
 *
 * @returns the machine code the API would have answered with, or null.
 */
export function rejectedBeforeSending(
  file: File,
  session: UploadSession,
): 'file_too_large' | 'unsupported_file_type' | 'too_many_files' | null {
  if (session.documents.length >= session.maxFiles) return 'too_many_files';
  if (file.size > session.maxFileBytes) return 'file_too_large';
  // The browser's type for an unrecognised extension is '', which the API
  // sniffs and decides on for itself — let those through rather than guess.
  if (file.type && !session.acceptedTypes.includes(file.type)) {
    return 'unsupported_file_type';
  }
  return null;
}

export function uploadPatientFile(
  token: string,
  file: File,
  note?: string,
): Promise<UploadSession> {
  const body = new FormData();
  body.append('file', file);
  if (note?.trim()) body.append('note', note.trim());
  return send(`/uploads/${token}/documents`, { method: 'POST', body });
}

export function deletePatientFile(
  token: string,
  documentId: string,
): Promise<UploadSession> {
  return send(`/uploads/${token}/documents/${documentId}`, {
    method: 'DELETE',
  });
}
