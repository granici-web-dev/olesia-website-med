import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  UserX,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
import {
  StatusBadge,
  PaymentBadge,
} from '@/features/appointments/status-badges';
import {
  confirmPayment,
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const busy =
    payMutation.isPending ||
    noShowMutation.isPending ||
    planMutation.isPending;

  const a = appointment;

  const handlePlanFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    // Mock: the picked file isn't persisted; we just close out the appointment.
    if (e.target.files?.length && a) {
      planMutation.mutate(a.id);
    }
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
                <Field label={t.detail.planUploaded}>
                  {a.planUploadedAt ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-success" />
                      {formatDateTime(a.planUploadedAt)}
                    </span>
                  ) : (
                    <span className="font-normal text-muted-foreground">
                      {t.detail.notYet}
                    </span>
                  )}
                </Field>
              </dl>

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

              {a.status !== 'canceled' && a.status !== 'no_show' && (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {planMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <FileText />
                  )}
                  {a.planUploadedAt
                    ? t.actions.replacePlan
                    : t.actions.uploadPlan}
                </Button>
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

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handlePlanFile}
              />
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
