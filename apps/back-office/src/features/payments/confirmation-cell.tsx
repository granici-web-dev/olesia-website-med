import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, MailCheck, MailX, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ro } from '@/i18n/ro';
import { useAuth } from '@/auth/auth-context';

import {
  formatAmount,
  formatDateTime,
  resendConfirmation,
} from '@/features/payments/data';
import { paymentsQueryKey } from '@/features/payments/query-key';
import type { Payment } from '@/features/payments/types';

const t = ro.payments;

/**
 * Whether the bank's required payment confirmation actually reached the client.
 *
 * The bank's go-live checklist asks for a confirmation email after every
 * payment, and there is no SMTP server yet — so for now every row reads
 * "Confirmare netrimisă". That is the point rather than a defect to hide: the
 * doctor can copy the text and send it herself, which is the same answer the
 * EXPRESS answer and the upload link already give when mail cannot leave
 * (audit A3, F2).
 *
 * `copiază` is next to it because it is the action that works today, and the
 * resend button is next to that because it is the action that will work the day
 * the mailbox exists.
 */
export function PaymentConfirmationCell({ payment }: { payment: Payment }) {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const resend = useMutation({
    mutationFn: () => resendConfirmation(payment.id),
    onSuccess: (updated) => {
      if (updated.confirmationSentAt) toast.success(t.confirmation.resent);
      else toast.warning(t.confirmation.resendFailed);
      queryClient.invalidateQueries({ queryKey: paymentsQueryKey });
    },
    onError: () => toast.error(t.toast.error),
  });

  // Only a paid payment has a confirmation to send, and nothing to say until it
  // is one: an unpaid row showing "not sent" would read as a second failure.
  if (payment.state !== 'paid') {
    return <span className="text-muted-foreground/60">—</span>;
  }

  if (payment.confirmationSentAt) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
        <MailCheck className="size-3.5 text-success" />
        {t.confirmation.sent} {formatDateTime(payment.confirmationSentAt)}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-warning-foreground">
        <MailX className="size-3.5" />
        {t.confirmation.notSent}
      </span>
      <button
        type="button"
        className="text-xs underline underline-offset-2 hover:text-primary"
        onClick={(e) => {
          // The row is a button that opens the detail sheet.
          e.stopPropagation();
          navigator.clipboard.writeText(confirmationText(payment));
          toast.success(t.confirmation.copied);
        }}
      >
        {t.confirmation.copy}
      </button>
      {hasRole(['admin']) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5"
          disabled={resend.isPending}
          aria-label={t.confirmation.resend}
          title={t.confirmation.resend}
          onClick={(e) => {
            e.stopPropagation();
            resend.mutate();
          }}
        >
          {resend.isPending ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      )}
    </div>
  );
}

/**
 * The receipt as plain text, so it can be pasted into whatever the doctor uses
 * to write to a client today. Same four facts as the email template in
 * `apps/api/src/app/mail/patient-templates.ts`: the order reference, what was
 * bought, how much and when.
 */
function confirmationText(p: Payment): string {
  return [
    `Confirmarea plății — comanda ${p.orderId}`,
    '',
    `Comanda: ${p.orderId}`,
    `Serviciu: ${t.target[p.targetType]}`,
    `Sumă: ${formatAmount(p.amount, p.currency)}`,
    `Data plății: ${formatDateTime(p.paidAt ?? p.createdAt)}`,
  ].join('\n');
}
