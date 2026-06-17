import type {
  AppointmentDto,
  Paginated,
  ServiceDto,
} from '@olesia/shared';

import { API_BASE_URL } from '@/api/config';
import { http, tokenStore } from '@/api/http';
import type {
  Appointment,
  AppointmentServiceCode,
} from '@/features/appointments/types';

/**
 * Real `appointments` endpoints (module_calendly.md §8). Bookings are created
 * by the Calendly webhook; the back office reads them and performs the manual
 * actions (confirm payment, upload plan, mark no-show).
 *
 * The DTO references a service by `serviceId`; the UI uses the service code,
 * so we resolve ids → codes via the services list (cached per session).
 */

let codeMapCache: Promise<Map<string, AppointmentServiceCode>> | null = null;

function serviceCodeMap(): Promise<Map<string, AppointmentServiceCode>> {
  if (!codeMapCache) {
    codeMapCache = http
      .get<ServiceDto[]>('/services')
      .then(
        (list) =>
          new Map(
            list.map((s) => [s.id, s.code as AppointmentServiceCode]),
          ),
      );
  }
  return codeMapCache;
}

function toView(
  d: AppointmentDto,
  codes: Map<string, AppointmentServiceCode>,
): Appointment {
  return {
    id: d.id,
    calendlyEventUri: d.calendlyEventUri,
    service: codes.get(d.serviceId) ?? 'pediatric',
    clientName: d.clientName,
    clientEmail: d.clientEmail,
    reason: d.reason,
    startTime: d.startTime,
    endTime: d.endTime,
    videoUrl: d.videoUrl,
    status: d.status as Appointment['status'],
    paymentStatus: d.paymentStatus as Appointment['paymentStatus'],
    cancelUrl: d.cancelUrl ?? '',
    rescheduleUrl: d.rescheduleUrl ?? '',
    prepSentAt: d.prepSentAt,
    planText: d.planText,
    planFileName: d.planFileName,
    planUploadedAt: d.planUploadedAt,
  };
}

function asList<T>(r: T[] | Paginated<T>): T[] {
  return Array.isArray(r) ? r : r.items;
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const [r, codes] = await Promise.all([
    http.get<AppointmentDto[] | Paginated<AppointmentDto>>(
      '/appointments?pageSize=200',
    ),
    serviceCodeMap(),
  ]);
  return asList(r)
    .map((d) => toView(d, codes))
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
}

export async function confirmPayment(id: string): Promise<Appointment> {
  const [d, codes] = await Promise.all([
    http.patch<AppointmentDto>(`/appointments/${id}`, {
      paymentStatus: 'confirmed',
    }),
    serviceCodeMap(),
  ]);
  return toView(d, codes);
}

export async function markNoShow(id: string): Promise<Appointment> {
  const [d, codes] = await Promise.all([
    http.patch<AppointmentDto>(`/appointments/${id}`, { status: 'no_show' }),
    serviceCodeMap(),
  ]);
  return toView(d, codes);
}

/**
 * Save the written treatment plan (text required) plus an optional attachment.
 * Sent as multipart so the file (if any) rides along; the http client sets the
 * right Content-Type for FormData automatically.
 */
export async function uploadPlan(args: {
  id: string;
  planText: string;
  file: File | null;
}): Promise<Appointment> {
  const form = new FormData();
  form.append('planText', args.planText);
  if (args.file) form.append('file', args.file);

  const [d, codes] = await Promise.all([
    http.post<AppointmentDto>(`/appointments/${args.id}/plan`, form),
    serviceCodeMap(),
  ]);
  return toView(d, codes);
}

/**
 * Authenticated, streamed download of the plan attachment. Fetched with the
 * access token so the private file never touches a public path; the blob is
 * handed to the browser as a save dialog (mirrors patient-document download).
 */
export async function downloadPlanFile(
  id: string,
  fileName: string,
): Promise<void> {
  const token = tokenStore.get();
  const res = await fetch(`${API_BASE_URL}/appointments/${id}/plan/file`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`download_failed:${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'plan';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
