import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
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

import { FaqCategoryFormSheet } from '@/features/faq/category-form-sheet';
import { FaqItemFormSheet } from '@/features/faq/item-form-sheet';
import {
  fetchFaq,
  deleteFaqCategory,
  deleteFaqItem,
  updateFaqCategory,
  updateFaqItem,
} from '@/features/faq/data';
import { faqQueryKey } from '@/features/faq/query-key';
import type { FaqCategory, FaqItem } from '@/features/faq/types';

const t = ro.faq;

/**
 * Reordering swaps the two neighbours' `sortOrder` values. Equal values can
 * only come from data written outside the panel, where a plain swap would be a
 * silent no-op — so the moved row takes its neighbour's slot and the neighbour
 * is pushed to the far side.
 */
function swappedOrders(
  moved: { sortOrder: number },
  neighbour: { sortOrder: number },
  direction: -1 | 1,
): [number, number] {
  if (moved.sortOrder !== neighbour.sortOrder) {
    return [neighbour.sortOrder, moved.sortOrder];
  }
  return [neighbour.sortOrder, neighbour.sortOrder - direction];
}

export function FaqPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: faqQueryKey,
    queryFn: fetchFaq,
  });

  const categories = React.useMemo(() => data ?? [], [data]);

  const [categoryFormOpen, setCategoryFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] =
    React.useState<FaqCategory | null>(null);
  const [deletingCategory, setDeletingCategory] =
    React.useState<FaqCategory | null>(null);

  const [itemFormOpen, setItemFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<FaqItem | null>(null);
  const [itemCategoryId, setItemCategoryId] = React.useState('');
  const [deletingItem, setDeletingItem] = React.useState<FaqItem | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: faqQueryKey });

  const categoryActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateFaqCategory(id, { active }),
    onSuccess: (c) => {
      toast.success(c.active ? t.toast.shown : t.toast.hidden);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const itemActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateFaqItem(id, { active }),
    onSuccess: (i) => {
      toast.success(i.active ? t.toast.shown : t.toast.hidden);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const moveCategory = useMutation({
    mutationFn: async ({
      index,
      direction,
    }: {
      index: number;
      direction: -1 | 1;
    }) => {
      const moved = categories[index];
      const neighbour = categories[index + direction];
      const [movedOrder, neighbourOrder] = swappedOrders(
        moved,
        neighbour,
        direction,
      );
      await updateFaqCategory(moved.id, { sortOrder: movedOrder });
      await updateFaqCategory(neighbour.id, { sortOrder: neighbourOrder });
    },
    onSuccess: invalidate,
    onError: () => toast.error(t.toast.error),
  });

  const moveItem = useMutation({
    mutationFn: async ({
      items,
      index,
      direction,
    }: {
      items: FaqItem[];
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
      await updateFaqItem(moved.id, { sortOrder: movedOrder });
      await updateFaqItem(neighbour.id, { sortOrder: neighbourOrder });
    },
    onSuccess: invalidate,
    onError: () => toast.error(t.toast.error),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => deleteFaqCategory(id),
    onSuccess: () => {
      toast.success(t.toast.deleted);
      setDeletingCategory(null);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => deleteFaqItem(id),
    onSuccess: () => {
      toast.success(t.toast.itemDeleted);
      setDeletingItem(null);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };
  const openEditCategory = (category: FaqCategory) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };
  const openCreateItem = (categoryId: string) => {
    setEditingItem(null);
    setItemCategoryId(categoryId);
    setItemFormOpen(true);
  };
  const openEditItem = (item: FaqItem) => {
    setEditingItem(item);
    setItemCategoryId(item.categoryId);
    setItemFormOpen(true);
  };

  const busy =
    moveCategory.isPending ||
    moveItem.isPending ||
    categoryActive.isPending ||
    itemActive.isPending;

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
            <Button onClick={openCreateCategory}>
              <Plus />
              {t.newCategory}
            </Button>
          </>
        }
      />

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
        <FaqSkeleton />
      ) : categories.length === 0 ? (
        <Card className="py-0">
          <EmptyState
            icon={HelpCircle}
            title={t.empty.title}
            description={t.empty.body}
            className="py-16"
            action={
              <Button onClick={openCreateCategory}>
                <Plus />
                {t.newCategory}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              isFirst={index === 0}
              isLast={index === categories.length - 1}
              busy={busy}
              onMove={(direction) => moveCategory.mutate({ index, direction })}
              onMoveItem={(itemIndex, direction) =>
                moveItem.mutate({
                  items: category.items,
                  index: itemIndex,
                  direction,
                })
              }
              onToggle={(active) =>
                categoryActive.mutate({ id: category.id, active })
              }
              onToggleItem={(id, active) => itemActive.mutate({ id, active })}
              onEdit={() => openEditCategory(category)}
              onDelete={() => setDeletingCategory(category)}
              onAddItem={() => openCreateItem(category.id)}
              onEditItem={openEditItem}
              onDeleteItem={setDeletingItem}
            />
          ))}
        </div>
      )}

      <FaqCategoryFormSheet
        category={editingCategory}
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
      />

      <FaqItemFormSheet
        item={editingItem}
        categories={categories}
        defaultCategoryId={itemCategoryId}
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
      />

      <AlertDialog
        open={deletingCategory !== null}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteCategory.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCategory && (
                <>
                  <span className="font-medium text-foreground">
                    {deletingCategory.titleRo}
                  </span>{' '}
                  — {t.deleteCategory.body}
                  {deletingCategory.items.length > 0 && (
                    <>
                      {' '}
                      {t.deleteCategory.withItems(deletingCategory.items.length)}
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategory.isPending}>
              {ro.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCategory.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deletingCategory)
                  deleteCategory.mutate(deletingCategory.id);
              }}
            >
              {t.deleteCategory.cta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deletingItem !== null}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteItem.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingItem && (
                <>
                  <span className="font-medium text-foreground">
                    {deletingItem.questionRo}
                  </span>{' '}
                  — {t.deleteItem.body}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteItem.isPending}>
              {ro.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteItem.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deletingItem) deleteItem.mutate(deletingItem.id);
              }}
            >
              {t.deleteItem.cta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryCard({
  category,
  isFirst,
  isLast,
  busy,
  onMove,
  onMoveItem,
  onToggle,
  onToggleItem,
  onEdit,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: {
  category: FaqCategory;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onMove: (direction: -1 | 1) => void;
  onMoveItem: (index: number, direction: -1 | 1) => void;
  onToggle: (active: boolean) => void;
  onToggleItem: (id: string, active: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddItem: () => void;
  onEditItem: (item: FaqItem) => void;
  onDeleteItem: (item: FaqItem) => void;
}) {
  const visibleItems = category.items.filter((i) => i.active).length;
  // The public page skips a section with nothing published in it, which is easy
  // to cause by accident and impossible to see from the site.
  const silentlyHidden = category.active && visibleItems === 0;

  return (
    <Card className={cn('gap-0 py-0', !category.active && 'opacity-70')}>
      <header className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-5">
        <div className="flex items-start gap-2">
          <div className="flex shrink-0 flex-col">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground"
              aria-label={t.moveUp}
              disabled={isFirst || busy}
              onClick={() => onMove(-1)}
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground"
              aria-label={t.moveDown}
              disabled={isLast || busy}
              onClick={() => onMove(1)}
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>

          <div className="min-w-0 space-y-1">
            <h2 className="text-base leading-tight font-semibold">
              {category.titleRo}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5 font-medium">
                #{category.slug}
              </code>
              <span>·</span>
              <span>{t.questionCount(category.items.length)}</span>
              {!category.active && (
                <>
                  <span>·</span>
                  <span className="font-medium">{t.hiddenSection}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:ml-auto">
          <Switch
            checked={category.active}
            disabled={busy}
            onCheckedChange={onToggle}
            aria-label={category.active ? t.active.on : t.active.off}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            aria-label={ro.common.edit}
            onClick={onEdit}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={ro.common.delete}
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </header>

      {silentlyHidden && (
        <p className="flex items-start gap-2 border-b bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
          <AlertTriangle className="mt-px size-3.5 shrink-0" />
          {t.noVisibleItems}
        </p>
      )}

      {category.items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground sm:px-5">
          {t.emptyItems.body}
        </p>
      ) : (
        <ul className="divide-y">
          {category.items.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                'flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-5',
                !item.active && 'opacity-60',
              )}
            >
              <div className="flex shrink-0 flex-col">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground"
                  aria-label={t.moveUp}
                  disabled={index === 0 || busy}
                  onClick={() => onMoveItem(index, -1)}
                >
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground"
                  aria-label={t.moveDown}
                  disabled={index === category.items.length - 1 || busy}
                  onClick={() => onMoveItem(index, 1)}
                >
                  <ChevronDown className="size-3.5" />
                </Button>
              </div>

              <p className="min-w-0 flex-1 text-sm text-pretty">
                {item.questionRo}
              </p>

              <div className="flex items-center gap-1 self-end sm:self-auto">
                <Switch
                  checked={item.active}
                  disabled={busy}
                  onCheckedChange={(active) => onToggleItem(item.id, active)}
                  aria-label={item.active ? t.active.on : t.active.off}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  aria-label={ro.common.edit}
                  onClick={() => onEditItem(item)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={ro.common.delete}
                  onClick={() => onDeleteItem(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t px-4 py-3 sm:px-5">
        <Button variant="outline" size="sm" onClick={onAddItem}>
          <Plus />
          {t.newItem}
        </Button>
      </div>
    </Card>
  );
}

function FaqSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="gap-0 py-0">
          <div className="flex items-center gap-3 border-b px-5 py-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="ml-auto h-5 w-9 rounded-full" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 3 }).map((__, j) => (
              <div key={j} className="flex items-center gap-3 px-5 py-3.5">
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="ml-auto h-5 w-9 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
