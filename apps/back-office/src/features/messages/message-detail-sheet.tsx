import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail, Reply, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ro } from '@/i18n/ro';

import { StatusBadge, SubjectBadge } from '@/features/messages/status-badges';
import { markRead, deleteMessage, formatDateTime } from '@/features/messages/data';
import { messagesQueryKey } from '@/features/messages/query-key';
import type { Message } from '@/features/messages/types';

const t = ro.messages;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
      {children}
    </p>
  );
}

/** Build a pre-filled mailto: so the doctor can reply from her own mail client
 *  while portal email replies (SMTP) are not yet wired. */
function replyMailto(m: Message): string {
  const subject = `Re: ${t.subjects[m.subject]}`;
  const body = `\n\n———\n${m.name} a scris:\n${m.message}`;
  return `mailto:${m.email}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export function MessageDetailSheet({
  message,
  open,
  onOpenChange,
}: {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: messagesQueryKey });

  const readMutation = useMutation({
    mutationFn: markRead,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      toast.success(t.toast.deleted);
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error(t.toast.error),
  });

  const m = message;

  // Opening an unread message marks it read (once).
  React.useEffect(() => {
    if (open && m && m.status === 'new' && !readMutation.isPending) {
      readMutation.mutate(m.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, m?.id]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-lg"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{t.detail.title}</SheetTitle>
        </SheetHeader>

        {m && (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={m.status} />
                <SubjectBadge subject={m.subject} />
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-tight text-balance">
                  {m.name}
                </h3>
                <a
                  href={`mailto:${m.email}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  <Mail className="size-3.5" />
                  {m.email}
                </a>
              </div>

              <div className="rounded-lg border bg-muted/40 px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  {t.detail.received} {formatDateTime(m.createdAt)}
                </span>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <SectionTitle>{t.detail.message}</SectionTitle>
                <p className="rounded-lg border bg-background px-3 py-2.5 text-sm leading-relaxed whitespace-pre-line text-pretty">
                  {m.message}
                </p>
              </div>

              <Separator />

              {/* Reply — email sending from the portal lands once SMTP is set up.
                  Until then, a pre-filled mailto: lets her reply from her inbox. */}
              <div className="space-y-2">
                <SectionTitle>{t.detail.reply}</SectionTitle>
                <p className="text-sm text-muted-foreground text-pretty">
                  {t.detail.replyHint}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a href={replyMailto(m)}>
                    <Reply />
                    {t.actions.replyByEmail}
                  </a>
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 border-t px-6 py-4">
              <DeleteMessage
                pending={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(m.id)}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DeleteMessage({
  pending,
  onConfirm,
}: {
  pending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={pending}
        >
          {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
          {t.actions.delete}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.confirm.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.confirm.deleteBody}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{ro.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {t.confirm.deleteCta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
