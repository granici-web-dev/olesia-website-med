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
import { paths } from '@/config/routes';
import { ro } from '@/i18n/ro';

const schema = z.object({
  email: z.string().email(ro.login.errorInvalid),
  password: z.string().min(6, ro.login.errorInvalid),
  /** Only asked for after the API answers `totp_required`. */
  totpCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    paths.dashboard;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', totpCode: '' },
  });

  const [rootError, setRootError] = React.useState<string | null>(null);
  /** Second step: the account has 2FA on, so a code is required. */
  const [needsTotp, setNeedsTotp] = React.useState(false);

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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{ro.login.passwordLabel}</Label>
                <button
                  type="button"
                  className="text-xs font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:underline"
                >
                  {ro.login.forgot}
                </button>
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

            {rootError && (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
              >
                {rootError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {ro.login.submitting}
                </>
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
