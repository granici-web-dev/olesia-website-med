import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/auth/auth-context';
import { ro } from '@/i18n/ro';

import {
  fetchMaterialGrant,
  revokeMaterialGrant,
  formatDateTime,
} from '@/features/payments/data';
import { materialGrantQueryKey } from '@/features/payments/query-key';
import type { Payment } from '@/features/payments/types';

const t = ro.payments.grant;

/**
 * The download link a paid material opened, on the payment that bought it.
 *
 * This screen is the one recourse a buyer who lost the return page's link
 * has. The link is claimed with a key kept in the buyer's own tab, so it is
 * gone for anyone in a private window or on a different device, and with no
 * SMTP the receipt does not reach them either — they write in, and the doctor
 * copies the link from here (shape open question 3, decided).
 *
 * `copiază link` rather than a download button: the operator is sending this
 * to somebody else, not opening it herself, and a click that downloads the
 * file here would spend one of the buyer's ten.
 */
export function MaterialGrantPanel({ payment }: { payment: Payment }) {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const { data: grant, isLoading } = useQuery({
    queryKey: materialGrantQueryKey(payment.id),
    queryFn: () => fetchMaterialGrant(payment.id),
    // Only a paid material has one. Asking about anything else would be a
    // request per row that can only ever answer null.
    enabled: payment.targetType === 'material' && payment.state === 'paid',
  });

  const revoke = useMutation({
    mutationFn: () => revokeMaterialGrant(payment.id),
    onSuccess: () => {
      toast.success(t.revoked);
      queryClient.invalidateQueries({
        queryKey: materialGrantQueryKey(payment.id),
      });
    },
    onError: () => toast.error(ro.payments.toast.error),
  });

  if (payment.targetType !== 'material' || payment.state !== 'paid') return null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
        {t.title}
      </p>

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          {ro.common.loading}
        </p>
      ) : !grant ? (
        // A refund revokes the grant, and so does the button below. Saying
        // which is not this panel's job; saying that there is no live link,
        // and that a new one needs a new purchase, is.
        <p className="text-sm text-muted-foreground text-pretty">{t.none}</p>
      ) : (
        <div className="space-y-2.5 rounded-lg border bg-muted/40 px-3 py-3">
          <p className="flex items-center gap-2 text-sm">
            <Download className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t.validUntil} {formatDateTime(grant.expiresAt)}
              {grant.downloadsLeft !== null && (
                <> · {t.downloadsLeft(grant.downloadsLeft)}</>
              )}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(grant.url);
                toast.success(t.copied);
              }}
            >
              {t.copy}
            </Button>

            {/* Behind a dialog, because it destroys a capability somebody
                paid for and there is no undo — the buyer would have to buy it
                again. The pattern is the one `appointment-detail-sheet.tsx`
                uses; folding the three copies into one component is `PLAN.md`
                13e, and doing it here would touch two files this change has
                no business in. */}
            {hasRole(['admin']) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    disabled={revoke.isPending}
                  >
                    {revoke.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Ban />
                    )}
                    {t.revoke}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.revokeTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.revokeBody}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{ro.common.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => revoke.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t.revoke}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
