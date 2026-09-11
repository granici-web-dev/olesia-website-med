import { Check, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type { PaymentStatus } from '@/types';

/**
 * Whether the money arrived.
 *
 * `paymentStatus` mirrors the `Payment` ledger on every kind of row an
 * appointment, a subscription, a ticket, an order, so there is one state and
 * one pair of words for it. There used to be five variant maps, four badge
 * components, three copies of the type and two different vocabularies: an
 * appointment was "În așteptare / Confirmată" and an order "Neachitată /
 * Achitată", which read as two different things about the same field. The
 * client is told "achitat" or "neachitat", so that is what the panel says
 * (audit A10, simplify 9).
 */
const VARIANT = {
  pending: 'warning',
  confirmed: 'success',
} as const;

const ICON = {
  pending: Clock,
  confirmed: Check,
} as const;

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const Icon = ICON[status];
  return (
    <Badge variant={VARIANT[status]}>
      <Icon />
      {ro.payment[status]}
    </Badge>
  );
}
