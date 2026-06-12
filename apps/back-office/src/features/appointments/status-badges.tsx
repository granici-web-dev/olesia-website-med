import { CheckCircle2, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type {
  AppointmentStatus,
  PaymentStatus,
} from '@/features/appointments/types';
import {
  statusBadgeVariant,
  paymentBadgeVariant,
} from '@/features/appointments/data';

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={statusBadgeVariant[status]}>
      {ro.appointments.status[status]}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const Icon = status === 'confirmed' ? CheckCircle2 : Clock;
  return (
    <Badge variant={paymentBadgeVariant[status]}>
      <Icon />
      {ro.appointments.payment[status]}
    </Badge>
  );
}
