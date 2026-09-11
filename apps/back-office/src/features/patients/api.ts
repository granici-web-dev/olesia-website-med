import type { Paginated } from '@olesia/shared';

import { http, tokenStore } from '@/api/http';
import { asList } from '@/api/list';
import { API_BASE_URL } from '@/api/config';
import type {
  EntryFormValues,
  LeadSource,
  PatientDto,
  PatientEntryDto,
  PatientErasureReportDto,
  PatientFormValues,
  PatientTimeline,
} from '@/features/patients/types';

/**
 * Real `patients` endpoints (module_patients.md). All routes are staff-only
 * (`@Roles(admin, editor)`); the access token is attached by the http client.
 * Medical documents are streamed from an authenticated endpoint, never the
 * public `/uploads` path.
 */

/** Form values → API payload (empty strings collapse to null/undefined). */
function toPayload(v: PatientFormValues) {
  return {
    fullName: v.fullName.trim(),
    email: v.email.trim(),
    phone: v.phone.trim() || null,
    birthDate: v.birthDate ? new Date(v.birthDate).toISOString() : null,
    gender: v.gender || null,
    notes: v.notes.trim() || null,
  };
}

function toEntryPayload(v: EntryFormValues) {
  return {
    type: v.type,
    title: v.title.trim() || null,
    body: v.body.trim() || null,
    occurredAt: v.occurredAt ? new Date(v.occurredAt).toISOString() : undefined,
  };
}

/* --------------------------------- reads -------------------------------- */

/**
 * One page of the dossier list, searched on the server.
 *
 * The panel used to pull `pageSize=200` and filter in the browser, which made
 * every visit to `/pacienti` a download of every patient's name, address and
 * date of birth so that a substring could be matched locally — and still lost
 * the 201st record, because 200 is the API's ceiling. The server has the
 * `?search=` this needs; it was written and never called.
 */
export async function fetchPatients(query: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<Paginated<PatientDto>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });
  if (query.search?.trim()) params.set('search', query.search.trim());
  return asList(
    await http.get<PatientDto[] | Paginated<PatientDto>>(
      `/patients?${params.toString()}`,
    ),
  );
}

export function fetchPatient(id: string): Promise<PatientDto> {
  return http.get<PatientDto>(`/patients/${id}`);
}

export function fetchTimeline(id: string): Promise<PatientTimeline> {
  return http.get<PatientTimeline>(`/patients/${id}/timeline`);
}

/* ------------------------------- mutations ------------------------------ */

export function createPatient(values: PatientFormValues): Promise<PatientDto> {
  return http.post<PatientDto>('/patients', toPayload(values));
}

export function updatePatient(
  id: string,
  values: PatientFormValues,
): Promise<PatientDto> {
  return http.patch<PatientDto>(`/patients/${id}`, toPayload(values));
}

/** GDPR erasure. Answers with what it erased, table by table (audit A3, F1). */
export function deletePatient(id: string): Promise<PatientErasureReportDto> {
  return http.del<PatientErasureReportDto>(`/patients/${id}`);
}

export function setConsent(id: string): Promise<PatientDto> {
  return http.patch<PatientDto>(`/patients/${id}`, {
    consentAt: new Date().toISOString(),
  });
}

export function addEntry(
  id: string,
  values: EntryFormValues,
): Promise<PatientEntryDto> {
  return http.post<PatientEntryDto>(
    `/patients/${id}/entries`,
    toEntryPayload(values),
  );
}

export function updateEntry(
  id: string,
  entryId: string,
  values: EntryFormValues,
): Promise<PatientEntryDto> {
  return http.patch<PatientEntryDto>(
    `/patients/${id}/entries/${entryId}`,
    toEntryPayload(values),
  );
}

export function deleteEntry(id: string, entryId: string): Promise<void> {
  return http.del<void>(`/patients/${id}/entries/${entryId}`);
}

export function uploadDocument(
  id: string,
  file: File,
  title?: string,
): Promise<PatientEntryDto> {
  const form = new FormData();
  form.append('file', file);
  if (title?.trim()) form.append('title', title.trim());
  return http.post<PatientEntryDto>(`/patients/${id}/documents`, form);
}

/**
 * Authenticated, streamed download. Fetched with the access token so it never
 * touches the public `/uploads` static path; the blob is handed to the browser
 * as a save dialog.
 */
export async function downloadDocument(
  id: string,
  entry: PatientEntryDto,
): Promise<void> {
  const token = tokenStore.get();
  const res = await fetch(`${API_BASE_URL}/patients/${id}/documents/${entry.id}`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`download_failed:${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = entry.fileName ?? 'document';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Create a dossier from a lead. Throws `ApiError` 409 when the address
 * already has one — `details` then carries the candidate, and the caller
 * offers linking instead of quietly merging two people (audit A3, F4).
 */
export function fromLead(
  source: LeadSource,
  sourceId: string,
): Promise<PatientDto> {
  return http.post<PatientDto>('/patients/from-lead', { source, sourceId });
}

/** Attach the lead to a dossier the operator picked, after that 409. */
export function linkLead(
  id: string,
  source: LeadSource,
  sourceId: string,
): Promise<PatientDto> {
  return http.post<PatientDto>(`/patients/${id}/link-lead`, {
    source,
    sourceId,
  });
}
