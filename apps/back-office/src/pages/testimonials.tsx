import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Pencil,
  Plus,
  Quote,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
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
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

import { TestimonialFormSheet } from '@/features/testimonials/testimonial-form-sheet';
import {
  fetchTestimonials,
  deleteTestimonial,
  updateTestimonial,
} from '@/features/testimonials/api';
import { testimonialsQueryKey } from '@/features/testimonials/query-key';
import type { Testimonial } from '@/features/testimonials/types';

const t = ro.testimonials;

/** Reordering swaps neighbours' `sortOrder`; see the FAQ page for the equal-value case. */
function swappedOrders(
  moved: Testimonial,
  neighbour: Testimonial,
  direction: -1 | 1,
): [number, number] {
  if (moved.sortOrder !== neighbour.sortOrder) {
    return [neighbour.sortOrder, moved.sortOrder];
  }
  return [neighbour.sortOrder, neighbour.sortOrder - direction];
}

export function TestimonialsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: testimonialsQueryKey,
    queryFn: fetchTestimonials,
  });

  const items = React.useMemo(() => data ?? [], [data]);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Testimonial | null>(null);
  const [deleting, setDeleting] = React.useState<Testimonial | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: testimonialsQueryKey });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateTestimonial(id, { active }),
    onSuccess: (item) => {
      toast.success(item.active ? t.toast.shown : t.toast.hidden);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const moveMutation = useMutation({
    mutationFn: async ({
      index,
      direction,
    }: {
      index: number;
      direction: -1 | 1;
    }) => {
      const moved = items[index];
      const neighbour = items[index + direction];
      const [movedOrder, neighbourOrder] = swappedOrders(
        moved,
        neighbour,
        direction,
      );
      await updateTestimonial(moved.id, { sortOrder: movedOrder });
      await updateTestimonial(neighbour.id, { sortOrder: neighbourOrder });
    },
    onSuccess: invalidate,
    onError: () => toast.error(t.toast.error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
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
  const openEdit = (item: Testimonial) => {
    setEditing(item);
    setFormOpen(true);
  };

  const busy = moveMutation.isPending || activeMutation.isPending;

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
            <Button onClick={openCreate}>
              <Plus />
              {t.newItem}
            </Button>
          </>
        }
      />

      {/* The site has shipped invented reviews twice. Say the rule out loud. */}
      <p className="flex items-start gap-2.5 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        {t.integrityNote}
      </p>

      {isError ? (
        <Card className="py-0">
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
        </Card>
      ) : isLoading ? (
        <TestimonialsSkeleton />
      ) : items.length === 0 ? (
        <Card className="py-0">
          <EmptyState
            icon={Quote}
            title={t.empty.title}
            description={t.empty.body}
            className="py-16"
            action={
              <Button onClick={openCreate}>
                <Plus />
                {t.newItem}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card
              key={item.id}
              className={cn(
                'flex-row items-start gap-4 p-4 sm:p-5',
                !item.active && 'opacity-60',
              )}
            >
              <div className="flex shrink-0 flex-col">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground"
                  aria-label={t.moveUp}
                  disabled={index === 0 || busy}
                  onClick={() => moveMutation.mutate({ index, direction: -1 })}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground"
                  aria-label={t.moveDown}
                  disabled={index === items.length - 1 || busy}
                  onClick={() => moveMutation.mutate({ index, direction: 1 })}
                >
                  <ChevronDown className="size-4" />
                </Button>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <blockquote className="text-sm leading-relaxed text-pretty">
                  {item.quoteRo}
                </blockquote>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      'font-medium',
                      item.author ? 'text-foreground' : 'italic',
                    )}
                  >
                    {item.author ?? t.anonymous}
                  </span>
                  {item.roleRo && (
                    <>
                      <span>·</span>
                      <span>{item.roleRo}</span>
                    </>
                  )}
                  {item.source && (
                    <>
                      <span>·</span>
                      <span>{item.source}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Switch
                  checked={item.active}
                  disabled={busy}
                  onCheckedChange={(active) =>
                    activeMutation.mutate({ id: item.id, active })
                  }
                  aria-label={item.active ? t.active.on : t.active.off}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  aria-label={ro.common.edit}
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={ro.common.delete}
                  onClick={() => setDeleting(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TestimonialFormSheet
        testimonial={editing}
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
              {deleting && (
                <>
                  <span className="font-medium text-foreground">
                    {deleting.author ?? t.anonymous}
                  </span>{' '}
                  — {t.delete.body}
                </>
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

function TestimonialsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex-row items-start gap-4 p-5">
          <Skeleton className="h-12 w-6" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
        </Card>
      ))}
    </div>
  );
}
