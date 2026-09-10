import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronRight,
  CreditCard,
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

import { PaymentStateBadge } from '@/features/payments/state-badge';
import { PaymentDetailSheet } from '@/features/payments/payment-detail-sheet';
import {
  fetchPayments,
  formatAmount,
  formatDateTime,
} from '@/features/payments/data';
import { paymentsQueryKey } from '@/features/payments/query-key';
import type { Payment, PaymentStateFilter } from '@/features/payments/types';

const t = ro.payments;
const TABS: PaymentStateFilter[] = ['all', 'paid', 'pending', 'refunded', 'failed'];

/**
 * Which tab a payment belongs under. Deliberately coarser than the state enum:
 * nine states are the bank's vocabulary, not the doctor's. She wants to know
 * whether the money arrived, is still in the air, went back, or never came.
 */
function bucketOf(p: Payment): Exclude<PaymentStateFilter, 'all'> {
  switch (p.state) {
    case 'paid':
      return 'paid';
    case 'created':
    case 'pending':
      return 'pending';
    case 'refunded':
    case 'partially_refunded':
      return 'refunded';
    default:
      return 'failed';
  }
}

/**
 * "Plăți" — the online payments ledger.
 *
 * Read-only by nature, and that is the point: unlike every other operations
 * screen there is nothing to confirm by hand here. The bank tells us what
 * happened. The only action is a refund, and only an admin sees it.
 */
export function PaymentsPage() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: paymentsQueryKey,
    queryFn: fetchPayments,
  });

  const [bucket, setBucket] = React.useState<PaymentStateFilter>('all');
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const payments = React.useMemo(() => data ?? [], [data]);

  const scoped = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        (p.payerName ?? '').toLowerCase().includes(q) ||
        p.payerEmail.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        (p.rrn ?? '').includes(q),
    );
  }, [payments, search]);

  const counts = React.useMemo(() => {
    const c: Record<PaymentStateFilter, number> = {
      all: scoped.length,
      paid: 0,
      pending: 0,
      refunded: 0,
      failed: 0,
    };
    for (const p of scoped) c[bucketOf(p)] += 1;
    return c;
  }, [scoped]);

  const visible = React.useMemo(
    () => (bucket === 'all' ? scoped : scoped.filter((p) => bucketOf(p) === bucket)),
    [scoped, bucket],
  );

  const selected = React.useMemo(
    () => payments.find((p) => p.id === selectedId) ?? null,
    [payments, selectedId],
  );

  const filtersActive = bucket !== 'all' || search !== '';
  const resetFilters = () => {
    setBucket('all');
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
          value={bucket}
          onValueChange={(v) => setBucket(v as PaymentStateFilter)}
          className="min-w-0"
        >
          <TabsList className="h-9 w-full justify-start overflow-x-auto lg:w-auto">
            {TABS.map((key) => (
              <TabsTrigger key={key} value={key} className="flex-none gap-1.5">
                {t.tabs[key]}
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    key === 'pending' && counts.pending > 0 && bucket !== key
                      ? 'font-semibold text-warning-foreground'
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
          <PaymentsTableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={filtersActive ? SearchX : CreditCard}
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
              <TableRow>
                {/* On a narrow screen the amount and the state are the whole
                    point of this table, so the date yields to them and moves
                    under the client's name instead. */}
                <TableHead className="hidden sm:table-cell">{t.columns.date}</TableHead>
                <TableHead>{t.columns.client}</TableHead>
                <TableHead className="hidden md:table-cell">{t.columns.what}</TableHead>
                <TableHead className="text-right">{t.columns.amount}</TableHead>
                <TableHead className="hidden sm:table-cell">{t.columns.state}</TableHead>
                <TableHead className="hidden w-10 sm:table-cell" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((p) => (
                <TableRow
                  key={p.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => openDetail(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openDetail(p.id);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <TableCell className="hidden whitespace-nowrap text-muted-foreground tabular-nums sm:table-cell">
                    {formatDateTime(p.paidAt ?? p.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{p.payerName ?? p.payerEmail}</span>
                    {/* The email drops out below `sm` so the state badge is
                        not the thing that gets clipped. It is one tap away in
                        the detail sheet; the state is why she opened the page. */}
                    {p.payerName && (
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {p.payerEmail}
                      </span>
                    )}
                    <span className="block text-xs text-muted-foreground tabular-nums sm:hidden">
                      {formatDateTime(p.paidAt ?? p.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {t.target[p.targetType]}
                  </TableCell>
                  <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">
                    {formatAmount(p.amount, p.currency)}
                    {p.refundedAmount > 0 && (
                      <span className="block text-xs font-normal text-info">
                        −{formatAmount(p.refundedAmount, p.currency)}
                      </span>
                    )}
                    {/* Below `sm` the badge joins the amount rather than
                        living in a column that scrolls off the edge. Whether
                        the money arrived must never need a horizontal swipe. */}
                    <span className="mt-1 flex justify-end sm:hidden">
                      <PaymentStateBadge state={p.state} />
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <PaymentStateBadge state={p.state} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    <ChevronRight className="size-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <PaymentDetailSheet
        payment={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

function PaymentsTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="hidden h-4 w-32 md:block" />
          <Skeleton className="ml-auto h-4 w-20" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}
