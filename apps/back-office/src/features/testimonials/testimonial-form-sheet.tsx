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
import { TextField, TextAreaField } from '@/components/common/form-fields';
import { LocaleTabsList } from '@/components/common/locale-tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ro } from '@/i18n/ro';

import {
  createTestimonial,
  updateTestimonial,
} from '@/features/testimonials/api';
import { testimonialsQueryKey } from '@/features/testimonials/query-key';
import type {
  Testimonial,
  TestimonialInput,
} from '@/features/testimonials/types';

const t = ro.testimonials;
const f = t.form;

const schema = z.object({
  quoteRo: z.string().trim().min(1, f.required),
  quoteEn: z.string().trim().min(1, f.required),
  quoteRu: z.string(),
  /** Empty means unsigned — the site shows a neutral label, never a made-up name. */
  author: z.string(),
  roleRo: z.string(),
  roleEn: z.string(),
  roleRu: z.string(),
  source: z.string(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  quoteRo: '',
  quoteEn: '',
  quoteRu: '',
  author: '',
  roleRo: '',
  roleEn: '',
  roleRu: '',
  source: '',
  active: true,
};

function fromTestimonial(item: Testimonial): FormValues {
  return {
    quoteRo: item.quoteRo,
    quoteEn: item.quoteEn,
    quoteRu: item.quoteRu ?? '',
    author: item.author ?? '',
    roleRo: item.roleRo ?? '',
    roleEn: item.roleEn ?? '',
    roleRu: item.roleRu ?? '',
    source: item.source ?? '',
    active: item.active,
  };
}

function toInput(values: FormValues): TestimonialInput {
  const orNull = (v: string) => v.trim() || null;
  return {
    quoteRo: values.quoteRo.trim(),
    quoteEn: values.quoteEn.trim(),
    quoteRu: orNull(values.quoteRu),
    author: orNull(values.author),
    roleRo: orNull(values.roleRo),
    roleEn: orNull(values.roleEn),
    roleRu: orNull(values.roleRu),
    source: orNull(values.source),
    active: values.active,
  };
}

export function TestimonialFormSheet({
  testimonial,
  open,
  onOpenChange,
}: {
  /** Editing an existing review, or null to add one. */
  testimonial: Testimonial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = testimonial !== null;
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(testimonial ? fromTestimonial(testimonial) : EMPTY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, testimonial]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? updateTestimonial(testimonial.id, toInput(values))
        : createTestimonial(toInput(values)),
    onSuccess: () => {
      toast.success(isEdit ? t.toast.updated : t.toast.created);
      queryClient.invalidateQueries({ queryKey: testimonialsQueryKey });
      onOpenChange(false);
    },
    onError: () => toast.error(t.toast.error),
  });

  const errors = form.formState.errors;

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
            <Tabs defaultValue="ro">
              <LocaleTabsList
                roHasError={!!errors.quoteRo}
                enHasError={!!errors.quoteEn}
              />

              <TabsContent value="ro" className="mt-4 space-y-4">
                <TextAreaField
                  rows={6}
                  id="tst-quote-ro"
                  label={f.quote}
                  placeholder={f.quotePlaceholderRo}
                  error={errors.quoteRo?.message}
                  hint={f.originalHint}
                  {...form.register('quoteRo')}
                />
                <TextField
                  id="tst-role-ro"
                  label={f.role}
                  placeholder={f.rolePlaceholderRo}
                  {...form.register('roleRo')}
                />
              </TabsContent>

              <TabsContent value="en" className="mt-4 space-y-4">
                <TextAreaField
                  rows={6}
                  id="tst-quote-en"
                  label={f.quote}
                  placeholder={f.quotePlaceholderEn}
                  error={errors.quoteEn?.message}
                  {...form.register('quoteEn')}
                />
                <TextField
                  id="tst-role-en"
                  label={f.role}
                  placeholder={f.rolePlaceholderEn}
                  {...form.register('roleEn')}
                />
              </TabsContent>

              <TabsContent value="ru" className="mt-4 space-y-4">
                <TextAreaField
                  rows={6}
                  id="tst-quote-ru"
                  label={f.quote}
                  placeholder={f.quotePlaceholderRu}
                  hint={ro.common.ruFallbackHint}
                  {...form.register('quoteRu')}
                />
                <TextField
                  id="tst-role-ru"
                  label={f.role}
                  placeholder={f.rolePlaceholderRu}
                  {...form.register('roleRu')}
                />
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Author and source are not translated — a name is a name. */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="tst-author"
                label={f.author}
                placeholder={f.authorPlaceholder}
                hint={f.authorHint}
                {...form.register('author')}
              />
              <TextField
                id="tst-source"
                label={f.source}
                placeholder={f.sourcePlaceholder}
                hint={f.sourceHint}
                {...form.register('source')}
              />
            </div>

            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="tst-active" className="cursor-pointer">
                      {f.activeField}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {f.activeHint}
                    </p>
                  </div>
                  <Switch
                    id="tst-active"
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
