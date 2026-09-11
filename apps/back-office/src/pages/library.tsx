import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  Library as LibraryIcon,
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

import { MaterialFormSheet } from '@/features/library/material-form-sheet';
import { MaterialCategoriesSheet } from '@/features/library/categories-manager-sheet';
import {
  fetchMaterials,
  fetchMaterialCategories,
  deleteMaterial,
  updateMaterial,
} from '@/features/library/api';
import {
  materialCategoriesQueryKey,
  materialsQueryKey,
} from '@/features/library/query-key';
import type { AgeKey, Material } from '@/features/library/types';

const t = ro.library;

/** Reordering swaps neighbours' `sortOrder`; see the FAQ page for the equal case. */
function swappedOrders(
  moved: Material,
  neighbour: Material,
  direction: -1 | 1,
): [number, number] {
  if (moved.sortOrder !== neighbour.sortOrder) {
    return [neighbour.sortOrder, moved.sortOrder];
  }
  return [neighbour.sortOrder, neighbour.sortOrder - direction];
}

export function LibraryPage() {
  const queryClient = useQueryClient();
  const materialsQuery = useQuery({
    queryKey: materialsQueryKey,
    queryFn: fetchMaterials,
  });
  const categoriesQuery = useQuery({
    queryKey: materialCategoriesQueryKey,
    queryFn: fetchMaterialCategories,
  });

  const items = React.useMemo(
    () => materialsQuery.data ?? [],
    [materialsQuery.data],
  );
  const categories = React.useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );

  const categoryName = React.useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.nameRo])),
    [categories],
  );
  const countByCategory = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of items) {
      counts[m.categoryId] = (counts[m.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const missingFiles = items.filter((m) => !m.fileUrl).length;

  const [formOpen, setFormOpen] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Material | null>(null);
  const [deleting, setDeleting] = React.useState<Material | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: materialsQueryKey });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateMaterial(id, { active }),
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
      await updateMaterial(moved.id, { sortOrder: movedOrder });
      await updateMaterial(neighbour.id, { sortOrder: neighbourOrder });
    },
    onSuccess: invalidate,
    onError: () => toast.error(t.toast.error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMaterial(id),
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
  const openEdit = (m: Material) => {
    setEditing(m);
    setFormOpen(true);
  };

  const isLoading = materialsQuery.isLoading || categoriesQuery.isLoading;
  const isError = materialsQuery.isError || categoriesQuery.isError;
  const isFetching = materialsQuery.isFetching || categoriesQuery.isFetching;
  const busy = moveMutation.isPending || activeMutation.isPending;

  const refetchAll = () => {
    materialsQuery.refetch();
    categoriesQuery.refetch();
  };

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
              onClick={refetchAll}
              disabled={isFetching}
            >
              <RefreshCw className={cn(isFetching && 'animate-spin')} />
              {t.refresh}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoriesOpen(true)}
            >
              <Tags />
              {t.categories}
            </Button>
            <Button onClick={openCreate} disabled={categories.length === 0}>
              <Plus />
              {t.newItem}
            </Button>
          </>
        }
      />

      {/* Every material is currently fileless; say it once instead of per row. */}
      {missingFiles > 0 && (
        <p className="flex items-start gap-2.5 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          {t.missingFilesNote(missingFiles)}
        </p>
      )}

      {isError ? (
        <Card className="py-0">
          <EmptyState
            icon={AlertTriangle}
            title={ro.states.errorTitle}
            description={ro.states.errorBody}
            className="py-16"
            action={
              <Button variant="outline" onClick={refetchAll}>
                <RefreshCw />
                {ro.common.retry}
              </Button>
            }
          />
        </Card>
      ) : isLoading ? (
        <LibrarySkeleton />
      ) : items.length === 0 ? (
        <Card className="py-0">
          <EmptyState
            icon={LibraryIcon}
            title={t.empty.title}
            description={t.empty.body}
            className="py-16"
            action={
              <Button onClick={openCreate} disabled={categories.length === 0}>
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

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={m.access === 'paid' ? 'default' : 'secondary'}
                  >
                    {m.access === 'paid' ? `${m.price ?? 0} €` : t.access.free}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {categoryName[m.categoryId] ?? m.categorySlug}
                  </span>
                  {m.flags.map((flag) => (
                    <Badge key={flag} variant="outline">
                      {t.flag[flag]}
                    </Badge>
                  ))}
                </div>
                <p className="font-medium text-pretty">{m.titleRo}</p>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="size-3" />
                    {m.fileUrl ? (
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-4 hover:text-primary hover:underline"
                      >
                        {m.fileName || m.slug}
                      </a>
                    ) : (
                      <span className="italic">{t.noFile}</span>
                    )}
                  </span>
                  <span>·</span>
                  <span>
                    {m.ageKeys.length === 0
                      ? t.allAges
                      : m.ageKeys
                          .map((k) => ro.ages[k as AgeKey] ?? k)
                          .join(', ')}
                  </span>
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

      <MaterialFormSheet
        material={editing}
        categories={categories}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <MaterialCategoriesSheet
        categories={categories}
        countByCategory={countByCategory}
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
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

function LibrarySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="flex-row items-start gap-4 p-5">
          <Skeleton className="h-12 w-6" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
        </Card>
      ))}
    </div>
  );
}
