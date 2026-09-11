import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail, Phone, Reply, Trash2 } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/auth/auth-context';
import { ro } from '@/i18n/ro';

import { OrderStatusBadge, PaymentBadge } from '@/features/orders/status-badges';
import {
  deleteOrder,
  formatDateTime,
  formatPrice,
  setOrderStatus,
} from '@/features/orders/data';
import { ManualPaymentPanel } from '@/features/payments/manual-payment-panel';
import { ordersQueryKey } from '@/features/orders/query-key';
import type { Order, OrderStatus } from '@/features/orders/types';

const t = ro.orders;

/** The catalog quotes group-C deliverables in EUR, and the row stores EUR. */
const ORDER_CURRENCY = 'EUR';

const STATUS_OPTIONS: OrderStatus[] = [
  'new',
  'in_progress',
  'delivered',
  'canceled',
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
      {children}
    </p>
  );
}

/**
 * Pre-filled mailto: for sending the finished menu or protocol from her own
 * inbox — the portal cannot send attachments until SMTP is configured.
 *
 * The signature is whoever is signed in. It was the doctor's name in the
 * source, so an assistant's account sent letters over the doctor's name.
 */
function deliverMailto(o: Order, signedBy: string): string {
  const subject = o.titleRo;
  const body = `Bună ziua, ${o.clientName},\n\nVă transmit atașat ${o.titleRo.toLowerCase()}.\n\nCu drag,\n${signedBy}`;
  return `mailto:${o.clientEmail}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ordersQueryKey });

  const statusMutation = useMutation({
    mutationFn: setOrderStatus,
    onSuccess: () => {
      toast.success(t.toast.statusSaved);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success(t.toast.deleted);
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error(t.toast.error),
  });

  const o = order;

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

        {o && (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={o.status} />
                <PaymentBadge payment={o.paymentStatus} />
              </div>

              {/* What was ordered — read-only: the price is the one that was
                  shown when the client ordered, not today's. */}
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-balance">
                  {o.titleRo}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(o.priceEur)} · {t.detail.ordered}{' '}
                  {formatDateTime(o.createdAt)}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <SectionTitle>{t.detail.client}</SectionTitle>
                <p className="font-medium">{o.clientName}</p>
                <a
                  href={`mailto:${o.clientEmail}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  <Mail className="size-3.5" />
                  {o.clientEmail}
                </a>
                {o.phone && (
                  <a
                    href={`tel:${o.phone}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    <Phone className="size-3.5" />
                    {o.phone}
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <SectionTitle>{t.detail.notes}</SectionTitle>
                {o.notes ? (
                  <p className="rounded-lg border bg-background px-3 py-2.5 text-sm leading-relaxed whitespace-pre-line text-pretty">
                    {o.notes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t.detail.noNotes}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <SectionTitle>{t.detail.status}</SectionTitle>
                <Select
                  value={o.status}
                  onValueChange={(v) =>
                    statusMutation.mutate({ id: o.id, status: v as OrderStatus })
                  }
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger className="w-full" aria-label={t.detail.status}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t.status[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {o.deliveredAt && (
                  <p className="text-xs text-muted-foreground">
                    {t.detail.delivered} {formatDateTime(o.deliveredAt)}
                  </p>
                )}
              </div>

              <ManualPaymentPanel
                targetType="deliverable_order"
                targetId={o.id}
                currency={ORDER_CURRENCY}
                suggestedAmount={o.priceEur}
                onRecorded={invalidate}
              />

              <Separator />

              <div className="space-y-2">
                <SectionTitle>{t.detail.deliver}</SectionTitle>
                <p className="text-sm text-muted-foreground text-pretty">
                  {t.detail.deliverHint}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a href={deliverMailto(o, user?.name ?? '')}>
                    <Reply />
                    {t.actions.sendByEmail}
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t px-6 py-4">
              <DeleteOrder
                pending={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(o.id)}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DeleteOrder({
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
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={pending}
        >
          {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
          {t.actions.delete}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.confirm.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>{t.confirm.deleteBody}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{ro.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {t.confirm.deleteCta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
