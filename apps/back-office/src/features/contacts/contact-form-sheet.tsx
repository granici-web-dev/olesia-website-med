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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ro } from '@/i18n/ro';

import {
  CONTACT_TYPES,
  contactTypeIcon,
  createContact,
  updateContact,
} from '@/features/contacts/data';
import { contactsQueryKey } from '@/features/contacts/query-key';
import type {
  Contact,
  ContactInput,
  ContactType,
} from '@/features/contacts/types';

const f = ro.contacts.form;

const intString = z
  .string()
  .trim()
  .min(1, f.required)
  .refine((v) => /^\d+$/.test(v), f.invalidNumber);

const schema = z.object({
  type: z.enum(CONTACT_TYPES as [ContactType, ...ContactType[]]),
  labelRo: z.string().trim().min(1, f.required),
  labelEn: z.string().trim().min(1, f.required),
  value: z.string().trim().min(1, f.required),
  sortOrder: intString,
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function emptyValues(sortOrder: number): FormValues {
  return {
    type: 'phone',
    labelRo: '',
    labelEn: '',
    value: '',
    sortOrder: String(sortOrder),
    active: true,
  };
}

function fromContact(c: Contact): FormValues {
  return {
    type: c.type,
    labelRo: c.labelRo,
    labelEn: c.labelEn,
    value: c.value,
    sortOrder: String(c.sortOrder),
    active: c.active,
  };
}

function toInput(values: FormValues): ContactInput {
  return {
    type: values.type,
    labelRo: values.labelRo.trim(),
    labelEn: values.labelEn.trim(),
    value: values.value.trim(),
    sortOrder: Number(values.sortOrder),
    active: values.active,
  };
}

export function ContactFormSheet({
  contact,
  nextSortOrder,
  open,
  onOpenChange,
}: {
  contact: Contact | null;
  nextSortOrder: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = contact !== null;
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(nextSortOrder),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(contact ? fromContact(contact) : emptyValues(nextSortOrder));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contact]);

  const type = form.watch('type');

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? updateContact(contact.id, toInput(values))
        : createContact(toInput(values)),
    onSuccess: () => {
      toast.success(isEdit ? ro.contacts.toast.updated : ro.contacts.toast.created);
      queryClient.invalidateQueries({ queryKey: contactsQueryKey });
      onOpenChange(false);
    },
    onError: () => toast.error(ro.contacts.toast.error),
  });

  const errors = form.formState.errors;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-md"
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
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="ct-type">{f.type}</Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="ct-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_TYPES.map((tp) => {
                        const Icon = contactTypeIcon[tp];
                        return (
                          <SelectItem key={tp} value={tp}>
                            <Icon />
                            {ro.contacts.type[tp]}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Labels */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="labelRo"
                label={f.labelRo}
                error={errors.labelRo?.message}
                {...form.register('labelRo')}
              />
              <Field
                id="labelEn"
                label={f.labelEn}
                error={errors.labelEn?.message}
                {...form.register('labelEn')}
              />
            </div>
            <p className="-mt-3 text-xs text-muted-foreground">{f.labelHint}</p>

            {/* Value */}
            <Field
              id="value"
              label={f.value}
              error={errors.value?.message}
              placeholder={f.placeholder[type]}
              {...form.register('value')}
            />

            <Separator />

            <div className="w-40">
              <Field
                id="sortOrder"
                label={f.sortOrder}
                type="number"
                inputMode="numeric"
                error={errors.sortOrder?.message}
                {...form.register('sortOrder')}
              />
            </div>

            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="ct-active" className="cursor-pointer">
                      {f.activeField}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {f.activeHint}
                    </p>
                  </div>
                  <Switch
                    id="ct-active"
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

const Field = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & { label: string; error?: string }
>(function Field({ id, label, error, ...props }, ref) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} ref={ref} aria-invalid={!!error} {...props} />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
});
