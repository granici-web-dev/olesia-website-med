import * as React from 'react';
import { Loader2, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ro } from '@/i18n/ro';
import { formatAmount } from '@/lib/format';
import type { Payment } from '@/features/payments/types';

const t = ro.payments;

/**
 * Refund, inline rather than in a dialog.
 *
 * The action is irreversible, so it needs friction — but a modal is the wrong
 * kind. What actually protects the money here is that the doctor has to open
 * the form, type a reason the client will read on their statement, and press a
 * button that names the exact sum. Three deliberate acts, all in context, with
 * the payment still on screen. A confirm dialog would add a click and take the
 * context away.
 */
export function RefundForm({
  payment,
  pending,
  onSubmit,
  onCancel,
}: {
  payment: Payment;
  pending: boolean;
  onSubmit: (amount: number, reason: string) => void;
  onCancel: () => void;
}) {
  const remaining = payment.amount - payment.refundedAmount;
  const [amount, setAmount] = React.useState(remaining.toFixed(2));
  const [reason, setReason] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  const parsed = Number(amount.replace(',', '.'));
  const amountValid =
    Number.isFinite(parsed) && parsed > 0 && parsed <= remaining;
  const reasonValid = reason.trim().length >= 3;
  const valid = amountValid && reasonValid;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (valid && !pending) onSubmit(parsed, reason.trim());
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-lg border bg-background p-4"
    >
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
        {t.refund.title}
      </p>
      <p className="text-sm text-muted-foreground text-pretty">
        {t.refund.hint}
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="refund-amount">{t.refund.amount}</Label>
        <Input
          id="refund-amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={touched && !amountValid}
          aria-describedby="refund-amount-hint"
          className="tabular-nums"
        />
        <p
          id="refund-amount-hint"
          className={
            touched && !amountValid
              ? 'text-xs text-destructive'
              : 'text-xs text-muted-foreground'
          }
        >
          {touched && !amountValid
            ? t.refund.amountError
            : `${t.refund.max} ${formatAmount(remaining, payment.currency)}`}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="refund-reason">{t.refund.reason}</Label>
        <Textarea
          id="refund-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={t.refund.reasonPlaceholder}
          aria-invalid={touched && !reasonValid}
          aria-describedby="refund-reason-hint"
        />
        {touched && !reasonValid && (
          <p id="refund-reason-hint" className="text-xs text-destructive">
            {t.refund.reasonError}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="destructive"
          disabled={!valid || pending}
        >
          {pending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
          {t.refund.submit}{' '}
          {formatAmount(amountValid ? parsed : remaining, payment.currency)}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
        >
          {t.actions.cancelRefund}
        </Button>
      </div>
    </form>
  );
}
