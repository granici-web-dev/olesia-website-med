import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Ban,
  CircleCheck,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  Users as UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ApiError } from '@/api/http';
import { TablePagination } from '@/components/common/table-pagination';
import { usePagedRows } from '@/hooks/use-paged';
import { ro } from '@/i18n/ro';
import { useAuth } from '@/auth/auth-context';

import { RoleBadge, UserStatusBadge } from '@/features/users/user-badges';
import { UserFormSheet } from '@/features/users/user-form-sheet';
import {
  fetchUsers,
  setUserActive,
  resetPassword,
  formatDate,
  initials,
} from '@/features/users/data';
import { usersQueryKey } from '@/features/users/query-key';
import type { User, RoleFilter } from '@/features/users/types';

const t = ro.users;
const ROLE_TABS: RoleFilter[] = ['all', 'admin', 'editor'];

export function UsersPage() {
  const queryClient = useQueryClient();
  const { user: me } = useAuth();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: usersQueryKey,
    queryFn: fetchUsers,
  });

  const users = React.useMemo(() => data ?? [], [data]);
  const [role, setRole] = React.useState<RoleFilter>('all');
  const [search, setSearch] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<User | null>(null);
  const [blocking, setBlocking] = React.useState<User | null>(null);

  const scoped = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const counts = React.useMemo(() => {
    const c: Record<RoleFilter, number> = {
      all: scoped.length,
      admin: 0,
      editor: 0,
    };
    for (const u of scoped) c[u.role] += 1;
    return c;
  }, [scoped]);

  const visible = React.useMemo(
    () => (role === 'all' ? scoped : scoped.filter((u) => u.role === role)),
    [scoped, role],
  );

  const paged = usePagedRows(visible);

  const filtersActive = role !== 'all' || search !== '';
  const resetFilters = () => {
    setRole('all');
    setSearch('');
  };

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: usersQueryKey });

  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setUserActive(id, isActive),
    onSuccess: (u) => {
      toast.success(u.isActive ? t.toast.unblocked : t.toast.blocked);
      setBlocking(null);
      invalidate();
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.message : '';
      toast.error(
        code === 'last_admin'
          ? t.toast.lastAdmin
          : code === 'cannot_deactivate_self'
            ? t.toast.cannotDeactivateSelf
            : t.toast.error,
      );
    },
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => resetPassword(id),
    onSuccess: (password) => {
      toast.success(t.toast.passwordReset, { description: password });
    },
    onError: () => toast.error(t.toast.error),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (user: User) => {
    setEditing(user);
    setFormOpen(true);
  };
  const isSelf = (user: User) => !!me && me.email === user.email;

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
              {t.newUser}
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={role}
          onValueChange={(v) => setRole(v as RoleFilter)}
          className="min-w-0"
        >
          <TabsList className="h-9">
            {ROLE_TABS.map((key) => (
              <TabsTrigger key={key} value={key} className="gap-1.5">
                {key === 'all' ? ro.common.all : ro.roles[key]}
                <span className="text-xs text-muted-foreground/70 tabular-nums">
                  {counts[key]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ro.common.search + '…'}
            aria-label={ro.common.search}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm shadow-xs outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:w-64"
          />
        </label>
      </div>

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
          <UsersTableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={filtersActive ? SearchX : UsersIcon}
            title={filtersActive ? ro.states.emptyTitle : t.empty.title}
            description={filtersActive ? ro.states.emptyBody : t.empty.body}
            className="py-16"
            action={
              filtersActive ? (
                <Button variant="outline" onClick={resetFilters}>
                  {ro.common.all}
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <Plus />
                  {t.newUser}
                </Button>
              )
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.columns.user}</TableHead>
                <TableHead>{t.columns.role}</TableHead>
                <TableHead>{t.columns.status}</TableHead>
                <TableHead>{t.columns.created}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.rows.map((u) => {
                const self = isSelf(u);
                return (
                  <TableRow
                    key={u.id}
                    className={cn(!u.isActive && 'opacity-60')}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initials(u.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{u.name}</span>
                            {self && (
                              <Badge variant="muted" className="text-[10px]">
                                {t.you}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell>
                      <UserStatusBadge active={u.isActive} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground"
                            aria-label={t.actions.menu}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onSelect={() => openEdit(u)}>
                            <Pencil />
                            {t.actions.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => resetMutation.mutate(u.id)}
                          >
                            <KeyRound />
                            {t.actions.resetPassword}
                          </DropdownMenuItem>
                          {!self && (
                            <>
                              <DropdownMenuSeparator />
                              {u.isActive ? (
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => setBlocking(u)}
                                >
                                  <Ban />
                                  {t.actions.block}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onSelect={() =>
                                    activeMutation.mutate({
                                      id: u.id,
                                      isActive: true,
                                    })
                                  }
                                >
                                  <CircleCheck />
                                  {t.actions.unblock}
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <TablePagination
          page={paged.page}
          pageSize={paged.pageSize}
          total={paged.total}
          onPageChange={paged.setPage}
        />
      </Card>

      <UserFormSheet
        user={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <AlertDialog
        open={blocking !== null}
        onOpenChange={(open) => !open && setBlocking(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirm.blockTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {blocking && (
                <>
                  <span className="font-medium text-foreground">
                    {blocking.name}
                  </span>{' '}
                  — {t.confirm.blockBody}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={activeMutation.isPending}>
              {ro.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={activeMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (blocking)
                  activeMutation.mutate({ id: blocking.id, isActive: false });
              }}
            >
              {t.confirm.blockCta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UsersTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
