import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandMark } from '@/components/common/brand-mark';
import { useAuth } from '@/auth/auth-context';
import { remainingSeconds, totpLockSeconds } from '@/auth/session-rules';
import type { SessionEndReason } from '@/api/http';
import { paths } from '@/config/routes';
import { ro } from '@/i18n/ro';

const schema = z.object({
  email: z.string().email(ro.login.errorInvalid),
  password: z.string().min(6, ro.login.errorInvalid),
  /** Only asked for after the API answers `totp_required`. */
  totpCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/** What sent the user here, when it was not their own click on "Deconectare". */
function sessionNotice(reason: SessionEndReason | undefined): string | null {
  if (reason === 'refresh_reused') return ro.login.sessionReused;
  if (reason === 'expired') return ro.login.sessionExpired;
  return null;
}

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const arrival = location.state as {
    from?: string;
    reason?: SessionEndReason;
  } | null;
  const from = arrival?.from ?? paths.dashboard;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', totpCode: '' },
  });

  const [rootError, setRootError] = React.useState<string | null>(null);
  /** Second step: the account has 2FA on, so a code is required. */
  const [needsTotp, setNeedsTotp] = React.useState(false);
  /**
   * When the API refused further codes, and for how long. Counted down on the
   * button rather than reported once: the doctor needs to see the wait ending,
   * otherwise she keeps trying codes and each attempt pushes the lock further.
   */
  const [lockedUntil, setLockedUntil] = React.useState<number | null>(null);
  const [lockedFor, setLockedFor] = React.useState(0);

  React.useEffect(() => {
    if (lockedUntil === null) return;
    const tick = () => {
      const left = remainingSeconds(lockedUntil, Date.now());
      setLockedFor(left);
      if (left === 0) setLockedUntil(null);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  // Already signed in → bounce to the app.
  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: FormValues) => {
    setRootError(null);
    try {
      await login(values.email, values.password, values.totpCode || undefined);
      toast.success(ro.login.success);
      navigate(from, { replace: true });
    } catch (err) {
      const locked = totpLockSeconds(err);
      if (locked !== null) {
        setNeedsTotp(true);
        setLockedUntil(Date.now() + locked * 1000);
        return;
      }
      // The API answers 401 `totp_required` when the account has 2FA on and no
      // code was sent — the password was correct, so we only add the code field
      // rather than showing a credentials error.
      const message = err instanceof Error ? err.message : '';
      if (message.includes('totp_required')) {
        setNeedsTotp(true);
        return;
      }
      if (message.includes('totp_invalid_code')) {
        setNeedsTotp(true);
        setRootError(ro.login.totpError);
        return;
      }
      setRootError(ro.login.errorGeneric);
    }
  };

  const submitting = form.formState.isSubmitting;
  const notice = rootError === null ? sessionNotice(arrival?.reason) : null;

  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden px-4 py-10">
      {/* Quiet branded ambience — sage glow, not a cream wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,var(--color-accent),transparent_70%)]"
      />

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-5 text-center">
          <BrandMark className="scale-110" />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {ro.login.title}
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              {ro.login.subtitle}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {notice && (
            <p
              role="status"
              className="mb-5 rounded-md bg-muted px-3 py-2 text-xs font-medium text-muted-foreground text-pretty"
            >
              {notice}
            </p>
          )}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">{ro.login.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder={ro.login.emailPlaceholder}
                aria-invalid={!!form.formState.errors.email}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="password">{ro.login.passwordLabel}</Label>
                {/* Not a link: there is no self-service reset, and a button
                    that did nothing was worse than the sentence that says so
                    (audit A10, F14). Registration is closed and an admin
                    issues the new password. */}
                <span className="text-xs text-muted-foreground">
                  {ro.login.forgot}
                </span>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder={ro.login.passwordPlaceholder}
                aria-invalid={!!form.formState.errors.password}
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {needsTotp && (
              <div className="space-y-2">
                <Label htmlFor="totpCode">{ro.login.totpLabel}</Label>
                <Input
                  id="totpCode"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  placeholder={ro.login.totpPlaceholder}
                  {...form.register('totpCode')}
                />
                <p className="text-xs text-muted-foreground text-pretty">
                  {ro.login.totpHint}
                </p>
              </div>
            )}

            {(rootError || lockedFor > 0) && (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
              >
                {lockedFor > 0 ? ro.login.totpLocked(lockedFor) : rootError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || lockedFor > 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {ro.login.submitting}
                </>
              ) : lockedFor > 0 ? (
                ro.login.totpLocked(lockedFor)
              ) : (
                ro.login.submit
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="size-3" />
          {ro.login.footnote}
        </p>
      </div>
    </div>
  );
}
