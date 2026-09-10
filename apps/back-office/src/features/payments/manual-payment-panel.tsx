import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Loader2, Plus, Wallet } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/auth/auth-context';
import { ro } from '@/i18n/ro';
import { PaymentStateBadge } from '@/features/payments/state-badge';
import {
  fetchTargetPayments,
  formatAmount,
  formatDateTime,
  recordManualPayment,
  voidPayment,
} from '@/features/payments/data';
import { targetPaymentsQueryKey } from '@/features/payments/query-key';
import type { Payment, PaymentTargetType } from '@/features/payments/types';

const t = ro.payments.manual;

/**
 * The payments recorded against one purchase, and the way to add one by hand.
 *
 * It replaces the "mark paid / mark unpaid" switch that sat on a consultation,
 * a subscription and an order. That switch wrote `paymentStatus` directly,
 * which the API documents as a mirror of the payments ledger — so "confirmed"
 * meant either "the bank told us" or "somebody clicked", and nothing recorded
 * which, how much, when, or who. Recording a real row costs one more field and
 * answers all four.
 *
 * Admin only, like the refund it sits next to: this is the one way to declare
 * money received without a bank agreeing. An editor sees the ledger and the
 * reason the button is not there.
 */
export function ManualPaymentPanel({
  targetType,
  targetId,
  currency,
  suggestedAmount,
  onRecorded,
}: {
  targetType: PaymentTargetType;
  targetId: string;
  currency: string;
  /** The catalog price, pre-filled into the form. The operator can correct it. */
  suggestedAmount?: number;
  /** Refresh whatever list shows the purchase's own payment badge. */
  onRecorded: () => void;
}) {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['admin']);
  const [recording, setRecording] = React.useState(false);

  const queryKey = targetPaymentsQueryKey(targetType, targetId);
  const payments = useQuery({
    queryKey,
    queryFn: () => fetchTargetPayments(targetType, targetId),
  });

  // A half-typed amount must never follow the sheet onto another purchase.
  React.useEffect(() => setRecording(false), [targetId]);

  const settled = () => {
    queryClient.invalidateQueries({ queryKey });
    onRecorded();
  };

  const recordMutation = useMutation({
    mutationFn: recordManualPayment,
    onSuccess: () => {
      toast.success(t.toast.recorded);
      setRecording(false);
      settled();
    },
    onError: () => toast.error(ro.payments.toast.error),
  });

  const voidMutation = useMutation({
    mutationFn: voidPayment,
    onSuccess: () => {
      toast.success(t.toast.voided);
      settled();
    },
    onError: () => toast.error(ro.payments.toast.error),
  });

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
        {t.title}
      </p>
      <p className="text-sm text-muted-foreground text-pretty">{t.hint}</p>

      {payments.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      ) : payments.isError ? (
        <p className="text-sm text-destructive">{t.loadError}</p>
      ) : payments.data.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
          {t.empty}
        </p>
      ) : (
        <ul className="space-y-2">
          {payments.data.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              canVoid={isAdmin}
              voiding={
                voidMutation.isPending && voidMutation.variables === payment.id
              }
              onVoid={() => voidMutation.mutate(payment.id)}
            />
          ))}
        </ul>
      )}

      {!isAdmin ? (
        <p className="text-xs text-muted-foreground">{t.onlyAdmin}</p>
      ) : recording ? (
        <ManualPaymentForm
          currency={currency}
          suggestedAmount={suggestedAmount}
          pending={recordMutation.isPending}
          onCancel={() => setRecording(false)}
          onSubmit={(amount, note) =>
            recordMutation.mutate({
              targetType,
              targetId,
              amount,
              currency,
              note: note || undefined,
            })
          }
        />
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setRecording(true)}
        >
          <Plus />
          {t.record}
        </Button>
      )}
    </div>
  );
}

/* ------------------------------- one row ------------------------------- */

function PaymentRow({
  payment,
  canVoid,
  voiding,
  onVoid,
}: {
  payment: Payment;
  canVoid: boolean;
  voiding: boolean;
  onVoid: () => void;
}) {
  const isManual = payment.method === 'manual';
  // Only a manual record can be taken back. A bank payment is undone by
  // refunding it, on the Plăți page, where the money actually moves.
  const voidable = canVoid && isManual && payment.state !== 'cancelled';

  return (
    <li className="rounded-lg border bg-background px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium tabular-nums">
          {formatAmount(payment.amount, payment.currency)}
        </span>
        <div className="flex items-center gap-1.5">
          {isManual && (
            <Badge variant="muted" className="gap-1">
              <Wallet />
              {t.manualBadge}
            </Badge>
          )}
          <PaymentStateBadge state={payment.state} />
        </div>
      </div>

      <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
        {formatDateTime(payment.paidAt ?? payment.createdAt)}
      </p>

      {payment.note && (
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-pretty">
          {payment.note}
        </p>
      )}

      {voidable && (
        <VoidPayment pending={voiding} onConfirm={onVoid} />
      )}
    </li>
  );
}

function VoidPayment({
  pending,
  onConfirm,
}: {
  pending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          className="mt-1.5 -ml-2 h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {pending ? <Loader2 className="animate-spin" /> : <Ban />}
          {t.voidAction}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.voidTitle}</AlertDialogTitle>
          <AlertDialogDescription>{t.voidBody}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{ro.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {t.voidCta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* -------------------------------- form -------------------------------- */

function ManualPaymentForm({
  currency,
  suggestedAmount,
  pending,
  onSubmit,
  onCancel,
}: {
  currency: string;
  suggestedAmount?: number;
  pending: boolean;
  onSubmit: (amount: number, note: string) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = React.useState(
    suggestedAmount ? suggestedAmount.toFixed(2) : '',
  );
  const [note, setNote] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  // A Romanian keyboard puts a comma on the decimal key, and the doctor types
  // "1200,50" without thinking about it.
  const parsed = Number(amount.replace(',', '.'));
  const valid = Number.isFinite(parsed) && parsed > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (valid && !pending) onSubmit(parsed, note.trim());
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-lg border bg-background p-4"
    >
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
        {t.formTitle}
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="manual-amount">{t.amount}</Label>
        <Input
          id="manual-amount"
          inputMode="decimal"
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={touched && !valid}
          aria-describedby="manual-amount-hint"
          className="tabular-nums"
        />
        <p
          id="manual-amount-hint"
          className={
            touched && !valid
              ? 'text-xs text-destructive'
              : 'text-xs text-muted-foreground'
          }
        >
          {touched && !valid ? t.amountError : `${t.amountHint} ${currency}.`}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="manual-note">{t.note}</Label>
        <Textarea
          id="manual-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.notePlaceholder}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={!valid || pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Wallet />}
          {t.submit}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
        >
          {t.cancel}
        </Button>
      </div>
    </form>
  );
}
