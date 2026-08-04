import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Pencil,
  Plus,
  RefreshCw,
  Tags,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { ro } from '@/i18n/ro';

import { ServiceFormSheet } from '@/features/services/service-form-sheet';
import {
  fetchServices,
  deleteService,
  setServiceActive,
  formatPrice,
  groupForCode,
  ALL_CODES,
} from '@/features/services/data';
import { servicesQueryKey } from '@/features/services/query-key';
import { CalendlyStatus } from '@/features/services/calendly-status';
import type { Service, ServiceCode } from '@/features/services/types';

const t = ro.services;

export function ServicesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: servicesQueryKey,
    queryFn: fetchServices,
  });

  const services = React.useMemo(() => data ?? [], [data]);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [deleting, setDeleting] = React.useState<Service | null>(null);

  const usedCodes = React.useMemo(
    () => new Set(services.map((s) => s.code)),
    [services],
  );
  const availableCodes = React.useMemo(
    () => ALL_CODES.filter((c) => !usedCodes.has(c)),
    [usedCodes],
  );
  const nextSortOrder = React.useMemo(
    () => services.reduce((max, s) => Math.max(max, s.sortOrder), 0) + 1,
    [services],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: servicesQueryKey });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setServiceActive(id, active),
    onSuccess: (svc) => {
      toast.success(svc.active ? t.toast.activated : t.toast.deactivated);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      toast.success(t.toast.deleted);
      setDeleting(null);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (service: Service) => {
    setEditing(service);
    setFormOpen(true);
  };

  const canCreate = availableCodes.length > 0;

  const newButton = (
    <Button onClick={openCreate} disabled={!canCreate}>
      <Plus />
      {t.newService}
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn(isFetching && 'animate-spin')} />
              {t.refresh}
            </Button>
            {canCreate ? (
              newButton
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>{newButton}</span>
                </TooltipTrigger>
                <TooltipContent>{ro.services.form.allCodesUsed}</TooltipContent>
              </Tooltip>
            )}
          </>
        }
      />

      {/* Booking readiness — the one thing that has to be right before launch. */}
      {!isLoading && !isError && <CalendlyStatus services={services} />}

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
          <ServicesTableSkeleton />
        ) : services.length === 0 ? (
          <EmptyState
            icon={Tags}
            title={t.empty.title}
            description={t.empty.body}
            className="py-16"
            action={newButton}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">{t.columns.order}</TableHead>
                <TableHead>{t.columns.service}</TableHead>
                <TableHead>{t.columns.group}</TableHead>
                <TableHead className="text-right">{t.columns.price}</TableHead>
                <TableHead className="text-center">{t.columns.active}</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => {
                const isA = groupForCode(s.code) === 'A_booking';
                return (
                  <TableRow key={s.id} className={cn(!s.active && 'opacity-60')}>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {s.sortOrder}
                    </TableCell>
                    <TableCell className="max-w-sm">
                      <div className="font-medium">{s.titleRo}</div>
                      <code className="text-xs text-muted-foreground">
                        {s.code}
                        {isA && s.durationMin ? ` · ${s.durationMin} min` : ''}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isA ? 'info' : 'muted'}>
                        {t.group[s.group]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium tabular-nums">
                        {formatPrice(s.price)}
                      </div>
                      {s.priceLabelRo && (
                        <div className="text-xs text-muted-foreground">
                          {s.priceLabelRo}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={s.active}
                        disabled={activeMutation.isPending}
                        onCheckedChange={(active) =>
                          activeMutation.mutate({ id: s.id, active })
                        }
                        aria-label={s.active ? t.active.on : t.active.off}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                          aria-label={ro.common.edit}
                          onClick={() => openEdit(s)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={ro.common.delete}
                          onClick={() => setDeleting(s)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <ServiceFormSheet
        service={editing}
        availableCodes={editing ? ([editing.code] as ServiceCode[]) : availableCodes}
        nextSortOrder={nextSortOrder}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.delete.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? (
                <>
                  <span className="font-medium text-foreground">
                    {deleting.titleRo}
                  </span>{' '}
                  — {t.delete.body}
                </>
              ) : (
                t.delete.body
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {ro.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleting) deleteMutation.mutate(deleting.id);
              }}
            >
              {t.delete.cta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ServicesTableSkeleton() {
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
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="ml-auto h-4 w-16" />
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      ))}
    </div>
  );
}
