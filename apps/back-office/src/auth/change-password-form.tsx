import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword } from '@/api/auth';
import { ApiError } from '@/api/http';
import { useAuth } from '@/auth/auth-context';
import { ro } from '@/i18n/ro';

const t = ro.changePassword;

/** Twelve, matching the API. Saying so before the request beats a 400 after. */
const MIN_LENGTH = 12;

/**
 * Used in two places: the security page, and the gate a brand-new account meets
 * before the panel, because its password was typed by whoever created it.
 */
export function ChangePasswordForm({ onDone }: { onDone?: () => void }) {
  const { passwordChanged } = useAuth();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [repeated, setRepeated] = React.useState('');

  const tooShort = newPassword.length > 0 && newPassword.length < MIN_LENGTH;
  const mismatch = repeated.length > 0 && repeated !== newPassword;
  const ready =
    currentPassword.length > 0 &&
    newPassword.length >= MIN_LENGTH &&
    repeated === newPassword;

  const submit = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setRepeated('');
      passwordChanged();
      toast.success(t.done);
      onDone?.();
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError && error.status === 401
          ? t.wrongCurrent
          : t.errorGeneric,
      );
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) submit.mutate();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="current-password">{t.currentLabel}</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">{t.newLabel}</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          aria-describedby="new-password-hint"
          aria-invalid={tooShort}
        />
        <p id="new-password-hint" className="text-xs text-muted-foreground">
          {tooShort ? t.tooShort : t.lengthHint}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="repeat-password">{t.repeatLabel}</Label>
        <Input
          id="repeat-password"
          type="password"
          autoComplete="new-password"
          value={repeated}
          onChange={(e) => setRepeated(e.target.value)}
          aria-invalid={mismatch}
        />
        {mismatch && <p className="text-xs text-destructive">{t.mismatch}</p>}
      </div>

      <Button type="submit" disabled={!ready || submit.isPending}>
        {submit.isPending && <Loader2 className="animate-spin" />}
        {t.submit}
      </Button>
    </form>
  );
}
