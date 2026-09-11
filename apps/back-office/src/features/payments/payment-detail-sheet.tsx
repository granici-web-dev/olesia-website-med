import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  RotateCcw,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SectionTitle } from '@/components/common/detail-section';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PaymentConfirmationCell } from '@/features/payments/confirmation-cell';
import { MaterialGrantPanel } from '@/features/payments/material-grant-panel';
import { useAuth } from '@/auth/auth-context';
import { patientDetailPath } from '@/config/routes';
import { ro } from '@/i18n/ro';

import { PaymentStateBadge } from '@/features/payments/state-badge';
import { RefundForm } from '@/features/payments/refund-form';
import { formatAmount, formatDateTime } from '@/lib/format';
import { refundPayment, syncPayment } from '@/features/payments/api';
import { paymentsQueryKey } from '@/features/payments/query-key';
import type { Payment } from '@/features/payments/types';

const t = ro.payments;

/** A bank reference: label left, monospace value right. */
function Ref({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-[13px] tabular-nums">{value}</span>
    </div>
  );
}

export function PaymentDetailSheet({
  payment,
  open,
  onOpenChange,
}: {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [refunding, setRefunding] = React.useState(false);

  // Close the refund form whenever a different payment is shown, so it can
  // never carry a half-typed reason onto someone else's money.
  React.useEffect(() => setRefunding(false), [payment?.id]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: paymentsQueryKey });

  const syncMutation = useMutation({
    mutationFn: syncPayment,
    onSuccess: () => {
      toast.success(t.toast.synced);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const refundMutation = useMutation({
    mutationFn: refundPayment,
    onSuccess: () => {
      toast.success(t.toast.refunded);
      setRefunding(false);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const p = payment;
  const remaining = p ? p.amount - p.refundedAmount : 0;
  // Only money that actually arrived and has not fully gone back can be sent
  // back, and only an admin may send it.
  const canRefund =
    !!p &&
    hasRole(['admin']) &&
    !!p.paymentId &&
    (p.state === 'paid' || p.state === 'partially_refunded') &&
    remaining > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-lg"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{t.detail.title}</SheetTitle>
        </SheetHeader>

        {p && (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <PaymentStateBadge state={p.state} />
              {p.method && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CreditCard className="size-3.5" />
                  {p.method}
                </span>
              )}
            </div>

            {/* The amount is the headline: it is what this record is about. */}
            <div>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">
                {formatAmount(p.amount, p.currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.target[p.targetType]} ·{' '}
                {p.paidAt
                  ? `${t.detail.paidAt} ${formatDateTime(p.paidAt)}`
                  : p.failedAt
                    ? `${t.detail.failedAt} ${formatDateTime(p.failedAt)}`
                    : `${t.detail.startedAt} ${formatDateTime(p.createdAt)}`}
              </p>
              {p.refundedAmount > 0 && (
                <p className="mt-1 text-sm text-info">
                  {formatAmount(p.refundedAmount, p.currency)}{' '}
                  {t.detail.refundedOf} {formatAmount(p.amount, p.currency)}
                </p>
              )}
              {/* Also here, not only in the ledger's column: that column is
                  hidden below `lg`, and whether a client was ever told their
                  money arrived is not a desktop-only question. */}
              {p.state === 'paid' && (
                <div className="mt-2">
                  <PaymentConfirmationCell payment={p} />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <SectionTitle>{t.detail.payer}</SectionTitle>
              {p.payerName && <p className="font-medium">{p.payerName}</p>}
              <a
                href={`mailto:${p.payerEmail}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                <Mail className="size-3.5" />
                {p.payerEmail}
              </a>
              {p.payerPhone && (
                <a
                  href={`tel:${p.payerPhone}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  <Phone className="size-3.5" />
                  {p.payerPhone}
                </a>
              )}
              {p.patientId ? (
                <Link
                  to={patientDetailPath(p.patientId)}
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                >
                  <UserRound className="size-3.5" />
                  {t.detail.openPatient}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t.detail.unlinked}
                </p>
              )}
            </div>

            <Separator />

            {/* Everything support and the bank will ask for, in one place. */}
            <div className="space-y-1.5">
              <SectionTitle>{t.detail.bank}</SectionTitle>
              <Ref label={t.detail.orderRef} value={p.orderId} />
              <Ref label={t.detail.card} value={p.cardMask} />
              <Ref label={t.detail.rrn} value={p.rrn} />
              <Ref label={t.detail.approval} value={p.approvalCode} />
              <Ref label={t.detail.threeDs} value={p.threeDsResult} />
              <Ref label={t.detail.terminal} value={p.terminalId} />
            </div>

            {/* Above the refunds, because a refund revokes the grant: the
                two are the same subject read in opposite directions, and the
                link is what an operator opened this sheet for. */}
            <MaterialGrantPanel payment={p} />

            <div className="space-y-2">
              <SectionTitle>{t.detail.refunds}</SectionTitle>
              {p.refunds.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t.detail.noRefunds}
                </p>
              ) : (
                <ul className="space-y-2">
                  {p.refunds.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-lg border bg-background px-3 py-2.5"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium tabular-nums">
                          {formatAmount(r.amount, r.currency)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(r.executedAt ?? r.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                        {r.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Separator />

            {refunding && canRefund ? (
              <RefundForm
                payment={p}
                pending={refundMutation.isPending}
                onCancel={() => setRefunding(false)}
                onSubmit={(amount, reason) =>
                  refundMutation.mutate({ id: p.id, amount, reason })
                }
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => syncMutation.mutate(p.id)}
                  disabled={syncMutation.isPending}
                >
                  {syncMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <RefreshCw />
                  )}
                  {t.actions.sync}
                </Button>
                {canRefund && (
                  <Button variant="outline" onClick={() => setRefunding(true)}>
                    <RotateCcw />
                    {t.actions.refund}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
