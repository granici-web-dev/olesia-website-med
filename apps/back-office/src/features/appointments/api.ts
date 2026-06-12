import type {
  AppointmentDto,
  Paginated,
  ServiceDto,
} from '@olesia/shared';

import { http } from '@/api/http';
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

export async function uploadPlan(id: string): Promise<Appointment> {
  // TODO(api): send the actual file (multipart) once the UI passes it through.
  const [d, codes] = await Promise.all([
    http.post<AppointmentDto>(`/appointments/${id}/plan`),
    serviceCodeMap(),
  ]);
  return toView(d, codes);
}
