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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ro } from '@/i18n/ro';

import { createFaqItem, updateFaqItem } from '@/features/faq/data';
import { faqQueryKey } from '@/features/faq/query-key';
import type { FaqCategory, FaqItem, FaqItemInput } from '@/features/faq/types';

const t = ro.faq;
const f = t.itemForm;

const schema = z.object({
  categoryId: z.string().min(1, f.required),
  questionRo: z.string().trim().min(1, f.required),
  questionEn: z.string().trim().min(1, f.required),
  /** RU is optional throughout — the page falls back to Romanian. */
  questionRu: z.string(),
  answerRo: z.string().trim().min(1, f.required),
  answerEn: z.string().trim().min(1, f.required),
  answerRu: z.string(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function emptyValues(categoryId: string): FormValues {
  return {
    categoryId,
    questionRo: '',
    questionEn: '',
    questionRu: '',
    answerRo: '',
    answerEn: '',
    answerRu: '',
    active: true,
  };
}

function fromItem(i: FaqItem): FormValues {
  return {
    categoryId: i.categoryId,
    questionRo: i.questionRo,
    questionEn: i.questionEn,
    questionRu: i.questionRu ?? '',
    answerRo: i.answerRo,
    answerEn: i.answerEn,
    answerRu: i.answerRu ?? '',
    active: i.active,
  };
}

function toInput(values: FormValues): FaqItemInput {
  return {
    categoryId: values.categoryId,
    questionRo: values.questionRo.trim(),
    questionEn: values.questionEn.trim(),
    questionRu: values.questionRu.trim() || null,
    answerRo: values.answerRo.trim(),
    answerEn: values.answerEn.trim(),
    answerRu: values.answerRu.trim() || null,
    active: values.active,
  };
}

export function FaqItemFormSheet({
  item,
  categories,
  defaultCategoryId,
  open,
  onOpenChange,
}: {
  /** Editing an existing question, or null to create one. */
  item: FaqItem | null;
  /** All sections — the question can be moved between them. */
  categories: FaqCategory[];
  /** Section pre-selected when creating (the one whose "add" was clicked). */
  defaultCategoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = item !== null;
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(defaultCategoryId),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(item ? fromItem(item) : emptyValues(defaultCategoryId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item, defaultCategoryId]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? updateFaqItem(item.id, toInput(values))
        : createFaqItem(toInput(values)),
    onSuccess: () => {
      toast.success(isEdit ? t.toast.itemUpdated : t.toast.itemCreated);
      queryClient.invalidateQueries({ queryKey: faqQueryKey });
      onOpenChange(false);
    },
    onError: () => toast.error(t.toast.error),
  });

  const errors = form.formState.errors;
  const roHasError = !!(errors.questionRo || errors.answerRo);
  const enHasError = !!(errors.questionEn || errors.answerEn);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-xl"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{isEdit ? f.editTitle : f.createTitle}</SheetTitle>
          <SheetDescription>
            {isEdit ? f.editSubtitle : f.createSubtitle}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(
            (v) => mutation.mutate(v),
            () => toast.error(f.missingRequired),
          )}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="faq-item-category">{f.category}</Label>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="faq-item-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.titleRo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Separator />

            <Tabs defaultValue="ro">
              <TabsList>
                <TabsTrigger value="ro" className="gap-1.5">
                  {t.langRo}
                  {roHasError && (
                    <span className="size-1.5 rounded-full bg-destructive" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="en" className="gap-1.5">
                  {t.langEn}
                  {enHasError && (
                    <span className="size-1.5 rounded-full bg-destructive" />
                  )}
                </TabsTrigger>
                {/* RU carries no error dot — none of its fields can fail. */}
                <TabsTrigger value="ru">{t.langRu}</TabsTrigger>
              </TabsList>

              <TabsContent value="ro" className="mt-4 space-y-4">
                <TextField
                  id="faq-q-ro"
                  label={f.question}
                  placeholder={f.questionPlaceholderRo}
                  error={errors.questionRo?.message}
                  {...form.register('questionRo')}
                />
                <TextAreaField
                  id="faq-a-ro"
                  label={f.answer}
                  placeholder={f.answerPlaceholderRo}
                  error={errors.answerRo?.message}
                  {...form.register('answerRo')}
                />
              </TabsContent>

              <TabsContent value="en" className="mt-4 space-y-4">
                <TextField
                  id="faq-q-en"
                  label={f.question}
                  placeholder={f.questionPlaceholderEn}
                  error={errors.questionEn?.message}
                  {...form.register('questionEn')}
                />
                <TextAreaField
                  id="faq-a-en"
                  label={f.answer}
                  placeholder={f.answerPlaceholderEn}
                  error={errors.answerEn?.message}
                  {...form.register('answerEn')}
                />
              </TabsContent>

              <TabsContent value="ru" className="mt-4 space-y-4">
                <TextField
                  id="faq-q-ru"
                  label={f.question}
                  placeholder={f.questionPlaceholderRu}
                  hint={ro.common.ruFallbackHint}
                  {...form.register('questionRu')}
                />
                <TextAreaField
                  id="faq-a-ru"
                  label={f.answer}
                  placeholder={f.answerPlaceholderRu}
                  {...form.register('answerRu')}
                />
              </TabsContent>
            </Tabs>

            <Separator />

            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="faq-item-active" className="cursor-pointer">
                      {f.activeField}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {f.activeHint}
                    </p>
                  </div>
                  <Switch
                    id="faq-item-active"
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

const TextAreaField = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'> & { label: string; error?: string }
>(function TextAreaField({ id, label, error, ...props }, ref) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} ref={ref} rows={5} aria-invalid={!!error} {...props} />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
});
