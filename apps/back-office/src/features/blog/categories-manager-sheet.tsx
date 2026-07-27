import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Pencil, Plus, Tag, Trash2, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
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
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  postCountForCategory,
  slugify,
} from '@/features/blog/data';
import { categoriesQueryKey, postsQueryKey } from '@/features/blog/query-keys';
import type { Category } from '@/features/blog/types';
import { ro } from '@/i18n/ro';

const c = ro.blog.categories;

export function CategoriesManagerSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
    enabled: open,
  });
  const categories = data ?? [];

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [nameRo, setNameRo] = React.useState('');
  const [nameEn, setNameEn] = React.useState('');
  const [nameRu, setNameRu] = React.useState('');
  const [deleting, setDeleting] = React.useState<Category | null>(null);

  const reset = () => {
    setEditingId(null);
    setNameRo('');
    setNameEn('');
    setNameRu('');
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
    queryClient.invalidateQueries({ queryKey: postsQueryKey });
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = {
        slug: slugify(nameRo),
        nameRo: nameRo.trim(),
        nameEn: nameEn.trim(),
        // Optional: an untranslated category shows its RO name on the site.
        nameRu: nameRu.trim() || null,
      };
      return editingId
        ? updateCategory(editingId, input)
        : createCategory(input);
    },
    onSuccess: () => {
      toast.success(editingId ? c.toast.updated : c.toast.created);
      reset();
      invalidate();
    },
    onError: () => toast.error(c.toast.error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success(c.toast.deleted);
      setDeleting(null);
      invalidate();
    },
    onError: () => toast.error(c.toast.error),
  });

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setNameRo(cat.nameRo);
    setNameEn(cat.nameEn);
    setNameRu(cat.nameRu ?? '');
  };

  const canSave = nameRo.trim() !== '' && nameEn.trim() !== '';

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{c.title}</SheetTitle>
          <SheetDescription>{c.subtitle}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {c.empty}
            </p>
          ) : (
            <ul className="divide-y">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center gap-3 py-2.5"
                >
                  <Tag className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {cat.nameRo}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {cat.nameEn} · /{cat.slug}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    aria-label={ro.common.edit}
                    onClick={() => startEdit(cat)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={ro.common.delete}
                    onClick={() => setDeleting(cat)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add / edit form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) saveMutation.mutate();
          }}
          className="space-y-3 border-t px-6 py-4"
        >
          <p className="text-sm font-medium">
            {editingId ? ro.common.edit : c.addTitle}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="cat-ro" className="text-xs">
                {c.nameRo}
              </Label>
              <Input
                id="cat-ro"
                value={nameRo}
                onChange={(e) => setNameRo(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-en" className="text-xs">
                {c.nameEn}
              </Label>
              <Input
                id="cat-en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-ru" className="text-xs">
                {c.nameRu}
              </Label>
              <Input
                id="cat-ru"
                value={nameRu}
                onChange={(e) => setNameRu(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={!canSave || saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : editingId ? (
                <Check />
              ) : (
                <Plus />
              )}
              {editingId ? ro.common.save : c.add}
            </Button>
            {editingId && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={reset}
                disabled={saveMutation.isPending}
              >
                <X />
                {ro.common.cancel}
              </Button>
            )}
            {nameRo.trim() && (
              <Badge variant="muted" className="ml-auto font-mono">
                /{slugify(nameRo)}
              </Badge>
            )}
          </div>
        </form>
      </SheetContent>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{c.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (
                <>
                  <span className="font-medium text-foreground">
                    {deleting.nameRo}
                  </span>{' '}
                  — {c.deleteBody}
                  {postCountForCategory(deleting.id) > 0 && (
                    <> ({postCountForCategory(deleting.id)})</>
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
              onClick={(e) => {
                e.preventDefault();
                if (deleting) deleteMutation.mutate(deleting.id);
              }}
            >
              {c.deleteCta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
