import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Copy,
  Download,
  Link2,
  Loader2,
  Mail,
  RefreshCw,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmAction } from '@/components/common/confirm-action';
import { EmptyState } from '@/components/common/empty-state';
import { ApiError } from '@/api/http';
import { copyToClipboard } from '@/lib/clipboard';
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
import type { UploadedDocument, UploadTarget } from '@/features/uploads/types';

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
 * The documents a client sent, and the link they sent them through (§11.14).
 *
 * The link is the whole access mechanism, so this panel is built around
 * handing it over: it is copyable first and emailable second, because with no
 * SMTP configured the email genuinely does not leave — and the panel says so
 * rather than showing a success toast for a message that was never sent.
 *
 * Both targets, because both need it: analyses before a consultation, and
 * whatever a personalized menu or protocol has to be written from. The order
 * side of it had routes in the API and no button anywhere (audit A10, F15).
 */
export function PatientUploadsPanel({
  target,
  targetId,
}: {
  target: UploadTarget;
  targetId: string;
}) {
  const queryClient = useQueryClient();
  const queryKey = uploadLinksQueryKey(target, targetId);
  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchUploadLinks(target, targetId),
  });

  const [deletingDocument, setDeletingDocument] =
    React.useState<UploadedDocument | null>(null);

  const issue = useMutation({
    mutationFn: () => issueUploadLink(target, targetId),
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
      setDeletingDocument(null);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const copy = async (url: string) => {
    if (await copyToClipboard(url)) toast.success(t.toast.copied);
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

  // These routes are `admin` only (uploads.controller.ts), so an editor with
  // an appointment or an order open gets a 403 here. Reading that as "no link
  // yet" offered her a button that could only 403 again.
  if (isError) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return forbidden ? (
      <EmptyState
        icon={ShieldAlert}
        title={ro.states.forbiddenTitle}
        description={ro.states.forbiddenBody}
        className="gap-3 px-0 py-6"
      />
    ) : (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-pretty">
          {t.loadError}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw />
          {ro.common.retry}
        </Button>
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
          <ConfirmAction
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={revoke.isPending}
              >
                {revoke.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <X />
                )}
                {t.actions.revoke}
              </Button>
            }
            title={t.confirm.revokeTitle}
            body={t.confirm.revokeBody}
            cta={t.confirm.revokeCta}
            pending={revoke.isPending}
            onConfirm={() => revoke.mutate(link.id)}
            destructive
          />
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
                onClick={() => setDeletingDocument(d)}
              >
                {removeDoc.isPending && removeDoc.variables === d.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={deletingDocument !== null}
        onOpenChange={(open) => !open && setDeletingDocument(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirm.deleteDocumentTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingDocument && (
                <>
                  <span className="font-medium text-foreground">
                    {deletingDocument.fileName}
                  </span>{' '}
                  {t.confirm.deleteDocumentBody}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeDoc.isPending}>
              {ro.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeDoc.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (deletingDocument) removeDoc.mutate(deletingDocument.id);
              }}
            >
              {t.confirm.deleteDocumentCta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
