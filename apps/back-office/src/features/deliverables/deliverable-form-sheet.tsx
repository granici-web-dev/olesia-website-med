import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { TextField } from '@/components/common/form-fields';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/api/http';
import { ro } from '@/i18n/ro';

import { updateDeliverable } from '@/features/deliverables/api';
import { deliverablesQueryKey } from '@/features/deliverables/query-key';
import type { Deliverable } from '@/features/deliverables/types';

const f = ro.deliverables.form;

/**
 * No locale tabs, unlike the five trilingual sheets beside this one. There are
 * three one-line titles here and nothing else long, so all three languages fit
 * on screen together and can be read against each other — and `LocaleTabsList`
 * deliberately puts no error dot on the RU tab, which would hide the one
 * validation failure this form can have that the others cannot.
 */
const schema = z.object({
  priceEur: z
    .string()
    .trim()
    .min(1, f.required)
    .refine((v) => /^\d+$/.test(v), f.invalidNumber),
  titleRo: z.string().trim().min(1, f.required),
  titleEn: z.string().trim().min(1, f.required),
  // Required, unlike a service's: these five titles are ours to write, and the
  // column is NOT NULL because a Russian reader gets no fallback here.
  titleRu: z.string().trim().min(1, f.required),
  sortOrder: z
    .string()
    .trim()
    .min(1, f.required)
    .refine((v) => /^\d+$/.test(v), f.invalidNumber),
});

type FormValues = z.infer<typeof schema>;

export function DeliverableFormSheet({
  deliverable,
  open,
  onOpenChange,
}: {
  deliverable: Deliverable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priceEur: '',
      titleRo: '',
      titleEn: '',
      titleRu: '',
      sortOrder: '',
    },
  });

  React.useEffect(() => {
    if (!open || !deliverable) return;
    form.reset({
      priceEur: String(deliverable.priceEur),
      titleRo: deliverable.titleRo,
      titleEn: deliverable.titleEn,
      titleRu: deliverable.titleRu,
      sortOrder: String(deliverable.sortOrder),
    });
  }, [open, deliverable, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!deliverable) throw new Error('no deliverable open');
      return updateDeliverable(deliverable.code, {
        priceEur: Number(values.priceEur),
        titleRo: values.titleRo.trim(),
        titleEn: values.titleEn.trim(),
        titleRu: values.titleRu.trim(),
        sortOrder: Number(values.sortOrder),
      });
    },
    onSuccess: () => {
      toast.success(ro.deliverables.toast.updated);
      queryClient.invalidateQueries({ queryKey: deliverablesQueryKey });
      onOpenChange(false);
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.message : '';
      toast.error(
        code === 'deliverable_not_found'
          ? ro.deliverables.toast.notFound
          : ro.deliverables.toast.error,
      );
    },
  });

  const errors = form.formState.errors;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{f.title}</SheetTitle>
          <SheetDescription>
            {deliverable ? deliverable.titleRo : f.subtitle}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <TextField
              id="dlv-price"
              label={f.price}
              inputMode="numeric"
              error={errors.priceEur?.message}
              hint={f.priceHint}
              {...form.register('priceEur')}
            />

            <TextField
              id="dlv-title-ro"
              label={f.titleRo}
              error={errors.titleRo?.message}
              {...form.register('titleRo')}
            />
            <TextField
              id="dlv-title-en"
              label={f.titleEn}
              error={errors.titleEn?.message}
              {...form.register('titleEn')}
            />
            <TextField
              id="dlv-title-ru"
              label={f.titleRu}
              error={errors.titleRu?.message}
              hint={f.titleHint}
              {...form.register('titleRu')}
            />

            <TextField
              id="dlv-sort"
              label={f.sortOrder}
              inputMode="numeric"
              error={errors.sortOrder?.message}
              {...form.register('sortOrder')}
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
