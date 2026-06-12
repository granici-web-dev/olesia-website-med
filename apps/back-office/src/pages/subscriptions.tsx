import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronRight,
  Repeat2,
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
import { ro } from '@/i18n/ro';

import {
  StatusBadge,
  PaymentBadge,
} from '@/features/subscriptions/status-badges';
import { QuotaBar } from '@/features/subscriptions/quota-bar';
import { SubscriptionDetailSheet } from '@/features/subscriptions/subscription-detail-sheet';
import {
  fetchSubscriptions,
  formatDate,
  daysRemaining,
} from '@/features/subscriptions/data';
import { subscriptionsQueryKey } from '@/features/subscriptions/query-key';
import type {
  Subscription,
  StatusFilter,
} from '@/features/subscriptions/types';

const t = ro.subscriptions;
const STATUS_TABS: StatusFilter[] = ['all', 'active', 'expired', 'canceled'];

function periodHint(s: Subscription): { text: string; warn: boolean } {
  if (s.status !== 'active') return { text: t.status[s.status], warn: false };
  const days = daysRemaining(s.endDate);
  if (days <= 0) return { text: t.period.expired, warn: true };
  if (days === 1) return { text: t.period.lastDay, warn: true };
  return { text: `${days} ${t.period.daysLeft}`, warn: days <= 7 };
}

export function SubscriptionsPage() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: subscriptionsQueryKey,
    queryFn: fetchSubscriptions,
  });

  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const subscriptions = React.useMemo(() => data ?? [], [data]);

  const scoped = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscriptions.filter((s) => {
      if (
        q &&
        !s.clientName.toLowerCase().includes(q) &&
        !s.clientEmail.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [subscriptions, search]);

  const counts = React.useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: scoped.length,
      active: 0,
      expired: 0,
      canceled: 0,
    };
    for (const s of scoped) c[s.status] += 1;
    return c;
  }, [scoped]);

  const visible = React.useMemo(
    () =>
      status === 'all' ? scoped : scoped.filter((s) => s.status === status),
    [scoped, status],
  );

  const selected = React.useMemo(
    () => subscriptions.find((s) => s.id === selectedId) ?? null,
    [subscriptions, selectedId],
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
            placeholder={t.filters.searchPlaceholder}
            aria-label={t.filters.searchPlaceholder}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm shadow-xs outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:w-72"
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
          <SubscriptionsTableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={filtersActive ? SearchX : Repeat2}
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
                <TableHead>{t.columns.period}</TableHead>
                <TableHead>{t.columns.quota}</TableHead>
                <TableHead>{t.columns.status}</TableHead>
                <TableHead>{t.columns.payment}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((s) => {
                const hint = periodHint(s);
                return (
                  <TableRow
                    key={s.id}
                    onClick={() => openDetail(s.id)}
                    data-state={s.id === selectedId ? 'selected' : undefined}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="font-medium">{s.clientName}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.clientEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm tabular-nums">
                        {formatDate(s.startDate)} – {formatDate(s.endDate)}
                      </div>
                      <div
                        className={cn(
                          'text-xs',
                          hint.warn
                            ? 'font-medium text-warning-foreground'
                            : 'text-muted-foreground',
                        )}
                      >
                        {hint.text}
                      </div>
                    </TableCell>
                    <TableCell>
                      <QuotaBar
                        used={s.videoQuotaUsed}
                        total={s.videoQuotaTotal}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentBadge status={s.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        aria-label={t.detail.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(s.id);
                        }}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <SubscriptionDetailSheet
        subscription={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

function SubscriptionsTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}
