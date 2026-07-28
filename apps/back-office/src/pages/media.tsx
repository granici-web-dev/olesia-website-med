import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  ExternalLink,
  Info,
  Pencil,
  Plus,
  RefreshCw,
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

import { MediaFormSheet } from '@/features/media/media-form-sheet';
import {
  fetchMedia,
  deleteMedia,
  updateMedia,
} from '@/features/media/data';
import { mediaQueryKey } from '@/features/media/query-key';
import type { MediaAppearance } from '@/features/media/types';

const t = ro.media;

const dateFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Reordering swaps neighbours' `sortOrder`; see the FAQ page for the equal case. */
function swappedOrders(
  moved: MediaAppearance,
  neighbour: MediaAppearance,
  direction: -1 | 1,
): [number, number] {
  if (moved.sortOrder !== neighbour.sortOrder) {
    return [neighbour.sortOrder, moved.sortOrder];
  }
  return [neighbour.sortOrder, neighbour.sortOrder - direction];
}

export function MediaPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: mediaQueryKey,
    queryFn: fetchMedia,
  });

  const items = React.useMemo(() => data ?? [], [data]);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MediaAppearance | null>(null);
  const [deleting, setDeleting] = React.useState<MediaAppearance | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: mediaQueryKey });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateMedia(id, { active }),
    onSuccess: (m) => {
      toast.success(m.active ? t.toast.shown : t.toast.hidden);
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
      await updateMedia(moved.id, { sortOrder: movedOrder });
      await updateMedia(neighbour.id, { sortOrder: neighbourOrder });
    },
    onSuccess: invalidate,
    onError: () => toast.error(t.toast.error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMedia(id),
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
  const openEdit = (m: MediaAppearance) => {
    setEditing(m);
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

      {/* Why there is no "upload video" button anywhere on this page. */}
      <p className="flex items-start gap-2.5 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        {t.embedNote}
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
        <MediaSkeleton />
      ) : items.length === 0 ? (
        <Card className="py-0">
          <EmptyState
            icon={Clapperboard}
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
          {items.map((m, index) => (
            <Card
              key={m.id}
              className={cn(
                'flex-row items-start gap-4 p-4 sm:p-5',
                !m.active && 'opacity-60',
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

              <div className="hidden aspect-video w-32 shrink-0 overflow-hidden rounded-md border bg-muted sm:block">
                <img
                  src={m.thumbUrl}
                  alt=""
                  className="size-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{t.kind[m.kind]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {m.show ? `${m.show} · ${m.outlet}` : m.outlet}
                  </span>
                </div>
                <p className="font-medium text-pretty">{m.titleRo}</p>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {m.date ? dateFmt.format(new Date(m.date)) : t.noDate}
                  </span>
                  {m.duration && (
                    <>
                      <span>·</span>
                      <span>{m.duration}</span>
                    </>
                  )}
                  <span>·</span>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 underline-offset-4 hover:text-primary hover:underline"
                  >
                    {t.provider[m.embedProvider]}
                    <ExternalLink className="size-3" />
                  </a>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Switch
                  checked={m.active}
                  disabled={busy}
                  onCheckedChange={(active) =>
                    activeMutation.mutate({ id: m.id, active })
                  }
                  aria-label={m.active ? t.active.on : t.active.off}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  aria-label={ro.common.edit}
                  onClick={() => openEdit(m)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={ro.common.delete}
                  onClick={() => setDeleting(m)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <MediaFormSheet
        item={editing}
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
                    {deleting.titleRo}
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

function MediaSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex-row items-start gap-4 p-5">
          <Skeleton className="h-12 w-6" />
          <Skeleton className="hidden aspect-video w-32 shrink-0 rounded-md sm:block" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
        </Card>
      ))}
    </div>
  );
}
