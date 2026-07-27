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
import { Badge } from '@/components/ui/badge';
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

import {
  ALL_CODES,
  CODE_META,
  groupForCode,
  createService,
  updateService,
} from '@/features/services/data';
import { servicesQueryKey } from '@/features/services/query-key';
import type {
  Service,
  ServiceCode,
  ServiceInput,
} from '@/features/services/types';

const f = ro.services.form;

const intString = (msg: string) =>
  z
    .string()
    .trim()
    .min(1, f.required)
    .refine((v) => /^\d+$/.test(v), msg);

const schema = z
  .object({
    code: z.enum(ALL_CODES as [ServiceCode, ...ServiceCode[]]),
    titleRo: z.string().trim().min(1, f.required),
    titleEn: z.string().trim().min(1, f.required),
    descriptionRo: z.string().trim().min(1, f.required),
    descriptionEn: z.string().trim().min(1, f.required),
    price: intString(f.invalidNumber),
    priceLabelRo: z.string(),
    priceLabelEn: z.string(),
    // RU is never required: a service must stay saveable while its Russian
    // copy is still missing — the public site falls back to RO.
    titleRu: z.string(),
    descriptionRu: z.string(),
    priceLabelRu: z.string(),
    durationMin: z.string(),
    calendlyEventTypeUri: z.string(),
    calendlySchedulingUrl: z.string(),
    sortOrder: intString(f.invalidNumber),
    active: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (groupForCode(val.code) === 'A_booking') {
      if (!/^\d+$/.test(val.durationMin.trim()) || Number(val.durationMin) < 1) {
        ctx.addIssue({
          path: ['durationMin'],
          code: z.ZodIssueCode.custom,
          message: f.required,
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

function emptyValues(code: ServiceCode, sortOrder: number): FormValues {
  const meta = CODE_META[code];
  return {
    code,
    titleRo: '',
    titleEn: '',
    titleRu: '',
    descriptionRo: '',
    descriptionEn: '',
    descriptionRu: '',
    price: '',
    priceLabelRo: '',
    priceLabelEn: '',
    priceLabelRu: '',
    durationMin: meta.defaultDuration ? String(meta.defaultDuration) : '',
    calendlyEventTypeUri: '',
    calendlySchedulingUrl: '',
    sortOrder: String(sortOrder),
    active: true,
  };
}

function fromService(s: Service): FormValues {
  return {
    code: s.code,
    titleRo: s.titleRo,
    titleEn: s.titleEn,
    titleRu: s.titleRu ?? '',
    descriptionRo: s.descriptionRo,
    descriptionEn: s.descriptionEn,
    descriptionRu: s.descriptionRu ?? '',
    price: String(s.price),
    priceLabelRo: s.priceLabelRo ?? '',
    priceLabelEn: s.priceLabelEn ?? '',
    priceLabelRu: s.priceLabelRu ?? '',
    durationMin: s.durationMin != null ? String(s.durationMin) : '',
    calendlyEventTypeUri: s.calendlyEventTypeUri ?? '',
    calendlySchedulingUrl: s.calendlySchedulingUrl ?? '',
    sortOrder: String(s.sortOrder),
    active: s.active,
  };
}

function toInput(values: FormValues): ServiceInput {
  const group = groupForCode(values.code);
  const isA = group === 'A_booking';
  return {
    code: values.code,
    group,
    titleRo: values.titleRo.trim(),
    titleEn: values.titleEn.trim(),
    titleRu: values.titleRu.trim() || null,
    descriptionRo: values.descriptionRo.trim(),
    descriptionEn: values.descriptionEn.trim(),
    descriptionRu: values.descriptionRu.trim() || null,
    price: Number(values.price),
    priceLabelRo: values.priceLabelRo.trim() || null,
    priceLabelEn: values.priceLabelEn.trim() || null,
    priceLabelRu: values.priceLabelRu.trim() || null,
    durationMin: isA && values.durationMin ? Number(values.durationMin) : null,
    calendlyEventTypeUri:
      isA && values.calendlyEventTypeUri.trim()
        ? values.calendlyEventTypeUri.trim()
        : null,
    calendlySchedulingUrl:
      isA && values.calendlySchedulingUrl.trim()
        ? values.calendlySchedulingUrl.trim()
        : null,
    sortOrder: Number(values.sortOrder),
    active: values.active,
  };
}

export function ServiceFormSheet({
  service,
  availableCodes,
  nextSortOrder,
  open,
  onOpenChange,
}: {
  /** Editing an existing service, or null to create. */
  service: Service | null;
  /** Codes not yet in use (for the create select). */
  availableCodes: ServiceCode[];
  nextSortOrder: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = service !== null;
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(availableCodes[0] ?? 'pediatric', nextSortOrder),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      service
        ? fromService(service)
        : emptyValues(availableCodes[0] ?? 'pediatric', nextSortOrder),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, service]);

  const code = form.watch('code');
  const group = groupForCode(code);
  const isA = group === 'A_booking';

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? updateService(service.id, toInput(values))
        : createService(toInput(values)),
    onSuccess: () => {
      toast.success(isEdit ? ro.services.toast.updated : ro.services.toast.created);
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
      onOpenChange(false);
    },
    onError: () => toast.error(ro.services.toast.error),
  });

  const errors = form.formState.errors;
  const roHasError = !!(errors.titleRo || errors.descriptionRo);
  const enHasError = !!(errors.titleEn || errors.descriptionEn);

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
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* Code + group */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="svc-code">{f.code}</Label>
                {isEdit ? (
                  <div className="flex h-9 items-center">
                    <code className="rounded bg-muted px-2 py-1 text-xs font-medium">
                      {code}
                    </code>
                  </div>
                ) : (
                  <Controller
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="svc-code" className="w-full">
                          <SelectValue placeholder={f.placeholderSelectCode} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCodes.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                <p className="text-xs text-muted-foreground">{f.codeHint}</p>
              </div>

              <div className="space-y-2">
                <Label>{f.group}</Label>
                <div className="flex h-9 items-center gap-2">
                  <Badge variant={isA ? 'info' : 'muted'}>
                    {ro.services.group[group]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {ro.services.groupHint[group]}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Bilingual content */}
            <div className="space-y-3">
              <Label>{f.content}</Label>
              <Tabs defaultValue="ro">
                <TabsList>
                  <TabsTrigger value="ro" className="gap-1.5">
                    {f.langRo}
                    {roHasError && (
                      <span className="size-1.5 rounded-full bg-destructive" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="en" className="gap-1.5">
                    {f.langEn}
                    {enHasError && (
                      <span className="size-1.5 rounded-full bg-destructive" />
                    )}
                  </TabsTrigger>
                  {/* RU carries no error dot — none of its fields can fail. */}
                  <TabsTrigger value="ru">{f.langRu}</TabsTrigger>
                </TabsList>

                <TabsContent value="ro" className="mt-4 space-y-4">
                  <TextField
                    id="titleRo"
                    label={f.titleField}
                    error={errors.titleRo?.message}
                    {...form.register('titleRo')}
                  />
                  <TextAreaField
                    id="descriptionRo"
                    label={f.description}
                    error={errors.descriptionRo?.message}
                    {...form.register('descriptionRo')}
                  />
                  <TextField
                    id="priceLabelRo"
                    label={`${f.priceLabelField}`}
                    hint={f.priceLabelHint}
                    optional
                    {...form.register('priceLabelRo')}
                  />
                </TabsContent>

                <TabsContent value="en" className="mt-4 space-y-4">
                  <TextField
                    id="titleEn"
                    label={f.titleField}
                    error={errors.titleEn?.message}
                    {...form.register('titleEn')}
                  />
                  <TextAreaField
                    id="descriptionEn"
                    label={f.description}
                    error={errors.descriptionEn?.message}
                    {...form.register('descriptionEn')}
                  />
                  <TextField
                    id="priceLabelEn"
                    label={`${f.priceLabelField}`}
                    hint={f.priceLabelHint}
                    optional
                    {...form.register('priceLabelEn')}
                  />
                </TabsContent>

                <TabsContent value="ru" className="mt-4 space-y-4">
                  <TextField
                    id="titleRu"
                    label={f.titleField}
                    optional
                    hint={ro.common.ruFallbackHint}
                    {...form.register('titleRu')}
                  />
                  <TextAreaField
                    id="descriptionRu"
                    label={f.description}
                    {...form.register('descriptionRu')}
                  />
                  <TextField
                    id="priceLabelRu"
                    label={`${f.priceLabelField}`}
                    hint={f.priceLabelHint}
                    optional
                    {...form.register('priceLabelRu')}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            {/* Pricing + scheduling */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="price"
                label={f.price}
                type="number"
                inputMode="numeric"
                error={errors.price?.message}
                {...form.register('price')}
              />
              {isA && (
                <TextField
                  id="durationMin"
                  label={f.duration}
                  type="number"
                  inputMode="numeric"
                  error={errors.durationMin?.message}
                  {...form.register('durationMin')}
                />
              )}
              <TextField
                id="sortOrder"
                label={f.sortOrder}
                type="number"
                inputMode="numeric"
                error={errors.sortOrder?.message}
                {...form.register('sortOrder')}
              />
            </div>

            {isA && (
              <TextField
                id="calendlyEventTypeUri"
                label={f.calendly}
                hint={f.calendlyHint}
                optional
                placeholder="https://api.calendly.com/event_types/…"
                {...form.register('calendlyEventTypeUri')}
              />
            )}

            {isA && (
              <TextField
                id="calendlySchedulingUrl"
                label={f.calendlyUrl}
                hint={f.calendlyUrlHint}
                optional
                placeholder="https://calendly.com/cont/serviciu"
                {...form.register('calendlySchedulingUrl')}
              />
            )}

            <Separator />

            {/* Active */}
            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="svc-active" className="cursor-pointer">
                      {f.activeField}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {f.activeHint}
                    </p>
                  </div>
                  <Switch
                    id="svc-active"
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

/* --------------------------- field helpers --------------------------- */

const TextField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & {
    label: string;
    error?: string;
    hint?: string;
    optional?: boolean;
  }
>(function TextField({ id, label, error, hint, optional, ...props }, ref) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">
            ({f.optional})
          </span>
        )}
      </Label>
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
      <Textarea id={id} ref={ref} rows={3} aria-invalid={!!error} {...props} />
      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
});
