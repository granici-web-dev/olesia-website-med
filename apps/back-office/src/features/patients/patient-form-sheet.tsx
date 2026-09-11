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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ro } from '@/i18n/ro';

import { createPatient, updatePatient } from '@/features/patients/api';
import {
  patientsQueryKey,
  patientQueryKey,
} from '@/features/patients/query-key';
import type { PatientDto, PatientFormValues } from '@/features/patients/types';

const f = ro.patients.form;
const GENDERS = ['male', 'female', 'other'] as const;

const EMPTY: PatientFormValues = {
  fullName: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',
  notes: '',
};

function toForm(p: PatientDto): PatientFormValues {
  return {
    fullName: p.fullName,
    email: p.email,
    phone: p.phone ?? '',
    birthDate: p.birthDate ? p.birthDate.slice(0, 10) : '',
    gender: (p.gender as PatientFormValues['gender']) ?? '',
    notes: p.notes ?? '',
  };
}

export function PatientFormSheet({
  patient,
  open,
  onOpenChange,
  onCreated,
}: {
  patient: PatientDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the new patient after a successful create. */
  onCreated?: (created: PatientDto) => void;
}) {
  const isEdit = patient !== null;
  const queryClient = useQueryClient();

  const schema = React.useMemo(
    () =>
      z.object({
        fullName: z.string().trim().min(1, f.required),
        email: z.string().trim().email(f.invalidEmail),
        phone: z.string(),
        birthDate: z.string(),
        gender: z.enum(['', ...GENDERS]),
        notes: z.string(),
      }),
    [],
  );

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(patient ? toForm(patient) : EMPTY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patient]);

  const mutation = useMutation({
    mutationFn: (values: PatientFormValues) =>
      isEdit ? updatePatient(patient.id, values) : createPatient(values),
    onSuccess: (saved) => {
      toast.success(
        isEdit ? ro.patients.toast.updated : ro.patients.toast.created,
      );
      queryClient.invalidateQueries({ queryKey: patientsQueryKey });
      if (isEdit) {
        queryClient.invalidateQueries({
          queryKey: patientQueryKey(patient.id),
        });
      }
      onOpenChange(false);
      if (!isEdit) onCreated?.(saved);
    },
    onError: (err) =>
      toast.error(
        err instanceof Error && err.message === 'email_taken'
          ? ro.patients.toast.emailTaken
          : ro.patients.toast.error,
      ),
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
            <div className="space-y-2">
              <Label htmlFor="pat-name">{f.fullName}</Label>
              <Input
                id="pat-name"
                aria-invalid={!!errors.fullName}
                {...form.register('fullName')}
              />
              {errors.fullName && (
                <p className="text-xs font-medium text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pat-email">{f.email}</Label>
              <Input
                id="pat-email"
                type="email"
                autoComplete="off"
                aria-invalid={!!errors.email}
                {...form.register('email')}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pat-phone">{f.phone}</Label>
                <Input
                  id="pat-phone"
                  type="tel"
                  autoComplete="off"
                  {...form.register('phone')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pat-birth">{f.birthDate}</Label>
                <Input
                  id="pat-birth"
                  type="date"
                  {...form.register('birthDate')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pat-gender">{f.gender}</Label>
              <Controller
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="pat-gender" className="w-full">
                      <SelectValue placeholder={ro.patients.gender.unset} />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {ro.patients.gender[g]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pat-notes">{f.notes}</Label>
              <Textarea id="pat-notes" rows={3} {...form.register('notes')} />
              <p className="text-xs text-muted-foreground">{f.notesHint}</p>
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
