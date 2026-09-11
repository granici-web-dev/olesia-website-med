import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

import {
  fetchWorkingHours,
  saveWorkingHours,
} from '@/features/working-hours/api';
import { workingHoursQueryKey } from '@/features/working-hours/query-key';
import type { WorkingDay } from '@/features/working-hours/types';

const t = ro.workingHours;

const WEEKDAYS: { weekday: number; label: string }[] = [
  { weekday: 1, label: t.weekdays.mon },
  { weekday: 2, label: t.weekdays.tue },
  { weekday: 3, label: t.weekdays.wed },
  { weekday: 4, label: t.weekdays.thu },
  { weekday: 5, label: t.weekdays.fri },
  { weekday: 6, label: t.weekdays.sat },
  { weekday: 7, label: t.weekdays.sun },
];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * "Program de lucru" — the schedule the EXPRESS deadline is counted against.
 *
 * This page is not cosmetic: every ticket's countdown is computed from these
 * hours at the moment a question arrives (§11.5). That is why it warns while
 * the schedule is still a placeholder, and why saving is blocked on a
 * malformed time rather than letting "9" through and producing silent nonsense.
 */
export function WorkingHoursPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: workingHoursQueryKey,
    queryFn: fetchWorkingHours,
  });

  const [days, setDays] = React.useState<WorkingDay[] | null>(null);
  const [sla, setSla] = React.useState('');
  const [timezone, setTimezone] = React.useState('');

  // Seed the form once the server value arrives, and re-seed after a save.
  React.useEffect(() => {
    if (!data) return;
    setDays(data.days.map((d) => ({ ...d })));
    setSla(String(data.expressSlaMinutes));
    setTimezone(data.timezone);
  }, [data]);

  const save = useMutation({
    mutationFn: saveWorkingHours,
    onSuccess: (saved) => {
      toast.success(t.toast.saved);
      queryClient.setQueryData(workingHoursQueryKey, saved);
    },
    onError: () => toast.error(t.toast.error),
  });

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={t.title} subtitle={t.subtitle} />
        <Card className="overflow-hidden py-0">
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
        </Card>
      </div>
    );
  }

  if (isLoading || !days || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title={t.title} subtitle={t.subtitle} />
        <Card className="space-y-3 p-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </Card>
      </div>
    );
  }

  const setDay = (weekday: number, patch: Partial<WorkingDay>) =>
    setDays((prev) =>
      (prev ?? []).map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)),
    );

  const badTime = (d: WorkingDay) =>
    !d.closed && (!TIME_RE.test(d.opensAt) || !TIME_RE.test(d.closesAt));
  const badOrder = (d: WorkingDay) =>
    !d.closed &&
    TIME_RE.test(d.opensAt) &&
    TIME_RE.test(d.closesAt) &&
    d.closesAt <= d.opensAt;

  const slaNumber = Number(sla);
  const slaInvalid =
    !Number.isFinite(slaNumber) || slaNumber < 5 || slaNumber > 60 * 24 * 7;
  const anyInvalid = days.some((d) => badTime(d) || badOrder(d)) || slaInvalid;
  const allClosed = days.every((d) => d.closed);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <Button
            size="sm"
            disabled={save.isPending || anyInvalid}
            onClick={() =>
              save.mutate({
                timezone: timezone.trim() || data.timezone,
                days,
                expressSlaMinutes: slaNumber,
              })
            }
          >
            {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {t.actions.save}
          </Button>
        }
      />

      {data.isPlaceholder && (
        <Card className="flex items-start gap-3 border-warning/40 bg-warning/10 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
          <p className="text-sm text-pretty">{t.placeholderWarning}</p>
        </Card>
      )}

      {allClosed && (
        <Card className="flex items-start gap-3 border-destructive/40 bg-destructive/10 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-sm text-pretty">{t.allClosedWarning}</p>
        </Card>
      )}

      <Card className="p-6">
        <p className="text-sm font-semibold">{t.scheduleTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          {t.scheduleHint}
        </p>

        <div className="mt-5 space-y-3">
          {WEEKDAYS.map(({ weekday, label }) => {
            const day = days.find((d) => d.weekday === weekday);
            if (!day) return null;
            const invalid = badTime(day) || badOrder(day);
            return (
              <div
                key={weekday}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-3 last:border-b-0 last:pb-0"
              >
                <span className="w-24 text-sm font-medium">{label}</span>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={!day.closed}
                    onCheckedChange={(on) => setDay(weekday, { closed: !on })}
                  />
                  {day.closed ? t.closed : t.open}
                </label>

                {!day.closed && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={day.opensAt}
                      aria-label={`${label} — ${t.opensAt}`}
                      aria-invalid={invalid}
                      className={cn('w-32', invalid && 'border-destructive')}
                      onChange={(e) =>
                        setDay(weekday, { opensAt: e.target.value })
                      }
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="time"
                      value={day.closesAt}
                      aria-label={`${label} — ${t.closesAt}`}
                      aria-invalid={invalid}
                      className={cn('w-32', invalid && 'border-destructive')}
                      onChange={(e) =>
                        setDay(weekday, { closesAt: e.target.value })
                      }
                    />
                  </div>
                )}

                {badOrder(day) && (
                  <span className="text-xs font-medium text-destructive">
                    {t.badOrder}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <Separator className="my-6" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sla">{t.slaLabel}</Label>
            <Input
              id="sla"
              inputMode="numeric"
              value={sla}
              aria-invalid={slaInvalid}
              className={cn(slaInvalid && 'border-destructive')}
              onChange={(e) => setSla(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-pretty">
              {t.slaHint}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tz">{t.timezoneLabel}</Label>
            <Input
              id="tz"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-pretty">
              {t.timezoneHint}
            </p>
          </div>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        {isFetching ? ro.common.loading : t.affectsNewOnly}
      </p>
    </div>
  );
}
