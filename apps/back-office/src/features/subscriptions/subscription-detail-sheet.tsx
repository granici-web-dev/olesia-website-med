import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarRange,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  PhoneOff,
  RotateCcw,
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
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

import {
  StatusBadge,
  PaymentBadge,
} from '@/features/subscriptions/status-badges';
import { QuotaBar } from '@/features/subscriptions/quota-bar';
import {
  setPaymentStatus,
  cancelSubscription,
  logVideoCall,
  formatDate,
  daysRemaining,
  quotaRemaining,
} from '@/features/subscriptions/data';
import { subscriptionsQueryKey } from '@/features/subscriptions/query-key';
import type { Subscription } from '@/features/subscriptions/types';
import { AddAsPatientButton } from '@/features/patients/add-as-patient-button';

const t = ro.subscriptions;

function periodSubLabel(sub: Subscription): string {
  if (sub.status !== 'active') return t.status[sub.status];
  const days = daysRemaining(sub.endDate);
  if (days <= 0) return t.period.expired;
  if (days === 1) return t.period.lastDay;
  return `${days} ${t.period.daysLeft}`;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium break-words">{children}</dd>
    </div>
  );
}

export function SubscriptionDetailSheet({
  subscription,
  open,
  onOpenChange,
}: {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey });

  const payMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Subscription['paymentStatus'];
    }) => setPaymentStatus(id, status),
    onSuccess: (_data, vars) => {
      toast.success(
        vars.status === 'confirmed'
          ? t.toast.paymentConfirmed
          : t.toast.paymentReverted,
      );
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const callMutation = useMutation({
    mutationFn: logVideoCall,
    onSuccess: () => {
      toast.success(t.toast.callLogged);
      invalidate();
    },
    onError: (err) =>
      toast.error(
        err instanceof Error && err.message === 'no_quota'
          ? t.toast.noQuota
          : t.toast.error,
      ),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast.success(t.toast.canceled);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const busy =
    payMutation.isPending ||
    callMutation.isPending ||
    cancelMutation.isPending;

  const s = subscription;
  const remaining = s ? quotaRemaining(s) : 0;

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

        {s && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={s.status} />
                <PaymentBadge status={s.paymentStatus} />
              </div>

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-balance">
                {s.clientName}
              </h3>
              <p className="text-sm text-muted-foreground">{t.serviceName}</p>

              <Separator className="my-4" />

              <SectionTitle>{t.detail.client}</SectionTitle>
              <dl className="mt-1 divide-y">
                <Field label={t.detail.email}>
                  <a
                    href={`mailto:${s.clientEmail}`}
                    className="inline-flex items-center gap-1.5 text-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    <Mail className="size-3.5 text-muted-foreground" />
                    {s.clientEmail}
                  </a>
                </Field>
                {s.phone && (
                  <Field label={t.detail.phone}>
                    <a
                      href={`tel:${s.phone}`}
                      className="inline-flex items-center gap-1.5 text-foreground underline-offset-4 hover:text-primary hover:underline"
                    >
                      <Phone className="size-3.5 text-muted-foreground" />
                      {s.phone}
                    </a>
                  </Field>
                )}
              </dl>

              {s.notes && (
                <>
                  <Separator className="my-4" />
                  <SectionTitle>{t.detail.message}</SectionTitle>
                  <p className="mt-2 text-sm whitespace-pre-wrap text-foreground/90">
                    {s.notes}
                  </p>
                </>
              )}

              <Separator className="my-4" />

              <SectionTitle>{t.detail.period}</SectionTitle>
              <dl className="mt-1 divide-y">
                <Field label={t.detail.period}>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarRange className="size-3.5 text-muted-foreground" />
                    {formatDate(s.startDate)} – {formatDate(s.endDate)}
                  </span>
                </Field>
                <Field label={t.detail.price}>{s.price} €</Field>
              </dl>
              <p
                className={cn(
                  'mt-2 text-xs font-medium',
                  s.status === 'active' && daysRemaining(s.endDate) <= 7
                    ? 'text-warning-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {periodSubLabel(s)}
              </p>

              <Separator className="my-4" />

              <SectionTitle>{t.detail.quota}</SectionTitle>
              <div className="mt-3">
                <QuotaBar
                  used={s.videoQuotaUsed}
                  total={s.videoQuotaTotal}
                  className="w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 border-t px-6 py-4">
              {s.paymentStatus === 'confirmed' && (
                <>
                  <AddAsPatientButton source="subscription" sourceId={s.id} />
                  <ConfirmAction
                    trigger={
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={busy}
                      >
                        {payMutation.isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <RotateCcw />
                        )}
                        {t.actions.revertPayment}
                      </Button>
                    }
                    title={t.confirm.paymentRevertTitle}
                    body={t.confirm.paymentRevertBody}
                    cta={t.confirm.paymentRevertCta}
                    onConfirm={() =>
                      payMutation.mutate({ id: s.id, status: 'pending' })
                    }
                  />
                </>
              )}

              {s.paymentStatus === 'pending' && s.status !== 'canceled' && (
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
                  onConfirm={() =>
                    payMutation.mutate({ id: s.id, status: 'confirmed' })
                  }
                />
              )}

              {s.status === 'active' && (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={busy || remaining === 0}
                  onClick={() => callMutation.mutate(s.id)}
                >
                  {callMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Video />
                  )}
                  {remaining === 0 ? t.quota.depleted : t.actions.logCall}
                </Button>
              )}

              {s.status === 'active' && (
                <ConfirmAction
                  trigger={
                    <Button
                      variant="ghost"
                      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={busy}
                    >
                      {cancelMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <PhoneOff />
                      )}
                      {t.actions.cancel}
                    </Button>
                  }
                  title={t.confirm.cancelTitle}
                  body={t.confirm.cancelBody}
                  cta={t.confirm.cancelCta}
                  destructive
                  onConfirm={() => cancelMutation.mutate(s.id)}
                />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
      {children}
    </p>
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
