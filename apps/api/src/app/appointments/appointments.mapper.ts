import type { AppointmentDto } from '@olesia/shared';
import type { Appointment } from '../../generated/prisma/client';

/** Map a Prisma `Appointment` row to the shared API DTO. */
export function toAppointmentDto(a: Appointment): AppointmentDto {
  return {
    id: a.id,
    serviceId: a.serviceId,
    calendlyEventUri: a.calendlyEventUri,
    clientName: a.clientName,
    clientEmail: a.clientEmail,
    reason: a.reason,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    videoUrl: a.videoUrl,
    status: a.status as AppointmentDto['status'],
    paymentStatus: a.paymentStatus as AppointmentDto['paymentStatus'],
    cancelUrl: a.cancelUrl,
    rescheduleUrl: a.rescheduleUrl,
    prepSentAt: a.prepSentAt ? a.prepSentAt.toISOString() : null,
    planText: a.planText,
    // Expose only the filename — never the private storage key.
    planFileName: a.planFileName,
    planUploadedAt: a.planUploadedAt ? a.planUploadedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}
