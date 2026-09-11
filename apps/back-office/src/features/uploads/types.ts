/**
 * Patient upload links (client answers v2 §11.14).
 *
 * A link is a capability, not an account: the doctor issues one per
 * appointment, hands it over, and the patient sends analyses through it until
 * it expires. Everything the back office does here is issuing, sending,
 * reading and erasing — the files themselves are never public URLs.
 *
 * Mirrors `UploadLinkDto` / `UploadedDocumentDto` in `packages/shared`.
 */

/**
 * What the link hangs off. Appointments send analyses before a consultation;
 * a group-C order sends whatever the menu or protocol has to be written from.
 * The API keys both off the same table and the routes are symmetric.
 */
export type UploadTarget = 'appointment' | 'order';

export interface UploadedDocument {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  note: string | null;
  uploadedAt: string;
}

export interface UploadLink {
  id: string;
  target: 'appointment' | 'deliverable_order';
  appointmentId: string | null;
  orderId: string | null;
  clientName: string;
  clientEmail: string;
  /** The URL to give the patient. */
  url: string;
  expiresAt: string;
  consentAt: string | null;
  revokedAt: string | null;
  documents: UploadedDocument[];
  createdAt: string;
}
