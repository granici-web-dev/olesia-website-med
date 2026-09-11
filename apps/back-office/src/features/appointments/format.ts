import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type {
  Appointment,
  AppointmentServiceCode,
  AppointmentStatus,
  PaymentStatus,
} from '@/features/appointments/types';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const statusBadgeVariant: Record<AppointmentStatus, BadgeVariant> = {
  scheduled: 'info',
  completed: 'success',
  no_show: 'warning',
  canceled: 'muted',
};

export const paymentBadgeVariant: Record<PaymentStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
};

/** The free orientation call carries no payment (price 0). */
export function isFreeAppointment(a: Appointment): boolean {
  return a.service === 'free_consult';
}

export function serviceLabel(service: AppointmentServiceCode): string {
  return ro.appointments.service[service];
}
