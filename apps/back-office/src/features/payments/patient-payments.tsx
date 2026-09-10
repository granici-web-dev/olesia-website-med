import { useQuery } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { ro } from '@/i18n/ro';

import { PaymentStateBadge } from '@/features/payments/state-badge';
import {
  fetchPatientPayments,
  formatAmount,
  formatDateTime,
} from '@/features/payments/data';
import { patientPaymentsQueryKey } from '@/features/payments/query-key';

const t = ro.payments;

/**
 * One patient's payment history, for the patient sheet.
 *
 * The API matches on the patient link *and* on the payer email, so a fișă
 * created after the first payment still shows everything that person ever
 * paid — the history does not restart when the record does.
 *
 * A list, not a table: this sits inside a narrow panel next to the clinical
 * record, and three columns would fight the page for width.
 */
export function PatientPayments({ patientId }: { patientId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: patientPaymentsQueryKey(patientId),
    queryFn: () => fetchPatientPayments(patientId),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-muted-foreground">{ro.states.errorBody}</p>;
  }

  const payments = data ?? [];
  if (payments.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CreditCard className="size-4" />
        {t.patientSection.empty}
      </p>
    );
  }

  // Only money that stayed. A refunded payment is history, not income, so
  // counting it in the total would overstate what this patient has spent.
  const settled = payments.filter((p) => p.state === 'paid' || p.state === 'partially_refunded');
  const currency = settled[0]?.currency;
  const total = settled.reduce((sum, p) => sum + p.amount - p.refundedAmount, 0);
  const singleCurrency = settled.every((p) => p.currency === currency);

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {payments.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border bg-background px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="font-medium">{t.target[p.targetType]}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatDateTime(p.paidAt ?? p.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium tabular-nums">
                {formatAmount(p.amount, p.currency)}
              </span>
              <PaymentStateBadge state={p.state} />
            </div>
          </li>
        ))}
      </ul>

      {settled.length > 0 && singleCurrency && (
        <p className="text-sm text-muted-foreground">
          {t.patientSection.total}{' '}
          <span className="font-medium text-foreground tabular-nums">
            {formatAmount(total, currency!)}
          </span>
        </p>
      )}
    </div>
  );
}
