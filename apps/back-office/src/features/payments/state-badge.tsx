import {
  Ban,
  Check,
  CircleDashed,
  Clock,
  RotateCcw,
  TimerOff,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import { stateBadgeVariant } from '@/features/payments/format';
import type { PaymentState } from '@/features/payments/types';

const STATE_ICON = {
  created: CircleDashed,
  pending: Clock,
  paid: Check,
  failed: X,
  expired: TimerOff,
  abandoned: CircleDashed,
  cancelled: Ban,
  refunded: RotateCcw,
  partially_refunded: RotateCcw,
} as const;

export function PaymentStateBadge({ state }: { state: PaymentState }) {
  const Icon = STATE_ICON[state];
  return (
    <Badge variant={stateBadgeVariant[state]}>
      <Icon />
      {ro.payments.state[state]}
    </Badge>
  );
}
