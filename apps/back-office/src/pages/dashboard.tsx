import { useQuery } from '@tanstack/react-query';
import {
  CalendarCheck,
  CreditCard,
  Repeat2,
  MessagesSquare,
  CalendarClock,
  AlertTriangle,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardStatsDto, DashboardUpcomingItem } from '@olesia/shared';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';
import { fetchDashboardStats } from '@/features/dashboard/data';
import { dashboardQueryKey } from '@/features/dashboard/query-key';
import { UpcomingPaymentCell } from '@/features/dashboard/upcoming-payment-cell';
import {
  appointmentsDelta,
  type MetricDelta,
} from '@/features/dashboard/format';

interface Metric {
  key: string;
  label: string;
  hint: string;
  value: string;
  delta?: MetricDelta;
  icon: LucideIcon;
}

const upcomingFormatter = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Map the stats DTO to the four headline cards. */
function toMetrics(stats: DashboardStatsDto): Metric[] {
  return [
    {
      key: 'appointments',
      label: ro.dashboard.metricAppointments,
      hint: ro.dashboard.metricAppointmentsHint,
      value: String(stats.appointments.total),
      delta: appointmentsDelta(
        stats.appointments.total,
        stats.appointments.previousTotal,
      ),
      icon: CalendarCheck,
    },
    {
      key: 'pendingPayments',
      label: ro.dashboard.metricPendingPayments,
      hint: ro.dashboard.metricPendingPaymentsHint,
      value: String(stats.pendingPayments),
      icon: CreditCard,
    },
    {
      key: 'subscriptions',
      label: ro.dashboard.metricSubscriptions,
      hint: ro.dashboard.metricSubscriptionsHint,
      value: String(stats.subscriptions.active),
      icon: Repeat2,
    },
    {
      key: 'quickQuestions',
      label: ro.dashboard.metricQuickQuestions,
      hint: ro.dashboard.metricQuickQuestionsHint,
      value: String(stats.quickQuestions.open),
      icon: MessagesSquare,
    },
  ];
}

function StatCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return (
    <Card className="gap-0 py-5">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="size-[18px]" strokeWidth={2} />
          </span>
          {metric.delta && (
            <Badge
              variant={
                metric.delta.trend === 'up'
                  ? 'success'
                  : metric.delta.trend === 'down'
                    ? 'destructive'
                    : 'muted'
              }
            >
              {metric.delta.value}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {metric.value}
          </p>
          <p className="text-sm font-medium">{metric.label}</p>
          <p className="text-xs text-muted-foreground">{metric.hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="gap-0 py-5">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-5 w-10 rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingRow({
  item,
  first,
}: {
  item: DashboardUpcomingItem;
  first: boolean;
}) {
  const serviceLabel =
    (ro.appointments.service as Record<string, string>)[item.serviceCode] ??
    item.serviceCode;
  return (
    <div className={cn('flex items-center gap-3', !first && 'border-t pt-3')}>
      <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
        <CalendarClock className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.clientName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {serviceLabel} · {upcomingFormatter.format(new Date(item.startTime))}
        </p>
      </div>
      <UpcomingPaymentCell
        status={item.paymentStatus}
        serviceCode={item.serviceCode}
      />
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardStats,
  });

  const metrics = data ? toMetrics(data) : [];
  // Absent, not empty: the API sends this list to an admin only, and an editor
  // must not read "Nicio programare apropiată" off a list nobody sent her.
  const upcoming = data?.upcoming;

  return (
    <div className="space-y-6">
      <PageHeader
        title={ro.dashboard.title}
        subtitle={ro.dashboard.subtitle}
        actions={
          <Badge variant="muted" className="h-7 px-3">
            {ro.dashboard.period}
          </Badge>
        }
      />

      {isError ? (
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={AlertTriangle}
              title={ro.dashboard.loadError}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw
                    className={cn('size-4', isFetching && 'animate-spin')}
                  />
                  {ro.dashboard.retry}
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))
              : metrics.map((m) => <StatCard key={m.key} metric={m} />)}
          </div>

          {/* One card, full width: the "Activitate" panel that used to take the
              third column had no feed behind it and rendered its empty state
              on every load. */}
          {(isLoading || upcoming) && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {ro.dashboard.upcomingTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <TableRowsSkeleton rows={4} />
                  ) : upcoming?.length === 0 ? (
                    <EmptyState
                      icon={CalendarClock}
                      title={ro.dashboard.upcomingEmpty}
                      className="py-10"
                    />
                  ) : (
                    <div className="space-y-3">
                      {upcoming?.map((item, i) => (
                        <UpcomingRow
                          key={item.id}
                          item={item}
                          first={i === 0}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TableRowsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn('flex items-center gap-3', i > 0 && 'border-t pt-3')}
        >
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}
