import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MarkdownEditor } from '@/components/markdown/markdown-editor';
import { ro } from '@/i18n/ro';

import { addEntry, updateEntry } from '@/features/patients/api';
import {
  patientQueryKey,
  patientTimelineQueryKey,
} from '@/features/patients/query-key';
import type {
  EntryFormValues,
  PatientEntryDto,
} from '@/features/patients/types';

const f = ro.patients.entryForm;
/** Document entries are created via upload, not this editor. */
const EDITABLE_TYPES = ['anamnesis', 'note', 'prescription'] as const;
type EditableType = (typeof EDITABLE_TYPES)[number];

function emptyValues(type: EditableType): EntryFormValues {
  return { type, title: '', body: '', occurredAt: '' };
}

export function EntryFormSheet({
  patientId,
  entry,
  defaultType = 'anamnesis',
  open,
  onOpenChange,
}: {
  patientId: string;
  /** When set, the sheet edits this entry; otherwise it creates a new one. */
  entry: PatientEntryDto | null;
  defaultType?: EditableType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = entry !== null;
  const queryClient = useQueryClient();

  const form = useForm<EntryFormValues>({
    defaultValues: emptyValues(defaultType),
  });

  React.useEffect(() => {
    if (!open) return;
    if (entry) {
      form.reset({
        type: (entry.type === 'document' ? 'note' : entry.type) as EditableType,
        title: entry.title ?? '',
        body: entry.body ?? '',
        occurredAt: entry.occurredAt ? entry.occurredAt.slice(0, 10) : '',
      });
    } else {
      form.reset(emptyValues(defaultType));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry, defaultType]);

  const mutation = useMutation({
    mutationFn: (values: EntryFormValues) =>
      isEdit
        ? updateEntry(patientId, entry.id, values)
        : addEntry(patientId, values),
    onSuccess: () => {
      toast.success(
        isEdit ? ro.patients.toast.entryUpdated : ro.patients.toast.entryAdded,
      );
      queryClient.invalidateQueries({
        queryKey: patientTimelineQueryKey(patientId),
      });
      queryClient.invalidateQueries({ queryKey: patientQueryKey(patientId) });
      onOpenChange(false);
    },
    onError: () => toast.error(ro.patients.toast.error),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-lg"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{isEdit ? f.editTitle : f.addTitle}</SheetTitle>
          <SheetDescription>{f.subtitle}</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ent-type">{f.type}</Label>
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="ent-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EDITABLE_TYPES.map((tp) => (
                          <SelectItem key={tp} value={tp}>
                            {ro.patients.entryType[tp]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ent-date">{f.occurredAt}</Label>
                <Input
                  id="ent-date"
                  type="date"
                  {...form.register('occurredAt')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ent-title">{f.titleLabel}</Label>
              <Input
                id="ent-title"
                placeholder={f.titlePlaceholder}
                {...form.register('title')}
              />
            </div>

            <div className="space-y-2">
              <Label>{f.body}</Label>
              <Controller
                control={form.control}
                name="body"
                render={({ field }) => (
                  <MarkdownEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={f.bodyPlaceholder}
                  />
                )}
              />
            </div>
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
