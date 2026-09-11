import * as React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ro } from '@/i18n/ro';

/**
 * A labelled field with its error or its hint under it.
 *
 * Six form sheets had written this out for themselves, character for
 * character, and the copies had drifted: three showed a hint under a textarea
 * and two silently dropped it, so the same prop meant different things
 * depending on which sheet you were in (audit A10, simplify 1).
 *
 * `forwardRef` because every caller passes `react-hook-form`'s `register()`,
 * which needs the ref to read the input.
 */

interface FieldChrome {
  label: string;
  error?: string;
  /** Shown only when there is no error: an error is the more useful sentence. */
  hint?: string;
  /** Adds "(opțional)" after the label. */
  optional?: boolean;
}

function FieldLabel({
  id,
  label,
  optional,
}: {
  id?: string;
  label: string;
  optional?: boolean;
}) {
  return (
    <Label htmlFor={id}>
      {label}
      {optional && (
        <span className="text-xs font-normal text-muted-foreground">
          ({ro.common.optional})
        </span>
      )}
    </Label>
  );
}

function FieldNote({ error, hint }: { error?: string; hint?: string }) {
  if (error) {
    return <p className="text-xs font-medium text-destructive">{error}</p>;
  }
  if (hint) return <p className="text-xs text-muted-foreground">{hint}</p>;
  return null;
}

export const TextField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & FieldChrome
>(function TextField({ id, label, error, hint, optional, ...props }, ref) {
  return (
    <div className="space-y-2">
      <FieldLabel id={id} label={label} optional={optional} />
      <Input id={id} ref={ref} aria-invalid={!!error} {...props} />
      <FieldNote error={error} hint={hint} />
    </div>
  );
});

export const TextAreaField = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'> & FieldChrome
>(function TextAreaField({ id, label, error, hint, optional, ...props }, ref) {
  return (
    <div className="space-y-2">
      <FieldLabel id={id} label={label} optional={optional} />
      {/* `rows` comes after the spread so a caller that needs a taller box
          says so, rather than every sheet keeping its own default. */}
      <Textarea id={id} ref={ref} aria-invalid={!!error} rows={3} {...props} />
      <FieldNote error={error} hint={hint} />
    </div>
  );
});
