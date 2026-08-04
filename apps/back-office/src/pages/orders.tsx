import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronRight,
  PackageOpen,
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
  OrderStatusBadge,
  PaymentBadge,
} from '@/features/orders/status-badges';
import { OrderDetailSheet } from '@/features/orders/order-detail-sheet';
import {
  fetchOrders,
  formatDateTime,
  formatPrice,
} from '@/features/orders/data';
import { ordersQueryKey } from '@/features/orders/query-key';
import type { OrderStatusFilter } from '@/features/orders/types';

const t = ro.orders;
const STATUS_TABS: OrderStatusFilter[] = [
  'all',
  'new',
  'in_progress',
  'delivered',
];

/**
 * "Comenzi" — orders for the group-C products (personalized menus and written
 * protocols). Read-mostly: what was ordered and for how much is a record, not a
 * form. The only editable parts are how far along it is and whether it is paid.
 *
 * `canceled` deliberately has no tab: it is the rare case and it would sit
 * there empty most days. It is still reachable through "Toate".
 */
export function OrdersPage() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ordersQueryKey,
    queryFn: fetchOrders,
  });

  const [status, setStatus] = React.useState<OrderStatusFilter>('all');
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const orders = React.useMemo(() => data ?? [], [data]);

  const scoped = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.clientName.toLowerCase().includes(q) ||
        o.clientEmail.toLowerCase().includes(q) ||
        o.titleRo.toLowerCase().includes(q),
    );
  }, [orders, search]);

  const counts = React.useMemo(() => {
    const c: Record<OrderStatusFilter, number> = {
      all: scoped.length,
      new: 0,
      in_progress: 0,
      delivered: 0,
      canceled: 0,
    };
    for (const o of scoped) c[o.status] += 1;
    return c;
  }, [scoped]);

  const visible = React.useMemo(
    () => (status === 'all' ? scoped : scoped.filter((o) => o.status === status)),
    [scoped, status],
  );

  const selected = React.useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
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
          onValueChange={(v) => setStatus(v as OrderStatusFilter)}
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
          <OrdersTableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={filtersActive ? SearchX : PackageOpen}
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
                <TableHead>{t.columns.product}</TableHead>
                <TableHead className="text-right">{t.columns.price}</TableHead>
                <TableHead>{t.columns.ordered}</TableHead>
                <TableHead>{t.columns.status}</TableHead>
                <TableHead>{t.columns.payment}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((o) => (
                <TableRow
                  key={o.id}
                  onClick={() => openDetail(o.id)}
                  data-state={o.id === selectedId ? 'selected' : undefined}
                  className={cn(
                    'cursor-pointer',
                    o.status === 'new' && 'font-medium',
                  )}
                >
                  <TableCell className="align-top">
                    <div className="flex items-center gap-2">
                      {o.status === 'new' && (
                        <span
                          aria-hidden="true"
                          className="size-1.5 shrink-0 rounded-full bg-info"
                        />
                      )}
                      <div>
                        <div>{o.clientName}</div>
                        <div className="text-xs font-normal text-muted-foreground">
                          {o.clientEmail}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs align-top">
                    <p className="truncate text-sm font-normal">{o.titleRo}</p>
                  </TableCell>
                  <TableCell className="align-top text-right tabular-nums whitespace-nowrap">
                    {formatPrice(o.priceEur)}
                  </TableCell>
                  <TableCell className="align-top text-sm font-normal text-muted-foreground whitespace-nowrap">
                    {formatDateTime(o.createdAt)}
                  </TableCell>
                  <TableCell className="align-top">
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="align-top">
                    <PaymentBadge payment={o.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right align-top">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      aria-label={t.detail.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(o.id);
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
      </Card>

      <OrderDetailSheet
        order={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <div className="w-44 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}
