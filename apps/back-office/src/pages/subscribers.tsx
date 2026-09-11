import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Mails, RefreshCw, Search, SearchX } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

import { fetchSubscribers, formatConsentDate } from '@/features/subscribers/data';
import { subscribersQueryKey } from '@/features/subscribers/query-key';

const t = ro.subscribers;

/**
 * "Abonați" — the newsletter list, read-only.
 *
 * Read-only on purpose: every row arrives from the public site, and there is
 * no export button. A list of addresses is the easiest thing in this panel to
 * copy somewhere it should not go, and nobody has asked for a spreadsheet.
 */
export function SubscribersPage() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: subscribersQueryKey,
    queryFn: fetchSubscribers,
  });

  const [search, setSearch] = React.useState('');

  const subscribers = React.useMemo(() => data ?? [], [data]);

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, search]);

  const searching = search !== '';

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

      <p className="max-w-prose text-sm text-muted-foreground text-pretty">
        {t.note}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm tabular-nums text-muted-foreground">
          {t.count(visible.length)}
        </p>

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
          <SubscribersTableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={searching ? SearchX : Mails}
            title={searching ? t.empty.filteredTitle : t.empty.title}
            description={searching ? t.empty.filteredBody : t.empty.body}
            className="py-16"
            action={
              searching ? (
                <Button variant="outline" onClick={() => setSearch('')}>
                  {t.filters.reset}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.columns.email}</TableHead>
                <TableHead>{t.columns.source}</TableHead>
                <TableHead>{t.columns.language}</TableHead>
                <TableHead>{t.columns.consent}</TableHead>
                <TableHead>{t.columns.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((s) => (
                <TableRow key={s.id} className="hover:bg-transparent">
                  <TableCell className="font-medium">{s.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.source[s.source]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.language[s.locale]}
                  </TableCell>
                  <TableCell className="tabular-nums whitespace-nowrap text-muted-foreground">
                    {formatConsentDate(s.consentAt)}
                  </TableCell>
                  <TableCell>
                    {s.unsubscribedAt ? (
                      <Badge variant="muted">{t.status.unsubscribed}</Badge>
                    ) : (
                      <Badge variant="success">{t.status.active}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function SubscribersTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <Skeleton className="h-3.5 w-56" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}
