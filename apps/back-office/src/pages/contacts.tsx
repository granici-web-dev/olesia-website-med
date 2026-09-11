import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Contact as ContactIcon,
  ExternalLink,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

import { ContactFormSheet } from '@/features/contacts/contact-form-sheet';
import {
  fetchContacts,
  deleteContact,
  setContactActive,
} from '@/features/contacts/api';
import { contactTypeIcon, contactHref } from '@/features/contacts/format';
import { contactsQueryKey } from '@/features/contacts/query-key';
import type { Contact } from '@/features/contacts/types';

const t = ro.contacts;

export function ContactsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: contactsQueryKey,
    queryFn: fetchContacts,
  });

  const contacts = React.useMemo(() => data ?? [], [data]);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Contact | null>(null);
  const [deleting, setDeleting] = React.useState<Contact | null>(null);

  const nextSortOrder = React.useMemo(
    () => contacts.reduce((max, c) => Math.max(max, c.sortOrder), 0) + 1,
    [contacts],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: contactsQueryKey });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setContactActive(id, active),
    onSuccess: (c) => {
      toast.success(c.active ? t.toast.activated : t.toast.deactivated);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      toast.success(t.toast.deleted);
      setDeleting(null);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (contact: Contact) => {
    setEditing(contact);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn(isFetching && 'animate-spin')} />
              {t.refresh}
            </Button>
            <Button onClick={openCreate}>
              <Plus />
              {t.newContact}
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden py-0">
        {isError ? (
          <EmptyState
            icon={AlertTriangle}
            title={ro.states.errorTitle}
            description={ro.states.errorBody}
            className="py-16"
            action={
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw />
                {ro.common.retry}
              </Button>
            }
          />
        ) : isLoading ? (
          <ContactsTableSkeleton />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={ContactIcon}
            title={t.empty.title}
            description={t.empty.body}
            className="py-16"
            action={
              <Button onClick={openCreate}>
                <Plus />
                {t.newContact}
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">{t.columns.order}</TableHead>
                <TableHead>{t.columns.contact}</TableHead>
                <TableHead>{t.columns.value}</TableHead>
                <TableHead className="text-center">
                  {t.columns.active}
                </TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((c) => {
                const Icon = contactTypeIcon[c.type];
                const href = contactHref(c);
                const external = c.type === 'social' || c.type === 'other';
                return (
                  <TableRow
                    key={c.id}
                    className={cn(!c.active && 'opacity-60')}
                  >
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {c.sortOrder}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                          <Icon className="size-[18px]" strokeWidth={2} />
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium">{c.labelRo}</div>
                          <div className="text-xs text-muted-foreground">
                            {t.type[c.type]}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {href ? (
                        <a
                          href={href}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noreferrer' : undefined}
                          className="inline-flex max-w-full items-center gap-1.5 truncate text-sm text-foreground underline-offset-4 hover:text-primary hover:underline"
                        >
                          <span className="truncate">{c.value}</span>
                          {external && (
                            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                          )}
                        </a>
                      ) : (
                        <span className="truncate text-sm text-muted-foreground">
                          {c.value}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={c.active}
                        disabled={activeMutation.isPending}
                        onCheckedChange={(active) =>
                          activeMutation.mutate({ id: c.id, active })
                        }
                        aria-label={c.active ? t.active.on : t.active.off}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                          aria-label={ro.common.edit}
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={ro.common.delete}
                          onClick={() => setDeleting(c)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <ContactFormSheet
        contact={editing}
        nextSortOrder={nextSortOrder}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.delete.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? (
                <>
                  <span className="font-medium text-foreground">
                    {deleting.labelRo}
                  </span>{' '}
                  — {t.delete.body}
                </>
              ) : (
                t.delete.body
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {ro.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleting) deleteMutation.mutate(deleting.id);
              }}
            >
              {t.delete.cta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ContactsTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <Skeleton className="h-4 w-5" />
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      ))}
    </div>
  );
}
