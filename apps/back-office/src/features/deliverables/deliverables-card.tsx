import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Tags,
} from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
import { ro } from '@/i18n/ro';

import { DeliverableFormSheet } from '@/features/deliverables/deliverable-form-sheet';
import {
  fetchDeliverables,
  setDeliverableActive,
} from '@/features/deliverables/api';
import { deliverablesQueryKey } from '@/features/deliverables/query-key';
import type { Deliverable } from '@/features/deliverables/types';

const t = ro.deliverables;

/**
 * The group-C catalog, shown under the services table rather than on a route
 * of its own: "what I sell and for how much" is one place to look, and five
 * rows that cannot be created or deleted do not earn their own nav entry
 * (`docs/shape-deliverable-catalog.md`).
 *
 * It owns its own query instead of taking a prop, the way `CalendlyStatus`
 * does: the page above it knows about services, not about menus.
 */
export function DeliverablesCard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: deliverablesQueryKey,
    queryFn: fetchDeliverables,
  });

  const deliverables = data ?? [];

  const [editing, setEditing] = React.useState<Deliverable | null>(null);
  const [withdrawing, setWithdrawing] = React.useState<Deliverable | null>(
    null,
  );

  const activeMutation = useMutation({
    mutationFn: ({
      code,
      active,
    }: {
      code: Deliverable['code'];
      active: boolean;
    }) => setDeliverableActive(code, active),
    onSuccess: (updated) => {
      toast.success(updated.active ? t.toast.activated : t.toast.deactivated);
      queryClient.invalidateQueries({ queryKey: deliverablesQueryKey });
      setWithdrawing(null);
    },
    onError: () => toast.error(t.toast.error),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn(isFetching && 'animate-spin')} />
          {t.refresh}
        </Button>
      </div>

      <Card className="overflow-hidden py-0">
        {isError ? (
          <EmptyState
            icon={AlertTriangle}
            title={ro.states.errorTitle}
            description={ro.states.errorBody}
            className="py-16"
            action={
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw />
                {ro.common.retry}
              </Button>
            }
          />
        ) : isLoading ? (
          <DeliverablesTableSkeleton />
        ) : deliverables.length === 0 ? (
          <EmptyState
            icon={Tags}
            title={t.empty.title}
            description={t.empty.body}
            className="py-16"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">{t.columns.order}</TableHead>
                <TableHead>{t.columns.product}</TableHead>
                <TableHead className="text-right">{t.columns.price}</TableHead>
                <TableHead className="text-center">
                  {t.columns.active}
                </TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliverables.map((d) => (
                <TableRow
                  key={d.code}
                  className={cn(!d.active && 'opacity-60')}
                >
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {d.sortOrder}
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <div className="font-medium">{d.titleRo}</div>
                    <code className="text-xs text-muted-foreground">
                      {d.code}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium tabular-nums">
                      {formatPrice(d.priceEur)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {/* State, not a control — the same badge the services
                        table uses, so the two lists read alike. */}
                    <Badge variant={d.active ? 'success' : 'muted'}>
                      {d.active ? t.active.on : t.active.off}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                          aria-label={t.actions.menu}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onSelect={() => setEditing(d)}>
                          <Pencil />
                          {t.actions.edit}
                        </DropdownMenuItem>
                        {d.active ? (
                          <DropdownMenuItem onSelect={() => setWithdrawing(d)}>
                            <EyeOff />
                            {t.actions.withdraw}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onSelect={() =>
                              activeMutation.mutate({
                                code: d.code,
                                active: true,
                              })
                            }
                          >
                            <Eye />
                            {t.actions.publish}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <DeliverableFormSheet
        deliverable={editing}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <AlertDialog
        open={withdrawing !== null}
        onOpenChange={(open) => !open && setWithdrawing(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.withdraw.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {withdrawing ? (
                <>
                  <span className="font-medium text-foreground">
                    {withdrawing.titleRo}
                  </span>{' '}
                  — {t.withdraw.body}
                </>
              ) : (
                t.withdraw.body
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={activeMutation.isPending}>
              {ro.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={activeMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (withdrawing)
                  activeMutation.mutate({
                    code: withdrawing.code,
                    active: false,
                  });
              }}
            >
              {t.withdraw.cta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DeliverablesTableSkeleton() {
  return (
    <div className="divide-y">
      <div className="flex items-center gap-4 px-3 py-3">
        <Skeleton className="h-3 w-6" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="ml-auto h-3 w-20" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <Skeleton className="h-4 w-5" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="ml-auto h-4 w-16" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}
