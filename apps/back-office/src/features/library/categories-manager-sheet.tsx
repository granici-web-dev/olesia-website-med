import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ApiError } from '@/api/http';
import { ro } from '@/i18n/ro';

import {
  createMaterialCategory,
  deleteMaterialCategory,
} from '@/features/library/data';
import {
  materialCategoriesQueryKey,
  materialsQueryKey,
} from '@/features/library/query-key';
import type { MaterialCategory } from '@/features/library/types';

const t = ro.library;
const f = t.categoryForm;

/**
 * Manage the library's categories. Deletion is refused server-side while
 * materials still point at a category, so nothing disappears silently — the
 * count next to each name is there to make that obvious before the click.
 */
export function MaterialCategoriesSheet({
  categories,
  countByCategory,
  open,
  onOpenChange,
}: {
  categories: MaterialCategory[];
  countByCategory: Record<string, number>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [nameRo, setNameRo] = React.useState('');
  const [nameEn, setNameEn] = React.useState('');
  const [nameRu, setNameRu] = React.useState('');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: materialCategoriesQueryKey });
    queryClient.invalidateQueries({ queryKey: materialsQueryKey });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createMaterialCategory({
        nameRo: nameRo.trim(),
        nameEn: nameEn.trim(),
        nameRu: nameRu.trim() || null,
      }),
    onSuccess: () => {
      toast.success(t.toast.categoryCreated);
      setNameRo('');
      setNameEn('');
      setNameRu('');
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMaterialCategory(id),
    onSuccess: () => {
      toast.success(t.toast.categoryDeleted);
      invalidate();
    },
    onError: (err) => {
      const inUse =
        (err instanceof ApiError && err.status === 409) ||
        (err instanceof Error && err.message === 'material_category_in_use');
      toast.error(inUse ? t.toast.categoryInUse : t.toast.error);
    },
  });

  const canAdd =
    nameRo.trim().length > 0 &&
    nameEn.trim().length > 0 &&
    !createMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{f.title}</SheetTitle>
          <SheetDescription>{f.subtitle}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">{f.empty}</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {categories.map((c) => {
                const count = countByCategory[c.id] ?? 0;
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.nameRo}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.count(count)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={ro.common.delete}
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(c.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="lib-cat-ro">{f.nameRo}</Label>
              <Input
                id="lib-cat-ro"
                value={nameRo}
                onChange={(e) => setNameRo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lib-cat-en">{f.nameEn}</Label>
              <Input
                id="lib-cat-en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lib-cat-ru">{f.nameRu}</Label>
              <Input
                id="lib-cat-ru"
                value={nameRu}
                onChange={(e) => setNameRu(e.target.value)}
              />
            </div>
          </div>
          <p className="-mt-3 text-xs text-muted-foreground">
            {ro.common.ruFallbackHint}
          </p>

          <Button
            disabled={!canAdd}
            onClick={() => createMutation.mutate()}
            className="w-full"
          >
            {createMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus />
            )}
            {createMutation.isPending ? f.adding : f.add}
          </Button>
        </div>

        <div className="flex items-center justify-end border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {f.close}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
