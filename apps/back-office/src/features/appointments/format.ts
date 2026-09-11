import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type {
  AppointmentServiceCode,
  AppointmentStatus,
} from '@/features/appointments/types';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const statusBadgeVariant: Record<AppointmentStatus, BadgeVariant> = {
  scheduled: 'info',
  completed: 'success',
  no_show: 'warning',
  canceled: 'muted',
};

/** The free orientation call carries no payment (price 0). */
export function isFreeService(code: string): boolean {
  return code === 'free_consult';
}

export function serviceLabel(service: AppointmentServiceCode): string {
  return ro.appointments.service[service];
}
