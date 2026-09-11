import type { UploadLink, UploadTarget } from '@/features/uploads/types';

/* Used only when `VITE_API_MOCKS === 'true'`; the real API is in `api.ts`.
   Invented people, as everywhere in the mocks. */

const DAY = 24 * 60 * 60 * 1000;

let store: UploadLink[] = [
  {
    id: 'ul1',
    target: 'appointment',
    appointmentId: 'a1',
    orderId: null,
    clientName: 'Maria Ionescu',
    clientEmail: 'maria.ionescu@gmail.com',
    url: 'http://localhost:3000/ro/incarcare/exemplu-token-demonstrativ',
    expiresAt: new Date(Date.now() + 25 * DAY).toISOString(),
    consentAt: new Date(Date.now() - 2 * DAY).toISOString(),
    revokedAt: null,
    documents: [
      {
        id: 'ud1',
        fileName: 'hemoleucograma.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 284_112,
        note: 'Analize din 12 mai',
        uploadedAt: new Date(Date.now() - 2 * DAY).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3 * DAY).toISOString(),
  },
];

function clone(l: UploadLink): UploadLink {
  return { ...l, documents: l.documents.map((d) => ({ ...d })) };
}

export async function fetchUploadLinks(
  _target: UploadTarget,
  id: string,
): Promise<UploadLink[]> {
  return store.filter((l) => l.appointmentId === id).map(clone);
}

export async function issueUploadLink(
  _target: UploadTarget,
  appointmentId: string,
): Promise<UploadLink> {
  const existing = store.find((l) => l.appointmentId === appointmentId);
  const expiresAt = new Date(Date.now() + 30 * DAY).toISOString();
  if (existing) {
    existing.expiresAt = expiresAt;
    existing.revokedAt = null;
    return clone(existing);
  }
  const created: UploadLink = {
    id: crypto.randomUUID(),
    target: 'appointment',
    appointmentId,
    orderId: null,
    clientName: 'Pacient',
    clientEmail: 'pacient@example.com',
    url: `http://localhost:3000/ro/incarcare/${crypto.randomUUID()}`,
    expiresAt,
    consentAt: null,
    revokedAt: null,
    documents: [],
    createdAt: new Date().toISOString(),
  };
  store = [created, ...store];
  return clone(created);
}

/** The mock has no mailer either — same honest `false` as the real service. */
export async function sendUploadLink(): Promise<{ sent: boolean }> {
  return { sent: false };
}

export async function revokeUploadLink(id: string): Promise<UploadLink> {
  const link = store.find((l) => l.id === id);
  if (!link) throw new Error('not_found');
  link.revokedAt = new Date().toISOString();
  return clone(link);
}

export async function deleteUploadedDocument(
  documentId: string,
): Promise<void> {
  for (const l of store) {
    l.documents = l.documents.filter((d) => d.id !== documentId);
  }
}

export async function downloadUploadedDocument(): Promise<void> {
  // Nothing to stream in mock mode.
}
