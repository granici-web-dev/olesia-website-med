import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronRight,
  Mail,
  RefreshCw,
  Search,
  SearchX,
} from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TablePagination } from '@/components/common/table-pagination';
import { usePagedRows } from '@/hooks/use-paged';
import { ro } from '@/i18n/ro';

import { StatusBadge, SubjectBadge } from '@/features/messages/status-badges';
import { MessageDetailSheet } from '@/features/messages/message-detail-sheet';
import { fetchMessages } from '@/features/messages/api';
import { bucketOf } from '@/features/messages/format';
import { formatShortDateTime as formatDateTime } from '@/lib/format';
import { messagesQueryKey } from '@/features/messages/query-key';
import type { StatusFilter } from '@/features/messages/types';

const t = ro.messages;
const STATUS_TABS: StatusFilter[] = ['all', 'new', 'read'];

export function MessagesPage() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: messagesQueryKey,
    queryFn: fetchMessages,
  });

  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const messages = React.useMemo(() => data ?? [], [data]);

  const withBucket = React.useMemo(
    () => messages.map((m) => ({ m, bucket: bucketOf(m) })),
    [messages],
  );

  const scoped = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return withBucket;
    return withBucket.filter(
      ({ m }) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q),
    );
  }, [withBucket, search]);

  const counts = React.useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: scoped.length,
      new: 0,
      read: 0,
    };
    for (const { bucket } of scoped) c[bucket] += 1;
    return c;
  }, [scoped]);

  const visible = React.useMemo(
    () =>
      status === 'all'
        ? scoped
        : scoped.filter(({ bucket }) => bucket === status),
    [scoped, status],
  );

  const paged = usePagedRows(visible);

  const selected = React.useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId],
  );

  const filtersActive = status !== 'all' || search !== '';
  const resetFilters = () => {
    setStatus('all');
    setSearch('');
  };
  const openDetail = (id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn(isFetching && 'animate-spin')} />
            {t.refresh}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
          className="min-w-0"
        >
          <TabsList className="h-9 w-full justify-start overflow-x-auto lg:w-auto">
            {STATUS_TABS.map((key) => (
              <TabsTrigger key={key} value={key} className="flex-none gap-1.5">
                {t.tabs[key]}
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    key === 'new' && counts.new > 0 && status !== key
                      ? 'font-semibold text-info'
                      : 'text-muted-foreground/70',
                  )}
                >
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
            placeholder={t.filters.searchPlaceholder}
            aria-label={t.filters.searchPlaceholder}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm shadow-xs outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:w-80"
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
          <MessagesTableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={filtersActive ? SearchX : Mail}
            title={filtersActive ? t.empty.filteredTitle : t.empty.title}
            description={filtersActive ? t.empty.filteredBody : t.empty.body}
            className="py-16"
            action={
              filtersActive ? (
                <Button variant="outline" onClick={resetFilters}>
                  {t.filters.reset}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.columns.client}</TableHead>
                <TableHead>{t.columns.subject}</TableHead>
                <TableHead>{t.columns.message}</TableHead>
                <TableHead>{t.columns.received}</TableHead>
                <TableHead>{t.columns.status}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.rows.map(({ m }) => (
                <TableRow
                  key={m.id}
                  onClick={() => openDetail(m.id)}
                  data-state={m.id === selectedId ? 'selected' : undefined}
                  className={cn(
                    'cursor-pointer',
                    m.status === 'new' && 'font-medium',
                  )}
                >
                  <TableCell className="align-top">
                    <div className="flex items-center gap-2">
                      {m.status === 'new' && (
                        <span
                          aria-hidden="true"
                          className="size-1.5 shrink-0 rounded-full bg-info"
                        />
                      )}
                      <div>
                        <div>{m.name}</div>
                        <div className="text-xs font-normal text-muted-foreground">
                          {m.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <SubjectBadge subject={m.subject} />
                  </TableCell>
                  <TableCell className="max-w-xs align-top">
                    <p className="truncate text-sm font-normal text-muted-foreground">
                      {m.message}
                    </p>
                  </TableCell>
                  <TableCell className="align-top text-sm font-normal text-muted-foreground whitespace-nowrap">
                    {formatDateTime(m.createdAt)}
                  </TableCell>
                  <TableCell className="align-top">
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="text-right align-top">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      aria-label={t.detail.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(m.id);
                      }}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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

      <MessageDetailSheet
        message={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

function MessagesTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <div className="w-44 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}
