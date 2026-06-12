import { CheckCircle2, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type {
  TicketBucket,
  PaymentStatus,
} from '@/features/quick-questions/types';
import {
  bucketBadgeVariant,
  paymentBadgeVariant,
} from '@/features/quick-questions/data';

export function StatusBadge({ bucket }: { bucket: TicketBucket }) {
  return (
    <Badge variant={bucketBadgeVariant[bucket]}>
      {ro.quickQuestions.status[bucket]}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const Icon = status === 'confirmed' ? CheckCircle2 : Clock;
  return (
    <Badge variant={paymentBadgeVariant[status]}>
      <Icon />
      {ro.quickQuestions.payment[status]}
    </Badge>
  );
}
