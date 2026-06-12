import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Download,
  Loader2,
  Lock,
  Mail,
  Paperclip,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
import { ro } from '@/i18n/ro';

import {
  StatusBadge,
  PaymentBadge,
} from '@/features/quick-questions/status-badges';
import { DeadlineIndicator } from '@/features/quick-questions/deadline-indicator';
import {
  confirmPayment,
  answerTicket,
  bucketOf,
  formatDateTime,
} from '@/features/quick-questions/data';
import { ticketsQueryKey } from '@/features/quick-questions/query-key';
import type { Ticket } from '@/features/quick-questions/types';
import { AddAsPatientButton } from '@/features/patients/add-as-patient-button';

const t = ro.quickQuestions;

function fileSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
      {children}
    </p>
  );
}

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

  const payMutation = useMutation({
    mutationFn: confirmPayment,
    onSuccess: () => {
      toast.success(t.toast.paymentConfirmed);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const answerMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      answerTicket(id, text),
    onSuccess: () => {
      toast.success(t.toast.answerSent);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const busy = payMutation.isPending || answerMutation.isPending;
  const tk = ticket;
  const bucket = tk ? bucketOf(tk) : 'open';
  const isAnswered = tk?.status === 'answered';

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
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  {t.detail.received} {formatDateTime(tk.createdAt)}
                </span>
                <DeadlineIndicator ticket={tk} />
              </div>

              {/* Question */}
              <div className="space-y-2">
                <SectionTitle>{t.detail.question}</SectionTitle>
                <p className="rounded-lg border bg-background px-3 py-2.5 text-sm leading-relaxed text-pretty">
                  {tk.question}
                </p>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <SectionTitle>{t.detail.attachments}</SectionTitle>
                {tk.attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">—</p>
                ) : (
                  <>
                    <ul className="space-y-1.5">
                      {tk.attachments.map((a) => (
                        <li key={a.id}>
                          <button
                            type="button"
                            onClick={() => toast.info(t.toast.attachmentMock)}
                            className="flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                          >
                            <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 flex-1 truncate font-medium">
                              {a.name}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {fileSize(a.sizeKb)}
                            </span>
                            <Download className="size-4 shrink-0 text-muted-foreground" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="size-3" />
                      {t.detail.sensitive}
                    </p>
                  </>
                )}
              </div>

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
                </div>
              ) : (
                <div className="space-y-2">
                  <SectionTitle>{t.detail.yourAnswer}</SectionTitle>
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={5}
                    placeholder={t.detail.answerPlaceholder}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 border-t px-6 py-4">
              {tk.paymentStatus === 'confirmed' && (
                <AddAsPatientButton source="quick_question" sourceId={tk.id} />
              )}
              {tk.paymentStatus === 'pending' && (
                <ConfirmPayment
                  pending={payMutation.isPending}
                  disabled={busy}
                  onConfirm={() => payMutation.mutate(tk.id)}
                />
              )}
              {!isAnswered && (
                <Button
                  className="w-full"
                  disabled={busy || !answer.trim()}
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

function ConfirmPayment({
  pending,
  disabled,
  onConfirm,
}: {
  pending: boolean;
  disabled: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full" disabled={disabled}>
          {pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
          {t.actions.confirmPayment}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.confirm.paymentTitle}</AlertDialogTitle>
          <AlertDialogDescription>{t.confirm.paymentBody}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{ro.common.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t.confirm.paymentCta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
