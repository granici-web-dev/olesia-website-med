import { useQuery } from '@tanstack/react-query';
import {
  CalendarCheck,
  CreditCard,
  Repeat2,
  MessagesSquare,
  CalendarClock,
  Activity,
  AlertTriangle,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardStatsDto } from '@olesia/shared';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';
import { fetchDashboardStats } from '@/features/dashboard/data';
import { dashboardQueryKey } from '@/features/dashboard/query-key';
import { PaymentBadge } from '@/features/appointments/status-badges';

interface Metric {
  key: string;
  label: string;
  hint: string;
  value: string;
  delta?: { value: string; trend: 'up' | 'down' | 'flat' };
  icon: LucideIcon;
}

const upcomingFormatter = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Period-over-period delta for the appointments headline. */
function appointmentsDelta(total: number, previous: number): Metric['delta'] {
  if (previous === 0) {
    return total === 0
      ? { value: '0', trend: 'flat' }
      : { value: `+${total}`, trend: 'up' };
  }
  const pct = Math.round(((total - previous) / previous) * 100);
  return {
    value: `${pct > 0 ? '+' : ''}${pct}%`,
    trend: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
  };
}

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
  item: DashboardStatsDto['upcoming'][number];
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
      <PaymentBadge status={item.paymentStatus} />
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardStats,
  });

  const metrics = data ? toMetrics(data) : [];
  const upcoming = data?.upcoming ?? [];

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

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  {ro.dashboard.upcomingTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <TableRowsSkeleton rows={4} />
                ) : upcoming.length === 0 ? (
                  <EmptyState
                    icon={CalendarClock}
                    title={ro.dashboard.upcomingEmpty}
                    className="py-10"
                  />
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((item, i) => (
                      <UpcomingRow key={item.id} item={item} first={i === 0} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {ro.dashboard.activityTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <TableRowsSkeleton rows={4} />
                ) : (
                  <EmptyState
                    icon={Activity}
                    title={ro.dashboard.activityEmpty}
                    className="py-10"
                  />
                )}
              </CardContent>
            </Card>
          </div>
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
