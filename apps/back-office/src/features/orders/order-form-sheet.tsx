import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError } from '@/api/http';
import { ro } from '@/i18n/ro';

import { createOrder } from '@/features/orders/api';
import { ordersQueryKey } from '@/features/orders/query-key';
import type { OrderProduct } from '@/features/orders/types';
import { fetchDeliverables } from '@/features/deliverables/api';
import { deliverablesQueryKey } from '@/features/deliverables/query-key';

const t = ro.orders;
const f = t.form;

/**
 * Record an order that did not come through the site.
 *
 * Not every client buys a menu in a browser: some call. Until this existed the
 * only way to get such an order onto the doctor's list was a row in the
 * database, so the work happened and the panel knew nothing about it
 * (audit A10, F15).
 *
 * The price is not on this form. It is stamped from the `DeliverableCatalog`
 * row server-side, the same catalog the public checkout reads, so a phone
 * order and a web order of the same product record the same amount. The select
 * offers only what is on sale, because the API refuses a withdrawn product.
 */
export function OrderFormSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: deliverablesQueryKey,
    queryFn: fetchDeliverables,
  });
  const products = React.useMemo(
    () => (data ?? []).filter((d) => d.active),
    [data],
  );

  const schema = React.useMemo(
    () =>
      z.object({
        product: z.string().min(1, f.required),
        clientName: z.string().trim().min(1, f.required),
        clientEmail: z.string().trim().email(f.invalidEmail),
        phone: z.string().trim().max(40),
        notes: z.string().trim().max(2000),
      }),
    [],
  );

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      product: '',
      clientName: '',
      clientEmail: '',
      phone: '',
      notes: '',
    },
  });

  // The catalog arrives after the sheet opens, so the first product is picked
  // when it lands rather than in `defaultValues`.
  React.useEffect(() => {
    if (open) form.reset({ product: products[0]?.code ?? '' });
  }, [open, products, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createOrder({
        product: values.product as OrderProduct,
        clientName: values.clientName,
        clientEmail: values.clientEmail,
        phone: values.phone || undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success(t.toast.created);
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      onOpenChange(false);
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.message : '';
      toast.error(
        code === 'deliverable_not_found'
          ? t.toast.unknownProduct
          : code === 'deliverable_not_for_sale'
            ? t.toast.notForSale
            : t.toast.error,
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
          <SheetDescription>{f.subtitle}</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="ord-product">{f.product}</Label>
              <Controller
                control={form.control}
                name="product"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="ord-product" className="w-full">
                      <SelectValue placeholder={f.productPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.code} value={product.code}>
                          {product.titleRo} · {product.priceEur} €
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ord-name">{f.clientName}</Label>
              <Input
                id="ord-name"
                aria-invalid={!!errors.clientName}
                {...form.register('clientName')}
              />
              {errors.clientName && (
                <p className="text-xs font-medium text-destructive">
                  {errors.clientName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ord-email">{f.clientEmail}</Label>
              <Input
                id="ord-email"
                type="email"
                autoComplete="off"
                aria-invalid={!!errors.clientEmail}
                {...form.register('clientEmail')}
              />
              {errors.clientEmail && (
                <p className="text-xs font-medium text-destructive">
                  {errors.clientEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ord-phone">{f.phone}</Label>
              <Input id="ord-phone" type="tel" {...form.register('phone')} />
              <p className="text-xs text-muted-foreground">{f.phoneHint}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ord-notes">{f.notes}</Label>
              <Textarea id="ord-notes" rows={5} {...form.register('notes')} />
              <p className="text-xs text-muted-foreground text-pretty">
                {f.notesHint}
              </p>
            </div>

            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground text-pretty">
              {f.paymentHint}
            </p>
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
