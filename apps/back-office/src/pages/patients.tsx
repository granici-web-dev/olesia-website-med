import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  Stethoscope,
} from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
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
import { ro } from '@/i18n/ro';
import { cn } from '@/lib/utils';
import { patientDetailPath } from '@/config/routes';

import { ConsentBadge } from '@/features/patients/badges';
import { PatientFormSheet } from '@/features/patients/patient-form-sheet';
import { fetchPatients, formatDate, ageYears } from '@/features/patients/data';
import { patientsQueryKey } from '@/features/patients/query-key';
import type { PatientDto } from '@/features/patients/types';

const t = ro.patients;

export function PatientsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: patientsQueryKey,
    queryFn: () => fetchPatients(),
  });

  const [search, setSearch] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);

  const patients = React.useMemo(() => data ?? [], [data]);

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q),
    );
  }, [patients, search]);

  const open = (id: string) => navigate(patientDetailPath(id));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn(isFetching && 'animate-spin')} />
              {t.refresh}
            </Button>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus />
              {t.addPatient}
            </Button>
          </>
        }
      />

      <label className="relative flex max-w-sm items-center">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.filters.searchPlaceholder}
          aria-label={t.filters.searchPlaceholder}
          className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm shadow-xs outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
        />
      </label>

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
          <PatientsTableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={search ? SearchX : Stethoscope}
            title={search ? t.empty.filteredTitle : t.empty.title}
            description={search ? t.empty.filteredBody : t.empty.body}
            className="py-16"
            action={
              search ? (
                <Button variant="outline" onClick={() => setSearch('')}>
                  {t.filters.reset}
                </Button>
              ) : (
                <Button onClick={() => setFormOpen(true)}>
                  <Plus />
                  {t.addPatient}
                </Button>
              )
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.columns.patient}</TableHead>
                <TableHead>{t.columns.contact}</TableHead>
                <TableHead>{t.columns.lastInteraction}</TableHead>
                <TableHead className="text-right">{t.columns.entries}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((p) => (
                <PatientRow key={p.id} patient={p} onOpen={() => open(p.id)} />
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <PatientFormSheet
        patient={null}
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={(created) => open(created.id)}
      />
    </div>
  );
}

function PatientRow({
  patient: p,
  onOpen,
}: {
  patient: PatientDto;
  onOpen: () => void;
}) {
  const age = ageYears(p.birthDate);
  return (
    <TableRow onClick={onOpen} className="cursor-pointer">
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="min-w-0">
            <div className="font-medium">{p.fullName}</div>
            {age !== null && (
              <div className="text-xs text-muted-foreground">
                {age} {t.detail.age}
              </div>
            )}
          </div>
          {!p.consentAt && <ConsentBadge consentAt={null} />}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{p.email}</div>
        {p.phone && (
          <div className="text-xs text-muted-foreground tabular-nums">
            {p.phone}
          </div>
        )}
      </TableCell>
      <TableCell>
        {p.lastInteractionAt ? (
          <span className="text-sm tabular-nums">
            {formatDate(p.lastInteractionAt)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {t.list.noInteraction}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {p.entryCount ?? 0}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label={p.fullName}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <ChevronRight className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function PatientsTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-8" />
        </div>
      ))}
    </div>
  );
}
