import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Paperclip,
  Pencil,
  UserX,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
import {
  StatusBadge,
  PaymentBadge,
} from '@/features/appointments/status-badges';
import {
  confirmPayment,
  downloadPlanFile,
  markNoShow,
  uploadPlan,
  serviceLabel,
  formatDateTime,
  durationMinutes,
} from '@/features/appointments/data';
import type { Appointment } from '@/features/appointments/types';
import { AddAsPatientButton } from '@/features/patients/add-as-patient-button';
import { ro } from '@/i18n/ro';
import { appointmentsQueryKey } from '@/features/appointments/query-key';
import { cn } from '@/lib/utils';

const t = ro.appointments;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium break-words">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
      {children}
    </p>
  );
}

export function AppointmentDetailSheet({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  // Plan editor: local draft + optional attachment, reset per appointment.
  const [editingPlan, setEditingPlan] = React.useState(false);
  const [planDraft, setPlanDraft] = React.useState('');
  const [attachFile, setAttachFile] = React.useState<File | null>(null);
  const [downloading, setDownloading] = React.useState(false);
  const planFileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setEditingPlan(false);
    setPlanDraft(appointment?.planText ?? '');
    setAttachFile(null);
  }, [appointment?.id]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: appointmentsQueryKey });

  const payMutation = useMutation({
    mutationFn: confirmPayment,
    onSuccess: () => {
      toast.success(t.toast.paymentConfirmed);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const noShowMutation = useMutation({
    mutationFn: markNoShow,
    onSuccess: () => {
      toast.success(t.toast.noShowMarked);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const planMutation = useMutation({
    mutationFn: uploadPlan,
    onSuccess: () => {
      toast.success(t.toast.planUploaded);
      setEditingPlan(false);
      setAttachFile(null);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const busy =
    payMutation.isPending ||
    noShowMutation.isPending ||
    planMutation.isPending;

  const a = appointment;
  const canEditPlan =
    !!a && a.status !== 'canceled' && a.status !== 'no_show';

  const startEditPlan = () => {
    setPlanDraft(a?.planText ?? '');
    setAttachFile(null);
    setEditingPlan(true);
  };

  const cancelEditPlan = () => {
    setEditingPlan(false);
    setPlanDraft(a?.planText ?? '');
    setAttachFile(null);
  };

  const savePlan = () => {
    const text = planDraft.trim();
    if (!a || !text) return;
    planMutation.mutate({ id: a.id, planText: text, file: attachFile });
  };

  const handleDownload = async () => {
    if (!a?.planFileName) return;
    setDownloading(true);
    try {
      await downloadPlanFile(a.id, a.planFileName);
    } catch {
      toast.error(t.plan.downloadError);
    } finally {
      setDownloading(false);
    }
  };

  const handlePickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) setAttachFile(f);
    e.target.value = '';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{t.detail.title}</SheetTitle>
        </SheetHeader>

        {a && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={a.status} />
                <PaymentBadge status={a.paymentStatus} />
              </div>

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-balance">
                {a.clientName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {serviceLabel(a.service)}
              </p>

              <Separator className="my-4" />

              <SectionTitle>{t.detail.client}</SectionTitle>
              <dl className="mt-1 divide-y">
                <Field label={t.detail.email}>
                  <a
                    href={`mailto:${a.clientEmail}`}
                    className="inline-flex items-center gap-1.5 text-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    <Mail className="size-3.5 text-muted-foreground" />
                    {a.clientEmail}
                  </a>
                </Field>
                <Field label={t.detail.reason}>
                  {a.reason ?? (
                    <span className="font-normal text-muted-foreground">
                      {t.detail.noReason}
                    </span>
                  )}
                </Field>
              </dl>

              <Separator className="my-4" />

              <SectionTitle>{t.detail.appointment}</SectionTitle>
              <dl className="mt-1 divide-y">
                <Field label={t.detail.when}>{formatDateTime(a.startTime)}</Field>
                <Field label={t.detail.duration}>
                  {durationMinutes(a.startTime, a.endTime)} min
                </Field>
                <Field label={t.detail.video}>
                  {a.videoUrl ? (
                    <a
                      href={a.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-foreground underline-offset-4 hover:text-primary hover:underline"
                    >
                      <Video className="size-3.5 text-muted-foreground" />
                      {t.detail.joinCall}
                    </a>
                  ) : (
                    <span className="font-normal text-muted-foreground">
                      {t.detail.noVideo}
                    </span>
                  )}
                </Field>
                <Field label={t.detail.prepSent}>
                  {a.prepSentAt ? (
                    formatDateTime(a.prepSentAt)
                  ) : (
                    <span className="font-normal text-muted-foreground">
                      {t.detail.notYet}
                    </span>
                  )}
                </Field>
              </dl>

              <Separator className="my-4" />

              {/* Treatment plan: written text + optional private attachment. */}
              <div className="flex items-center justify-between gap-2">
                <SectionTitle>{t.plan.title}</SectionTitle>
                {canEditPlan && !editingPlan && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-mr-2 h-7 px-2 text-xs"
                    disabled={busy}
                    onClick={startEditPlan}
                  >
                    <Pencil className="size-3.5" />
                    {a.planText ? t.plan.edit : t.plan.add}
                  </Button>
                )}
              </div>

              {!editingPlan ? (
                <div className="mt-2">
                  {a.planText ? (
                    <>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                        {a.planText}
                      </p>
                      {a.planFileName && (
                        <button
                          type="button"
                          onClick={handleDownload}
                          disabled={downloading}
                          className="mt-3 inline-flex w-full max-w-full items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:border-ring hover:bg-accent disabled:opacity-60"
                        >
                          {downloading ? (
                            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                          ) : (
                            <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="min-w-0 flex-1 truncate text-left">
                            {a.planFileName}
                          </span>
                          <Download className="size-3.5 shrink-0 text-muted-foreground" />
                        </button>
                      )}
                      {a.planUploadedAt && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t.plan.savedAt} {formatDateTime(a.planUploadedAt)}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t.plan.empty}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="plan-text">{t.plan.textLabel}</Label>
                    <Textarea
                      id="plan-text"
                      value={planDraft}
                      onChange={(e) => setPlanDraft(e.target.value)}
                      placeholder={t.plan.textPlaceholder}
                      className="min-h-32"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t.plan.attachmentLabel}</Label>
                    {attachFile ? (
                      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                        <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">
                          {attachFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAttachFile(null)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={t.plan.removeFile}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : a.planFileName ? (
                      <button
                        type="button"
                        onClick={() => planFileRef.current?.click()}
                        className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:border-ring hover:bg-accent"
                      >
                        <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-left">
                          {a.planFileName}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {t.plan.changeFile}
                        </span>
                      </button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => planFileRef.current?.click()}
                      >
                        <Paperclip className="size-3.5" />
                        {t.plan.attach}
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t.plan.attachmentHint}
                    </p>
                    <input
                      ref={planFileRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handlePickFile}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditPlan}
                      disabled={planMutation.isPending}
                    >
                      {t.plan.cancel}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={savePlan}
                      disabled={!planDraft.trim() || planMutation.isPending}
                    >
                      {planMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <FileText />
                      )}
                      {t.plan.save}
                    </Button>
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <a
                  href={a.rescheduleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline"
                >
                  <CalendarClock className="size-3.5" />
                  {t.detail.rescheduleLink}
                </a>
                <a
                  href={a.cancelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  {t.detail.cancelLink}
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 border-t px-6 py-4">
              {a.paymentStatus === 'confirmed' && (
                <AddAsPatientButton source="appointment" sourceId={a.id} />
              )}

              {a.paymentStatus === 'pending' && a.status !== 'canceled' && (
                <ConfirmAction
                  trigger={
                    <Button className="w-full" disabled={busy}>
                      {payMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <CheckCircle2 />
                      )}
                      {t.actions.confirmPayment}
                    </Button>
                  }
                  title={t.confirm.paymentTitle}
                  body={t.confirm.paymentBody}
                  cta={t.confirm.paymentCta}
                  onConfirm={() => payMutation.mutate(a.id)}
                />
              )}

              {a.status === 'scheduled' && (
                <ConfirmAction
                  trigger={
                    <Button
                      variant="ghost"
                      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={busy}
                    >
                      {noShowMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <UserX />
                      )}
                      {t.actions.markNoShow}
                    </Button>
                  }
                  title={t.confirm.noShowTitle}
                  body={t.confirm.noShowBody}
                  cta={t.confirm.noShowCta}
                  destructive
                  onConfirm={() => noShowMutation.mutate(a.id)}
                />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ConfirmAction({
  trigger,
  title,
  body,
  cta,
  onConfirm,
  destructive,
}: {
  trigger: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{ro.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              destructive &&
                'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            )}
          >
            {cta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
