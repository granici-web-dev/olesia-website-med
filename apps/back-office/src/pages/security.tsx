import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ShieldCheck, ShieldOff, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { UserDto } from '@olesia/shared';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { http } from '@/api/http';
import { disableTotp, enableTotp, startTotpEnrolment } from '@/api/auth';
import { ChangePasswordForm } from '@/auth/change-password-form';
import { ro } from '@/i18n/ro';

/* Account security — enrolling in and turning off two-factor authentication
   (client answers v2 §10). Enrolment is deliberately three steps: scan, prove a
   code works, then save the recovery codes — 2FA only switches on after the
   code check, so a half-finished setup can never lock anyone out. Recovery
   codes are shown exactly once; the server keeps only their hashes. */

const t = ro.security;

export function SecurityPage() {
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ['me'], queryFn: () => http.get<UserDto>('/auth/me') });

  const [enrolment, setEnrolment] = React.useState<Awaited<
    ReturnType<typeof startTotpEnrolment>
  > | null>(null);
  const [code, setCode] = React.useState('');
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(null);
  const [copied, setCopied] = React.useState(false);

  const reset = () => {
    setEnrolment(null);
    setCode('');
  };

  const start = useMutation({
    mutationFn: startTotpEnrolment,
    onSuccess: (data) => {
      setEnrolment(data);
      setRecoveryCodes(null);
    },
    onError: () => toast.error(t.errorGeneric),
  });

  const enable = useMutation({
    mutationFn: () => enableTotp(code.trim()),
    onSuccess: async (data) => {
      setRecoveryCodes(data.recoveryCodes);
      reset();
      await qc.invalidateQueries({ queryKey: ['me'] });
      toast.success(t.enabledToast);
    },
    onError: () => toast.error(t.invalidCode),
  });

  const disable = useMutation({
    mutationFn: () => disableTotp(code.trim()),
    onSuccess: async () => {
      reset();
      setRecoveryCodes(null);
      await qc.invalidateQueries({ queryKey: ['me'] });
      toast.success(t.disabledToast);
    },
    onError: () => toast.error(t.invalidCode),
  });

  const copyCodes = async () => {
    if (!recoveryCodes) return;
    await navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const enabled = me.data?.totpEnabled ?? false;
  const busy = start.isPending || enable.isPending || disable.isPending;

  return (
    <div className="space-y-6">
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {enabled ? <ShieldCheck className="size-4" /> : <ShieldOff className="size-4" />}
                {t.cardTitle}
              </CardTitle>
              <CardDescription className="text-pretty">{t.cardDescription}</CardDescription>
            </div>
            <Badge variant={enabled ? 'default' : 'secondary'}>
              {enabled ? t.statusOn : t.statusOff}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {me.isLoading && <Loader2 className="animate-spin" />}

          {/* Freshly generated recovery codes — shown once, never again. */}
          {recoveryCodes && (
            <div className="rounded-md border border-dashed p-4">
              <p className="text-sm font-medium">{t.recoveryTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground text-pretty">{t.recoveryHint}</p>
              <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm">
                {recoveryCodes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="mt-4" onClick={copyCodes}>
                {copied ? <Check /> : <Copy />}
                {copied ? t.copied : t.copy}
              </Button>
            </div>
          )}

          {!enabled && !enrolment && (
            <Button onClick={() => start.mutate()} disabled={busy}>
              {start.isPending && <Loader2 className="animate-spin" />}
              {t.enableCta}
            </Button>
          )}

          {/* Step 1 + 2: scan the QR, then prove a code works. */}
          {!enabled && enrolment && (
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <img
                  src={enrolment.qrDataUrl}
                  alt={t.qrAlt}
                  width={168}
                  height={168}
                  className="rounded-md border bg-white p-2"
                />
                <div className="space-y-2 text-sm">
                  <p className="text-pretty">{t.scanHint}</p>
                  <p className="text-xs text-muted-foreground">{t.manualHint}</p>
                  <code className="block rounded bg-muted px-2 py-1 font-mono text-xs break-all">
                    {enrolment.secret}
                  </code>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="totp-confirm">{t.codeLabel}</Label>
                <div className="flex gap-2">
                  <Input
                    id="totp-confirm"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="max-w-[10rem]"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <Button onClick={() => enable.mutate()} disabled={busy || code.trim().length < 6}>
                    {enable.isPending && <Loader2 className="animate-spin" />}
                    {t.confirmCta}
                  </Button>
                  <Button variant="ghost" onClick={reset} disabled={busy}>
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Turning it off also demands a current code. */}
          {enabled && (
            <div className="space-y-2">
              <Label htmlFor="totp-disable">{t.disableLabel}</Label>
              <div className="flex gap-2">
                <Input
                  id="totp-disable"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  className="max-w-[10rem]"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <Button
                  variant="destructive"
                  onClick={() => disable.mutate()}
                  disabled={busy || code.trim().length < 6}
                >
                  {disable.isPending && <Loader2 className="animate-spin" />}
                  {t.disableCta}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-pretty">{t.disableHint}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{ro.changePassword.title}</CardTitle>
          <CardDescription className="text-pretty">
            {ro.changePassword.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
