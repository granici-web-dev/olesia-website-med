import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronRight,
  MessagesSquare,
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

import { StatusBadge } from '@/features/quick-questions/status-badges';
import { PaymentBadge } from '@/components/common/payment-badge';
import { DeadlineIndicator } from '@/features/quick-questions/deadline-indicator';
import { TicketDetailSheet } from '@/features/quick-questions/ticket-detail-sheet';
import { fetchTickets } from '@/features/quick-questions/api';
import { bucketOf } from '@/features/quick-questions/format';
import { ticketsQueryKey } from '@/features/quick-questions/query-key';
import type { StatusFilter } from '@/features/quick-questions/types';
import { fetchWorkingHours } from '@/features/working-hours/api';
import { workingHoursQueryKey } from '@/features/working-hours/query-key';
import { formatSla } from '@/features/working-hours/sla';

const t = ro.quickQuestions;
/**
 * `unpaid` sits first because it is the one bucket that needs no work: it is
 * the queue of questions somebody wrote and never paid for, and the doctor's
 * job there is to look and do nothing. Keeping it visible rather than hidden
 * is what makes "an answer only after payment" legible instead of mysterious.
 */
const STATUS_TABS: StatusFilter[] = [
  'all',
  'unpaid',
  'open',
  'overdue',
  'answered',
];

export function QuickQuestionsPage() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ticketsQueryKey,
    queryFn: fetchTickets,
  });

  /**
   * The promised turnaround, for the column header. Its own query and not part
   * of the ticket payload: the deadline on each row was computed when that
   * ticket was paid for, while the header states the promise as it stands now.
   * A failure here only costs the parenthesis — the column still says "Termen".
   */
  const { data: schedule } = useQuery({
    queryKey: workingHoursQueryKey,
    queryFn: fetchWorkingHours,
  });

  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const tickets = React.useMemo(() => data ?? [], [data]);

  // Precompute the derived bucket once per ticket.
  const withBucket = React.useMemo(
    () => tickets.map((tk) => ({ tk, bucket: bucketOf(tk) })),
    [tickets],
  );

  const scoped = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return withBucket;
    return withBucket.filter(
      ({ tk }) =>
        tk.clientName.toLowerCase().includes(q) ||
        tk.clientEmail.toLowerCase().includes(q) ||
        tk.question.toLowerCase().includes(q),
    );
  }, [withBucket, search]);

  const counts = React.useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: scoped.length,
      open: 0,
      unpaid: 0,
      overdue: 0,
      answered: 0,
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
    () => tickets.find((tk) => tk.id === selectedId) ?? null,
    [tickets, selectedId],
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
                    key === 'overdue' && counts.overdue > 0 && status !== key
                      ? 'font-semibold text-destructive'
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
          <TicketsTableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={filtersActive ? SearchX : MessagesSquare}
            title={
              status === 'unpaid' && !search
                ? t.empty.unpaidTitle
                : filtersActive
                  ? t.empty.filteredTitle
                  : t.empty.title
            }
            description={
              status === 'unpaid' && !search
                ? t.empty.unpaidBody
                : filtersActive
                  ? t.empty.filteredBody
                  : t.empty.body
            }
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
                <TableHead>{t.columns.question}</TableHead>
                <TableHead>
                  {schedule
                    ? t.columns.deadlineWithSla(
                        formatSla(schedule.expressSlaMinutes),
                      )
                    : t.columns.deadline}
                </TableHead>
                <TableHead>{t.columns.status}</TableHead>
                <TableHead>{t.columns.payment}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.rows.map(({ tk, bucket }) => (
                <TableRow
                  key={tk.id}
                  onClick={() => openDetail(tk.id)}
                  data-state={tk.id === selectedId ? 'selected' : undefined}
                  className="cursor-pointer"
                >
                  <TableCell className="align-top">
                    <div className="font-medium">{tk.clientName}</div>
                    <div className="text-xs text-muted-foreground">
                      {tk.clientEmail}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs align-top">
                    <p className="truncate text-sm text-muted-foreground">
                      {tk.question}
                    </p>
                  </TableCell>
                  <TableCell className="align-top">
                    <DeadlineIndicator ticket={tk} />
                  </TableCell>
                  <TableCell className="align-top">
                    <StatusBadge bucket={bucket} />
                  </TableCell>
                  <TableCell className="align-top">
                    <PaymentBadge status={tk.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right align-top">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      aria-label={t.detail.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(tk.id);
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

      <TicketDetailSheet
        ticket={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

function TicketsTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <div className="w-40 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}
