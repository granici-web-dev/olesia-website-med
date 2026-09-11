import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type { AppointmentStatus } from '@/features/appointments/types';
import { statusBadgeVariant } from '@/features/appointments/format';

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={statusBadgeVariant[status]}>
      {ro.appointments.status[status]}
    </Badge>
  );
}
