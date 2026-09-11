import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ApiError } from '@/api/http';
import { ro } from '@/i18n/ro';

import {
  createMaterialCategory,
  deleteMaterialCategory,
  updateMaterialCategory,
} from '@/features/library/data';
import {
  materialCategoriesQueryKey,
  materialsQueryKey,
} from '@/features/library/query-key';
import type { MaterialCategory } from '@/features/library/types';

const t = ro.library;
const f = t.categoryForm;

/** The three names of one category, while it is being edited. */
interface CategoryNames {
  nameRo: string;
  nameEn: string;
  nameRu: string;
}

/**
 * Manage the library's categories. Deletion is refused server-side while
 * materials still point at a category, so nothing disappears silently — the
 * count next to each name is there to make that obvious before the click.
 *
 * Renaming is here too. `PATCH /materials/categories/:id` existed and nothing
 * called it, so a typo in a category name could only be fixed by deleting the
 * category — which is refused while any material sits under it (audit A10,
 * F15). The slug stays as it was, so links already sent keep working.
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
  const [deleting, setDeleting] = React.useState<MaterialCategory | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editNames, setEditNames] = React.useState<CategoryNames>({
    nameRo: '',
    nameEn: '',
    nameRu: '',
  });

  const startRename = (c: MaterialCategory) => {
    setEditingId(c.id);
    setEditNames({
      nameRo: c.nameRo,
      nameEn: c.nameEn,
      nameRu: c.nameRu ?? '',
    });
  };

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

  const renameMutation = useMutation({
    mutationFn: (id: string) =>
      updateMaterialCategory(id, {
        nameRo: editNames.nameRo.trim(),
        nameEn: editNames.nameEn.trim(),
        nameRu: editNames.nameRu.trim() || null,
      }),
    onSuccess: () => {
      toast.success(t.toast.categoryRenamed);
      setEditingId(null);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMaterialCategory(id),
    onSuccess: () => {
      toast.success(t.toast.categoryDeleted);
      setDeleting(null);
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
                const renaming = editingId === c.id;
                const saving =
                  renameMutation.isPending && renameMutation.variables === c.id;

                if (renaming) {
                  return (
                    <li key={c.id} className="space-y-2 px-3 py-2.5">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          value={editNames.nameRo}
                          aria-label={f.nameRo}
                          onChange={(e) =>
                            setEditNames((n) => ({
                              ...n,
                              nameRo: e.target.value,
                            }))
                          }
                        />
                        <Input
                          value={editNames.nameEn}
                          aria-label={f.nameEn}
                          onChange={(e) =>
                            setEditNames((n) => ({
                              ...n,
                              nameEn: e.target.value,
                            }))
                          }
                        />
                        <Input
                          value={editNames.nameRu}
                          aria-label={f.nameRu}
                          onChange={(e) =>
                            setEditNames((n) => ({
                              ...n,
                              nameRu: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={
                            saving ||
                            editNames.nameRo.trim().length === 0 ||
                            editNames.nameEn.trim().length === 0
                          }
                          onClick={() => renameMutation.mutate(c.id)}
                        >
                          {saving ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Check />
                          )}
                          {f.renameSave}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={saving}
                          onClick={() => setEditingId(null)}
                        >
                          <X />
                          {f.renameCancel}
                        </Button>
                      </div>
                    </li>
                  );
                }

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
                      className="size-8 shrink-0 text-muted-foreground"
                      aria-label={f.rename}
                      disabled={renameMutation.isPending}
                      onClick={() => startRename(c)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={ro.common.delete}
                      disabled={deleteMutation.isPending}
                      onClick={() => setDeleting(c)}
                    >
                      {deleteMutation.isPending &&
                      deleteMutation.variables === c.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
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

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{f.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (
                <>
                  <span className="font-medium text-foreground">
                    {deleting.nameRo}
                  </span>{' '}
                  — {f.deleteBody}
                  {(countByCategory[deleting.id] ?? 0) > 0 && (
                    <> ({f.count(countByCategory[deleting.id] ?? 0)})</>
                  )}
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
              onClick={(event) => {
                event.preventDefault();
                if (deleting) deleteMutation.mutate(deleting.id);
              }}
            >
              {f.deleteCta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
