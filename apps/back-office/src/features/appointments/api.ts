import type { AppointmentDto, ServiceDto } from '@olesia/shared';

import { http } from '@/api/http';
import { fetchEveryPage, MAX_PAGE_SIZE } from '@/api/list';
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
          new Map(list.map((s) => [s.id, s.code as AppointmentServiceCode])),
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
    rescheduledFromId: d.rescheduledFromId,
  };
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const [rows, codes] = await Promise.all([
    fetchEveryPage<AppointmentDto>((page) =>
      http.get(`/appointments?page=${page}&pageSize=${MAX_PAGE_SIZE}`),
    ),
    serviceCodeMap(),
  ]);
  return rows
    .map((d) => toView(d, codes))
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
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

/** Authenticated, streamed download of the plan attachment. */
export function downloadPlanFile(id: string, fileName: string): Promise<void> {
  return http.download(`/appointments/${id}/plan/file`, fileName || 'plan');
}
