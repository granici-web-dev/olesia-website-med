import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ro } from '@/i18n/ro';

import { createFaqCategory, updateFaqCategory } from '@/features/faq/data';
import { faqQueryKey } from '@/features/faq/query-key';
import type { FaqCategory, FaqCategoryInput } from '@/features/faq/types';

const t = ro.faq;
const f = t.categoryForm;

const schema = z.object({
  titleRo: z.string().trim().min(1, f.required),
  titleEn: z.string().trim().min(1, f.required),
  /** RU stays optional — the public page falls back to the Romanian title. */
  titleRu: z.string(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  titleRo: '',
  titleEn: '',
  titleRu: '',
  active: true,
};

function fromCategory(c: FaqCategory): FormValues {
  return {
    titleRo: c.titleRo,
    titleEn: c.titleEn,
    titleRu: c.titleRu ?? '',
    active: c.active,
  };
}

function toInput(values: FormValues): FaqCategoryInput {
  return {
    titleRo: values.titleRo.trim(),
    titleEn: values.titleEn.trim(),
    titleRu: values.titleRu.trim() || null,
    active: values.active,
  };
}

export function FaqCategoryFormSheet({
  category,
  open,
  onOpenChange,
}: {
  /** Editing an existing section, or null to create one. */
  category: FaqCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = category !== null;
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(category ? fromCategory(category) : EMPTY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? updateFaqCategory(category.id, toInput(values))
        : createFaqCategory(toInput(values)),
    onSuccess: () => {
      toast.success(isEdit ? t.toast.updated : t.toast.created);
      queryClient.invalidateQueries({ queryKey: faqQueryKey });
      onOpenChange(false);
    },
    onError: () => toast.error(t.toast.error),
  });

  const errors = form.formState.errors;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-lg"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{isEdit ? f.editTitle : f.createTitle}</SheetTitle>
          <SheetDescription>
            {isEdit ? f.editSubtitle : f.createSubtitle}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <TextField
                id="faq-cat-ro"
                label={f.titleRo}
                placeholder={f.titlePlaceholderRo}
                error={errors.titleRo?.message}
                {...form.register('titleRo')}
              />
              <TextField
                id="faq-cat-en"
                label={f.titleEn}
                placeholder={f.titlePlaceholderEn}
                error={errors.titleEn?.message}
                {...form.register('titleEn')}
              />
              <TextField
                id="faq-cat-ru"
                label={f.titleRu}
                placeholder={f.titlePlaceholderRu}
                hint={ro.common.ruFallbackHint}
                {...form.register('titleRu')}
              />
            </div>

            {/* The anchor exists only once the server has assigned it. */}
            {isEdit && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>{t.anchor}</Label>
                  <code className="block w-fit rounded bg-muted px-2 py-1 text-xs font-medium">
                    /faq#{category.slug}
                  </code>
                  <p className="text-xs text-muted-foreground">
                    {f.anchorHint}
                  </p>
                </div>
              </>
            )}

            <Separator />

            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="faq-cat-active" className="cursor-pointer">
                      {f.activeField}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {f.activeHint}
                    </p>
                  </div>
                  <Switch
                    id="faq-cat-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {ro.common.cancel}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? f.saving : f.save}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

const TextField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & {
    label: string;
    error?: string;
    hint?: string;
  }
>(function TextField({ id, label, error, hint, ...props }, ref) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} ref={ref} aria-invalid={!!error} {...props} />
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
});
