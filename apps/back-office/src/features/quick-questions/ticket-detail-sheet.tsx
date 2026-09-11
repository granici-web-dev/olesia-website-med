import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Copy,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  MailX,
  Phone,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PaymentBadge } from '@/components/common/payment-badge';
import { SectionTitle } from '@/components/common/detail-section';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ro } from '@/i18n/ro';

import { StatusBadge } from '@/features/quick-questions/status-badges';
import { DeadlineIndicator } from '@/features/quick-questions/deadline-indicator';
import { answerTicket } from '@/features/quick-questions/api';
import { bucketOf } from '@/features/quick-questions/format';
import { formatShortDateTime as formatDateTime } from '@/lib/format';
import { ticketsQueryKey } from '@/features/quick-questions/query-key';
import type { Ticket } from '@/features/quick-questions/types';
import { AddAsPatientButton } from '@/features/patients/add-as-patient-button';
import { ManualPaymentPanel } from '@/features/payments/manual-payment-panel';
import { copyToClipboard } from '@/lib/clipboard';

const t = ro.quickQuestions;

/** The EXPRESS question is quoted in EUR, like the rest of the catalog. */
const TICKET_CURRENCY = 'EUR';

export function TicketDetailSheet({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [answer, setAnswer] = React.useState('');

  // Reset the draft whenever a different ticket opens.
  React.useEffect(() => {
    setAnswer('');
  }, [ticket?.id]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ticketsQueryKey });

  /**
   * Saving the answer and delivering it are two outcomes, and the doctor is
   * told which happened. The toast used to say "sent to the client" for a
   * write to a database column (audit A3, F2); with no SMTP nothing leaves,
   * and she needs to know so she sends it herself.
   */
  const [lastDelivery, setLastDelivery] = React.useState<boolean | null>(null);

  const answerMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      answerTicket(id, text),
    onSuccess: ({ emailSent }) => {
      setLastDelivery(emailSent);
      if (emailSent) toast.success(t.toast.answerSaved);
      else toast.warning(t.toast.answerSavedNotSent);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const busy = answerMutation.isPending;
  const tk = ticket;
  const bucket = tk ? bucketOf(tk) : 'open';
  const isAnswered = tk?.status === 'answered';
  /**
   * The API refuses an answer on an unpaid ticket outright. The disabled box is
   * not the rule, it is the explanation: without it the doctor writes a reply,
   * presses send and reads a machine code.
   */
  const unpaid = tk?.status === 'awaiting_payment';

  const submitAnswer = () => {
    if (!tk) return;
    if (!answer.trim()) {
      toast.error(t.toast.answerRequired);
      return;
    }
    answerMutation.mutate({ id: tk.id, text: answer });
  };

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

        {tk && (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge bucket={bucket} />
                <PaymentBadge status={tk.paymentStatus} />
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-tight text-balance">
                  {tk.clientName}
                </h3>
                <a
                  href={`mailto:${tk.clientEmail}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  <Mail className="size-3.5" />
                  {tk.clientEmail}
                </a>
                {tk.phone && (
                  <a
                    href={`tel:${tk.phone}`}
                    className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    <Phone className="size-3.5" />
                    {tk.phone}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  {t.detail.received} {formatDateTime(tk.createdAt)}
                </span>
                {unpaid ? (
                  <span className="text-xs text-muted-foreground">
                    {t.unpaid.noDeadline}
                  </span>
                ) : (
                  <DeadlineIndicator ticket={tk} />
                )}
              </div>

              {unpaid && (
                <div className="space-y-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
                  <p className="flex items-start gap-1.5 text-sm text-pretty">
                    <Lock className="mt-0.5 size-3.5 shrink-0" />
                    {t.unpaid.notice}
                  </p>
                  <p className="pl-5 text-xs text-muted-foreground">
                    {t.unpaid.autoDelete}
                  </p>
                </div>
              )}

              {/* Question */}
              <div className="space-y-2">
                <SectionTitle>{t.detail.question}</SectionTitle>
                <p className="rounded-lg border bg-background px-3 py-2.5 text-sm leading-relaxed text-pretty">
                  {tk.question}
                </p>
              </div>

              <Separator />

              <ManualPaymentPanel
                targetType="quick_question"
                targetId={tk.id}
                currency={TICKET_CURRENCY}
                onRecorded={invalidate}
              />

              <Separator />

              {/* Answer */}
              {isAnswered ? (
                <div className="space-y-2">
                  <SectionTitle>{t.detail.answer}</SectionTitle>
                  <p className="rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 text-sm leading-relaxed text-pretty">
                    {tk.answer}
                  </p>
                  {tk.answeredAt && (
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-success" />
                      {t.detail.answeredAt} {formatDateTime(tk.answeredAt)}
                    </p>
                  )}
                  {lastDelivery === true && (
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MailCheck className="size-3.5 text-success" />
                      {t.detail.emailSent}
                    </p>
                  )}
                  {lastDelivery === false && (
                    <div className="space-y-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
                      <p className="inline-flex items-start gap-1.5 text-xs">
                        <MailX className="mt-px size-3.5 shrink-0" />
                        {t.detail.emailNotSent}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (await copyToClipboard(tk.answer ?? '')) {
                            toast.success(t.toast.answerCopied);
                          }
                        }}
                      >
                        <Copy />
                        {t.detail.copyAnswer}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <SectionTitle>{t.detail.yourAnswer}</SectionTitle>
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={5}
                    disabled={unpaid}
                    aria-describedby={unpaid ? 'answer-blocked' : undefined}
                    placeholder={
                      unpaid
                        ? t.unpaid.answerBlocked
                        : t.detail.answerPlaceholder
                    }
                  />
                  {unpaid && (
                    <p
                      id="answer-blocked"
                      className="text-xs text-muted-foreground"
                    >
                      {t.unpaid.answerBlocked}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 border-t px-6 py-4">
              {tk.paymentStatus === 'confirmed' && (
                <AddAsPatientButton source="quick_question" sourceId={tk.id} />
              )}
              {!isAnswered && (
                <Button
                  className="w-full"
                  disabled={busy || unpaid || !answer.trim()}
                  onClick={submitAnswer}
                >
                  {answerMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send />
                  )}
                  {answerMutation.isPending
                    ? t.actions.sending
                    : t.actions.sendAnswer}
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
