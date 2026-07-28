import * as React from 'react';
import {
  useFieldArray,
  type UseFormReturn,
  type FieldArrayPath,
} from 'react-hook-form';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ro } from '@/i18n/ro';

import type { AboutFormValues } from './form-schema';

const a = ro.about;
const bl = a.blocks;

/* ------------------------------------------------------------------ *
 * Shared chrome for a repeatable block: section card + per-item row.
 * ------------------------------------------------------------------ */

function BlockSection({
  title,
  hint,
  addLabel,
  emptyLabel,
  count,
  onAdd,
  children,
}: {
  title: string;
  hint: string;
  addLabel: string;
  emptyLabel: string;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-5">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </header>

      {count === 0 ? (
        <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  );
}

function BlockRow({
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-lg border bg-background p-4 pl-10">
      <span className="absolute left-3 top-4 text-xs font-medium tabular-nums text-muted-foreground">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="absolute right-2 top-2 flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          disabled={index === 0}
          aria-label={bl.moveUp}
          onClick={() => onMove(index, index - 1)}
        >
          <ChevronUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          disabled={index === count - 1}
          aria-label={bl.moveDown}
          onClick={() => onMove(index, index + 1)}
        >
          <ChevronDown className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          aria-label={bl.remove}
          onClick={() => onRemove(index)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-3 pt-5 sm:pt-0">{children}</div>
    </div>
  );
}

/** A labelled single-line field. */
function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Input>) {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input id={id} {...props} />
    </div>
  );
}

/** A labelled multi-line field. */
function AreaField({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Textarea>) {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Textarea id={id} rows={2} className="resize-y" {...props} />
    </div>
  );
}

type Form = UseFormReturn<AboutFormValues>;

function useBlock<Name extends FieldArrayPath<AboutFormValues>>(
  form: Form,
  name: Name,
) {
  return useFieldArray({ control: form.control, name });
}

/* ------------------------------------------------------------------ *
 * Stats
 * ------------------------------------------------------------------ */

export function StatsEditor({ form }: { form: Form }) {
  const { fields, append, remove, move } = useBlock(form, 'stats');
  const s = a.stats;
  return (
    <BlockSection
      title={s.title}
      hint={s.hint}
      addLabel={s.add}
      emptyLabel={s.empty}
      count={fields.length}
      onAdd={() => append({ value: '', labelRo: '', labelEn: '', labelRu: '' })}
    >
      {fields.map((f, i) => (
        <BlockRow
          key={f.id}
          index={i}
          count={fields.length}
          onMove={move}
          onRemove={remove}
        >
          <div className="grid gap-3 sm:grid-cols-[7rem_1fr_1fr] lg:grid-cols-[7rem_1fr_1fr_1fr]">
            <Field
              label={s.value}
              placeholder={s.valuePlaceholder}
              {...form.register(`stats.${i}.value`)}
            />
            <Field
              label={s.labelRo}
              placeholder={s.labelPlaceholderRo}
              {...form.register(`stats.${i}.labelRo`)}
            />
            <Field
              label={s.labelEn}
              placeholder={s.labelPlaceholderEn}
              {...form.register(`stats.${i}.labelEn`)}
            />
            <Field
              label={s.labelRu}
              placeholder={s.labelPlaceholderRu}
              {...form.register(`stats.${i}.labelRu`)}
            />
          </div>
        </BlockRow>
      ))}
    </BlockSection>
  );
}

/* ------------------------------------------------------------------ *
 * Credentials
 * ------------------------------------------------------------------ */

export function CredentialsEditor({ form }: { form: Form }) {
  const { fields, append, remove, move } = useBlock(form, 'credentials');
  const c = a.credentials;
  return (
    <BlockSection
      title={c.title}
      hint={c.hint}
      addLabel={c.add}
      emptyLabel={c.empty}
      count={fields.length}
      onAdd={() => append({ ro: '', en: '', ru: '' })}
    >
      {fields.map((f, i) => (
        <BlockRow
          key={f.id}
          index={i}
          count={fields.length}
          onMove={move}
          onRemove={remove}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label={c.ro}
              placeholder={c.placeholderRo}
              {...form.register(`credentials.${i}.ro`)}
            />
            <Field
              label={c.en}
              placeholder={c.placeholderEn}
              {...form.register(`credentials.${i}.en`)}
            />
            <Field
              label={c.ru}
              placeholder={c.placeholderRu}
              {...form.register(`credentials.${i}.ru`)}
            />
          </div>
        </BlockRow>
      ))}
    </BlockSection>
  );
}


