import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Download, Link2, Loader2, Mail, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ro } from '@/i18n/ro';

import {
  deleteUploadedDocument,
  downloadUploadedDocument,
  fetchUploadLinks,
  issueUploadLink,
  revokeUploadLink,
  sendUploadLink,
} from '@/features/uploads/data';
import { uploadLinksQueryKey } from '@/features/uploads/query-key';

const t = ro.patientUploads;

const dateFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const dateTimeFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function humanSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1
    ? `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Analyses the patient sent before the consultation (§11.14).
 *
 * The link is the whole access mechanism, so this panel is built around
 * handing it over: it is copyable first and emailable second, because with no
 * SMTP configured the email genuinely does not leave — and the panel says so
 * rather than showing a success toast for a message that was never sent.
 */
export function PatientUploadsPanel({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const queryClient = useQueryClient();
  const queryKey = uploadLinksQueryKey(appointmentId);
  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchUploadLinks(appointmentId),
  });

  const issue = useMutation({
    mutationFn: () => issueUploadLink(appointmentId),
    onSuccess: () => {
      toast.success(t.toast.issued);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const send = useMutation({
    mutationFn: sendUploadLink,
    onSuccess: ({ sent }) =>
      sent ? toast.success(t.toast.sent) : toast.warning(t.toast.notSent),
    onError: () => toast.error(t.toast.error),
  });

  const revoke = useMutation({
    mutationFn: revokeUploadLink,
    onSuccess: () => {
      toast.success(t.toast.revoked);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const removeDoc = useMutation({
    mutationFn: deleteUploadedDocument,
    onSuccess: () => {
      toast.success(t.toast.documentDeleted);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.toast.copied);
    } catch {
      toast.error(t.toast.copyFailed);
    }
  };

  const download = async (id: string, fileName: string) => {
    try {
      await downloadUploadedDocument(id, fileName);
    } catch {
      toast.error(t.toast.downloadFailed);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }

  const link = data?.[0];

  if (!link) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-pretty">{t.noLink}</p>
        <Button
          variant="outline"
          className="w-full"
          disabled={issue.isPending}
          onClick={() => issue.mutate()}
        >
          {issue.isPending ? <Loader2 className="animate-spin" /> : <Link2 />}
          {t.actions.issue}
        </Button>
      </div>
    );
  }

  const expired = new Date(link.expiresAt).getTime() < Date.now();
  const dead = expired || !!link.revokedAt;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/40 px-3 py-2">
        <p className="font-mono text-[11px] leading-relaxed break-all text-muted-foreground">
          {link.url}
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        {link.revokedAt
          ? t.state.revoked
          : expired
            ? t.state.expired
            : `${t.state.validUntil} ${dateFmt.format(new Date(link.expiresAt))}`}
        {' · '}
        {link.consentAt ? t.state.consentGiven : t.state.consentPending}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => copy(link.url)}>
          <Copy />
          {t.actions.copy}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={send.isPending || dead}
          onClick={() => send.mutate(link.id)}
        >
          {send.isPending ? <Loader2 className="animate-spin" /> : <Mail />}
          {t.actions.email}
        </Button>
        {dead ? (
          <Button
            variant="outline"
            size="sm"
            disabled={issue.isPending}
            onClick={() => issue.mutate()}
          >
            {issue.isPending ? <Loader2 className="animate-spin" /> : <Link2 />}
            {t.actions.renew}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={revoke.isPending}
            onClick={() => revoke.mutate(link.id)}
          >
            {revoke.isPending ? <Loader2 className="animate-spin" /> : <X />}
            {t.actions.revoke}
          </Button>
        )}
      </div>

      {link.documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.noDocuments}</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {link.documents.map((d) => (
            <li key={d.id} className="flex items-start gap-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {humanSize(d.sizeBytes)} ·{' '}
                  {dateTimeFmt.format(new Date(d.uploadedAt))}
                  {d.note ? ` · ${d.note}` : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                aria-label={t.actions.download}
                onClick={() => download(d.id, d.fileName)}
              >
                <Download className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={t.actions.deleteDocument}
                disabled={removeDoc.isPending}
                onClick={() => removeDoc.mutate(d.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
