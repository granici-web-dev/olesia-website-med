import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw } from 'lucide-react';
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
import { ro } from '@/i18n/ro';

import {
  createUser,
  updateUser,
  generatePassword,
} from '@/features/users/data';
import { usersQueryKey } from '@/features/users/query-key';
import type { User } from '@/features/users/types';
import type { Role } from '@/types';

const f = ro.users.form;
const ROLES: Role[] = ['admin', 'editor'];

interface FormValues {
  email: string;
  name: string;
  role: Role;
  password: string;
}

export function UserFormSheet({
  user,
  open,
  onOpenChange,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = user !== null;
  const queryClient = useQueryClient();

  const schema = React.useMemo(
    () =>
      z.object({
        email: z.string().trim().email(f.invalidEmail),
        name: z.string().trim().min(1, f.required),
        role: z.enum(ROLES as [Role, ...Role[]]),
        // Edit doesn't change the password (reset is a separate action),
        // so an empty string is accepted there.
        password: isEdit ? z.string() : z.string().min(8, f.passwordMin),
      }),
    [isEdit],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '', role: 'editor', password: '' },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      user
        ? { email: user.email, name: user.name, role: user.role, password: '' }
        : { email: '', name: '', role: 'editor', password: '' },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? updateUser(user.id, { name: values.name, role: values.role })
        : createUser({
            email: values.email,
            name: values.name,
            role: values.role,
            password: values.password,
          }),
    onSuccess: () => {
      toast.success(isEdit ? ro.users.toast.updated : ro.users.toast.created);
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
      onOpenChange(false);
    },
    onError: () => toast.error(ro.users.toast.error),
  });

  const errors = form.formState.errors;
  const role = form.watch('role');

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
              <Label htmlFor="usr-email">{f.email}</Label>
              <Input
                id="usr-email"
                type="email"
                autoComplete="off"
                disabled={isEdit}
                aria-invalid={!!errors.email}
                {...form.register('email')}
              />
              {isEdit ? (
                <p className="text-xs text-muted-foreground">{f.emailReadonly}</p>
              ) : (
                errors.email && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.email.message}
                  </p>
                )
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usr-name">{f.name}</Label>
              <Input
                id="usr-name"
                aria-invalid={!!errors.name}
                {...form.register('name')}
              />
              {errors.name && (
                <p className="text-xs font-medium text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usr-role">{f.role}</Label>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="usr-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ro.roles[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">
                {ro.users.roleHint[role]}
              </p>
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="usr-password">{f.password}</Label>
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue('password', generatePassword(), {
                        shouldValidate: true,
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:underline"
                  >
                    <RefreshCw className="size-3" />
                    {f.generate}
                  </button>
                </div>
                <Input
                  id="usr-password"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono"
                  aria-invalid={!!errors.password}
                  {...form.register('password')}
                />
                {errors.password ? (
                  <p className="text-xs font-medium text-destructive">
                    {errors.password.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {f.passwordHint}
                  </p>
                )}
              </div>
            )}
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
