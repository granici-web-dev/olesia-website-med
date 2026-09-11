import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  Download,
  ExternalLink,
  FileText,
  History,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmAction } from '@/components/common/confirm-action';
import {
  StatusBadge,
  PaymentBadge,
} from '@/features/appointments/status-badges';
import {
  downloadPlanFile,
  markNoShow,
  uploadPlan,
  serviceLabel,
  formatDateTime,
  durationMinutes,
  isFreeAppointment,
} from '@/features/appointments/data';
import type { Appointment } from '@/features/appointments/types';
import { AddAsPatientButton } from '@/features/patients/add-as-patient-button';
import { PatientUploadsPanel } from '@/features/uploads/patient-uploads-panel';
import { ro } from '@/i18n/ro';
import { ManualPaymentPanel } from '@/features/payments/manual-payment-panel';
import { appointmentsQueryKey } from '@/features/appointments/query-key';

const t = ro.appointments;

/** The catalog quotes consultations in EUR, like the rest of the services. */
const APPOINTMENT_CURRENCY = 'EUR';

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
  rescheduledFrom,
  onOpenAppointment,
  open,
  onOpenChange,
}: {
  appointment: Appointment | null;
  /** The canceled booking this one grew out of, when it is in the loaded list. */
  rescheduledFrom: Appointment | null;
  onOpenAppointment: (id: string) => void;
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

  const busy = noShowMutation.isPending || planMutation.isPending;

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
                {isFreeAppointment(a) ? (
                  <Badge variant="secondary">{ro.payment.free}</Badge>
                ) : (
                  <PaymentBadge status={a.paymentStatus} />
                )}
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
                  {a.videoUrl?.startsWith('https://') ? (
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
                {rescheduledFrom ? (
                  <Field label={t.detail.rescheduledFrom}>
                    <button
                      type="button"
                      onClick={() => onOpenAppointment(rescheduledFrom.id)}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-foreground underline-offset-4 hover:text-primary hover:underline"
                      title={t.detail.openPrevious}
                    >
                      <History className="size-3.5 text-muted-foreground" />
                      {formatDateTime(rescheduledFrom.startTime)}
                    </button>
                  </Field>
                ) : null}
              </dl>

              <Separator className="my-4" />

              {/* Analyses the patient sent ahead of the consultation (§11.14).
                  Above the plan on purpose: these are what the plan is written
                  from, so they belong before it in reading order. */}
              <SectionTitle>{ro.patientUploads.title}</SectionTitle>
              <div className="mt-2">
                <PatientUploadsPanel appointmentId={a.id} />
              </div>

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

              {/* A free consultation has nothing to pay, so it has no ledger. */}
              {!isFreeAppointment(a) && (
                <>
                  <Separator className="my-4" />
                  <ManualPaymentPanel
                    targetType="appointment"
                    targetId={a.id}
                    currency={APPOINTMENT_CURRENCY}
                    onRecorded={invalidate}
                  />
                </>
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
                  pending={noShowMutation.isPending}
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
