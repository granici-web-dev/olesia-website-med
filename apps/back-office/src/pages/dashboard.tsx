import * as React from 'react';
import {
  CalendarCheck,
  CreditCard,
  Repeat2,
  MessagesSquare,
  CalendarClock,
  Activity,
  type LucideIcon,
} from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

interface Metric {
  key: string;
  label: string;
  hint: string;
  value: string;
  delta?: { value: string; trend: 'up' | 'down' | 'flat' };
  icon: LucideIcon;
}

/**
 * Demo metrics. Placeholder until the `dashboard` module is wired
 * (GET /dashboard/stats?from=&to=). Shape lets new metrics drop in
 * without reworking the layout. See module_calendly.md §11.
 */
const METRICS: Metric[] = [
  {
    key: 'appointments',
    label: ro.dashboard.metricAppointments,
    hint: ro.dashboard.metricAppointmentsHint,
    value: '24',
    delta: { value: '+12%', trend: 'up' },
    icon: CalendarCheck,
  },
  {
    key: 'pendingPayments',
    label: ro.dashboard.metricPendingPayments,
    hint: ro.dashboard.metricPendingPaymentsHint,
    value: '5',
    delta: { value: '+2', trend: 'up' },
    icon: CreditCard,
  },
  {
    key: 'subscriptions',
    label: ro.dashboard.metricSubscriptions,
    hint: ro.dashboard.metricSubscriptionsHint,
    value: '11',
    delta: { value: '0', trend: 'flat' },
    icon: Repeat2,
  },
  {
    key: 'quickQuestions',
    label: ro.dashboard.metricQuickQuestions,
    hint: ro.dashboard.metricQuickQuestionsHint,
    value: '3',
    delta: { value: '−1', trend: 'down' },
    icon: MessagesSquare,
  },
];

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

export function DashboardPage() {
  // Simulates the stats fetch so loading (skeleton) states are exercised.
  // TODO(api): replace with a TanStack Query call to /dashboard/stats.
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const id = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(id);
  }, []);

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? METRICS.map((m) => <StatCardSkeleton key={m.key} />)
          : METRICS.map((m) => <StatCard key={m.key} metric={m} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {ro.dashboard.upcomingTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableRowsSkeleton rows={4} />
            ) : (
              <EmptyState
                icon={CalendarClock}
                title={ro.dashboard.upcomingEmpty}
                className="py-10"
              />
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
            {loading ? (
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
    </div>
  );
}

function TableRowsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-3',
            i > 0 && 'border-t pt-3',
          )}
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
