import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CalendarX2,
  ChevronRight,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

import { StatusBadge } from '@/features/appointments/status-badges';
import { AppointmentPaymentCell } from '@/features/appointments/payment-cell';
import { AppointmentDetailSheet } from '@/features/appointments/appointment-detail-sheet';
import {
  fetchAppointments,
  serviceLabel,
  formatDateTime,
} from '@/features/appointments/data';
import { appointmentsQueryKey } from '@/features/appointments/query-key';
import type {
  AppointmentServiceCode,
  StatusFilter,
} from '@/features/appointments/types';

const t = ro.appointments;

const STATUS_TABS: StatusFilter[] = [
  'all',
  'scheduled',
  'completed',
  'no_show',
  'canceled',
];

const SERVICE_OPTIONS: AppointmentServiceCode[] = [
  'pediatric',
  'nutrition_copii',
  'nutrition_adulti',
  'integrative',
];

export function AppointmentsPage() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: appointmentsQueryKey,
    queryFn: fetchAppointments,
  });

  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [service, setService] = React.useState<AppointmentServiceCode | 'all'>(
    'all',
  );
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const appointments = React.useMemo(() => data ?? [], [data]);

  // Service + search narrow the set; status counts are computed against it.
  const scoped = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((a) => {
      if (service !== 'all' && a.service !== service) return false;
      if (
        q &&
        !a.clientName.toLowerCase().includes(q) &&
        !a.clientEmail.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [appointments, service, search]);

  const counts = React.useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: scoped.length,
      scheduled: 0,
      completed: 0,
      no_show: 0,
      canceled: 0,
    };
    for (const a of scoped) c[a.status] += 1;
    return c;
  }, [scoped]);

  const visible = React.useMemo(
    () => (status === 'all' ? scoped : scoped.filter((a) => a.status === status)),
    [scoped, status],
  );

  const paged = usePagedRows(visible);

  const selected = React.useMemo(
    () => appointments.find((a) => a.id === selectedId) ?? null,
    [appointments, selectedId],
  );

  const rescheduledFrom = React.useMemo(
    () =>
      appointments.find((a) => a.id === selected?.rescheduledFromId) ?? null,
    [appointments, selected?.rescheduledFromId],
  );

  const filtersActive = status !== 'all' || service !== 'all' || search !== '';

  const resetFilters = () => {
    setStatus('all');
    setService('all');
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

      {/* Filters */}
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
                    'rounded px-1 text-xs tabular-nums',
                    status === key
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/70',
                  )}
                >
                  {counts[key]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <label className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.filters.searchPlaceholder}
              aria-label={t.filters.searchPlaceholder}
              className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm shadow-xs outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:w-64"
            />
          </label>

          <Select
            value={service}
            onValueChange={(v) =>
              setService(v as AppointmentServiceCode | 'all')
            }
          >
            <SelectTrigger className="w-auto min-w-[10rem]" aria-label={t.filters.service}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filters.allServices}</SelectItem>
              {SERVICE_OPTIONS.map((code) => (
                <SelectItem key={code} value={code}>
                  {serviceLabel(code)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              {t.filters.reset}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
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
          <AppointmentsTableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={filtersActive ? SearchX : CalendarX2}
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
                <TableHead>{t.columns.service}</TableHead>
                <TableHead>{t.columns.when}</TableHead>
                <TableHead>{t.columns.status}</TableHead>
                <TableHead>{t.columns.payment}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.rows.map((a) => (
                <TableRow
                  key={a.id}
                  onClick={() => openDetail(a.id)}
                  data-state={a.id === selectedId ? 'selected' : undefined}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="font-medium">{a.clientName}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.clientEmail}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {serviceLabel(a.service)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatDateTime(a.startTime)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell>
                    <AppointmentPaymentCell appointment={a} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      aria-label={t.detail.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(a.id);
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

      <AppointmentDetailSheet
        appointment={selected}
        rescheduledFrom={rescheduledFrom}
        onOpenAppointment={setSelectedId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

function AppointmentsTableSkeleton() {
  return (
    <div className="divide-y">
      <div className="flex items-center gap-4 px-3 py-3">
        {['28%', '22%', '20%', '14%', '14%'].map((w, i) => (
          <Skeleton key={i} className="h-3" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <div className="flex-[28%] space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-3.5 flex-[22%]" />
          <Skeleton className="h-3.5 flex-[20%]" />
          <Skeleton className="h-5 flex-[14%] rounded-md" />
          <Skeleton className="h-5 flex-[14%] rounded-md" />
        </div>
      ))}
    </div>
  );
}
