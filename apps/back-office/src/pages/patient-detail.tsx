import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  FileText,
  Loader2,
  Mail,
  MessagesSquare,
  Phone,
  Pencil,
  Pill,
  Plus,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PatientPayments } from '@/features/payments/patient-payments';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ro } from '@/i18n/ro';
import { paths } from '@/config/routes';

import { ConsentLine, EntryCard, InteractionItem, Timeline } from '@/features/patients/timeline';
import { PatientFormSheet } from '@/features/patients/patient-form-sheet';
import { EntryFormSheet } from '@/features/patients/entry-form-sheet';
import { DocumentUploadSheet } from '@/features/patients/document-upload-sheet';
import {
  fetchPatient,
  fetchTimeline,
  deletePatient,
  deleteEntry,
  setConsent,
  downloadDocument,
  formatDate,
  ageYears,
} from '@/features/patients/data';
import {
  patientsQueryKey,
  patientQueryKey,
  patientTimelineQueryKey,
} from '@/features/patients/query-key';
import type {
  PatientDto,
  PatientEntryDto,
} from '@/features/patients/types';

const t = ro.patients;

type EditableType = 'anamnesis' | 'note' | 'prescription';

export function PatientDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const patientQuery = useQuery({
    queryKey: patientQueryKey(id),
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });
  const timelineQuery = useQuery({
    queryKey: patientTimelineQueryKey(id),
    queryFn: () => fetchTimeline(id),
    enabled: !!id,
  });

  const [editOpen, setEditOpen] = React.useState(false);
  const [docOpen, setDocOpen] = React.useState(false);
  const [entrySheet, setEntrySheet] = React.useState<{
    entry: PatientEntryDto | null;
    defaultType: EditableType;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<PatientEntryDto | null>(
    null,
  );
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: patientQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: patientTimelineQueryKey(id) });
  };

  const consentMutation = useMutation({
    mutationFn: () => setConsent(id),
    onSuccess: () => {
      toast.success(t.toast.consentRecorded);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const deletePatientMutation = useMutation({
    mutationFn: () => deletePatient(id),
    onSuccess: () => {
      toast.success(t.toast.deleted);
      queryClient.invalidateQueries({ queryKey: patientsQueryKey });
      navigate(paths.patients);
    },
    onError: () => toast.error(t.toast.error),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => deleteEntry(id, entryId),
    onSuccess: () => {
      toast.success(t.toast.entryDeleted);
      setPendingDelete(null);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const handleDownload = async (entry: PatientEntryDto) => {
    setDownloadingId(entry.id);
    try {
      await downloadDocument(id, entry);
      toast.success(t.toast.downloadStarted);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(
        msg.startsWith('mock_no_file')
          ? t.toast.mockNoFile
          : t.toast.downloadFailed,
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const openAddEntry = (defaultType: EditableType) =>
    setEntrySheet({ entry: null, defaultType });
  const openEditEntry = (entry: PatientEntryDto) =>
    setEntrySheet({
      entry,
      defaultType: (entry.type === 'document' ? 'note' : entry.type) as EditableType,
    });

  if (patientQuery.isError) {
    return (
      <div className="space-y-6">
        <BackLink onClick={() => navigate(paths.patients)} />
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title={t.detail.notFoundTitle}
            description={t.detail.notFoundBody}
            className="py-16"
            action={
              <Button variant="outline" onClick={() => navigate(paths.patients)}>
                <ArrowLeft />
                {t.backToList}
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const patient = patientQuery.data;
  const timeline = timelineQuery.data;
  const entries = timeline?.entries ?? [];
  const interactions = timeline?.interactions ?? [];
  const anamneses = entries.filter((e) => e.type === 'anamnesis');
  const prescriptions = entries.filter((e) => e.type === 'prescription');
  const documents = entries.filter((e) => e.type === 'document');

  return (
    <div className="space-y-6">
      <BackLink onClick={() => navigate(paths.patients)} />

      {!patient ? (
        <PatientHeaderSkeleton />
      ) : (
        <>
          <PageHeader
            title={patient.fullName}
            subtitle={patient.email}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil />
                  {t.detail.edit}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 />
                      {t.detail.delete}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.confirm.deleteTitle}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.confirm.deleteBody}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{ro.common.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deletePatientMutation.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t.confirm.deleteCta}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            }
          />

          <PatientSummary
            patient={patient}
            onRecordConsent={() => consentMutation.mutate()}
            consentPending={consentMutation.isPending}
          />

          <Tabs defaultValue="history">
            <TabsList className="h-9 w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile">{t.tabs.profile}</TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5">
                {t.tabs.history}
                <Count n={entries.length + interactions.length} />
              </TabsTrigger>
              <TabsTrigger value="anamnesis" className="gap-1.5">
                {t.tabs.anamnesis}
                <Count n={anamneses.length} />
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="gap-1.5">
                {t.tabs.prescriptions}
                <Count n={prescriptions.length} />
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-1.5">
                {t.tabs.documents}
                <Count n={documents.length} />
              </TabsTrigger>
              <TabsTrigger value="interactions" className="gap-1.5">
                {t.tabs.interactions}
                <Count n={interactions.length} />
              </TabsTrigger>
            </TabsList>

            {/* Profil */}
            <TabsContent value="profile" className="mt-5">
              <ProfileTab patient={patient} />
            </TabsContent>

            {/* Istoric — merged timeline */}
            <TabsContent value="history" className="mt-5 space-y-4">
              <SectionActions
                label={t.timeline.title}
                action={
                  <Button size="sm" onClick={() => openAddEntry('anamnesis')}>
                    <Plus />
                    {t.timeline.addEntry}
                  </Button>
                }
              />
              {timelineQuery.isLoading ? (
                <TimelineSkeleton />
              ) : entries.length + interactions.length === 0 ? (
                <CardEmpty
                  icon={FileText}
                  title={t.timeline.empty}
                  body={t.timeline.emptyBody}
                />
              ) : (
                <Timeline
                  entries={entries}
                  interactions={interactions}
                  patientId={id}
                  onEdit={openEditEntry}
                  onDelete={setPendingDelete}
                  onDownload={handleDownload}
                  downloadingId={downloadingId}
                />
              )}
            </TabsContent>

            {/* Anamneză */}
            <TabsContent value="anamnesis" className="mt-5 space-y-4">
              <SectionActions
                label={t.tabs.anamnesis}
                action={
                  <Button size="sm" onClick={() => openAddEntry('anamnesis')}>
                    <Plus />
                    {t.anamnesis.add}
                  </Button>
                }
              />
              <EntryList
                entries={anamneses}
                loading={timelineQuery.isLoading}
                emptyIcon={FileText}
                emptyTitle={t.anamnesis.empty}
                emptyBody={t.anamnesis.emptyBody}
                onEdit={openEditEntry}
                onDelete={setPendingDelete}
              />
            </TabsContent>

            {/* Rețete */}
            <TabsContent value="prescriptions" className="mt-5 space-y-4">
              <SectionActions
                label={t.tabs.prescriptions}
                action={
                  <Button size="sm" onClick={() => openAddEntry('prescription')}>
                    <Plus />
                    {t.prescriptions.add}
                  </Button>
                }
              />
              <EntryList
                entries={prescriptions}
                loading={timelineQuery.isLoading}
                emptyIcon={Pill}
                emptyTitle={t.prescriptions.empty}
                emptyBody={t.prescriptions.emptyBody}
                onEdit={openEditEntry}
                onDelete={setPendingDelete}
              />
            </TabsContent>

            {/* Documente */}
            <TabsContent value="documents" className="mt-5 space-y-4">
              <SectionActions
                label={t.tabs.documents}
                hint={t.documents.private}
                action={
                  <Button size="sm" onClick={() => setDocOpen(true)}>
                    <UploadCloud />
                    {t.documents.upload}
                  </Button>
                }
              />
              {timelineQuery.isLoading ? (
                <EntryListSkeleton />
              ) : documents.length === 0 ? (
                <CardEmpty
                  icon={UploadCloud}
                  title={t.documents.empty}
                  body={t.documents.emptyBody}
                />
              ) : (
                <div className="space-y-3">
                  {documents.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={setPendingDelete}
                      onDownload={handleDownload}
                      downloading={downloadingId === entry.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Interacțiuni */}
            <TabsContent value="interactions" className="mt-5 space-y-4">
              <SectionActions label={t.tabs.interactions} />
              {timelineQuery.isLoading ? (
                <EntryListSkeleton />
              ) : interactions.length === 0 ? (
                <CardEmpty
                  icon={MessagesSquare}
                  title={t.interactions.empty}
                  body={t.interactions.emptyBody}
                />
              ) : (
                <div className="space-y-3">
                  {interactions.map((it, i) => (
                    <InteractionItem
                      key={`${it.source}-${it.sourceId}-${i}`}
                      interaction={it}
                      patientId={id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <PatientFormSheet
            patient={patient}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
          {entrySheet && (
            <EntryFormSheet
              patientId={id}
              entry={entrySheet.entry}
              defaultType={entrySheet.defaultType}
              open={!!entrySheet}
              onOpenChange={(o) => !o && setEntrySheet(null)}
            />
          )}
          <DocumentUploadSheet
            patientId={id}
            open={docOpen}
            onOpenChange={setDocOpen}
          />
        </>
      )}

      {/* Delete-entry confirmation (shared across tabs) */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirm.deleteEntryTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirm.deleteEntryBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ro.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingDelete && deleteEntryMutation.mutate(pendingDelete.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.confirm.deleteEntryCta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------ subviews ------------------------------ */

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
    >
      <ArrowLeft className="size-4" />
      {t.backToList}
    </button>
  );
}

function PatientSummary({
  patient,
  onRecordConsent,
  consentPending,
}: {
  patient: PatientDto;
  onRecordConsent: () => void;
  consentPending: boolean;
}) {
  const age = ageYears(patient.birthDate);
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <a
          href={`mailto:${patient.email}`}
          className="inline-flex items-center gap-1.5 text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          <Mail className="size-4 text-muted-foreground" />
          {patient.email}
        </a>
        {patient.phone && (
          <span className="inline-flex items-center gap-1.5">
            <Phone className="size-4 text-muted-foreground" />
            {patient.phone}
          </span>
        )}
        {age !== null && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 text-muted-foreground" />
            {age} {t.detail.age}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <ConsentLine consentAt={patient.consentAt} />
        {!patient.consentAt && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={consentPending}>
                {consentPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ShieldCheck />
                )}
                {t.consent.record}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.confirm.consentTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.confirm.consentBody}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{ro.common.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={onRecordConsent}>
                  {t.confirm.consentCta}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </Card>
  );
}

function ProfileTab({ patient }: { patient: PatientDto }) {
  const age = ageYears(patient.birthDate);
  return (
    <Card className="p-5">
      <dl className="divide-y">
        <Field label={t.detail.email}>
          <a
            href={`mailto:${patient.email}`}
            className="text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {patient.email}
          </a>
        </Field>
        <Field label={t.detail.phone}>
          {patient.phone || <Muted>{ro.common.none}</Muted>}
        </Field>
        <Field label={t.detail.birthDate}>
          {patient.birthDate ? (
            <>
              {formatDate(patient.birthDate)}
              {age !== null && (
                <span className="text-muted-foreground">
                  {' '}
                  · {age} {t.detail.age}
                </span>
              )}
            </>
          ) : (
            <Muted>{ro.common.none}</Muted>
          )}
        </Field>
        <Field label={t.detail.gender}>
          {patient.gender ? (
            t.gender[patient.gender as 'male' | 'female' | 'other']
          ) : (
            <Muted>{t.gender.unset}</Muted>
          )}
        </Field>
        <Field label={t.detail.createdAt}>
          {formatDate(patient.createdAt)}
        </Field>
      </dl>

      <Separator className="my-5" />

      <SectionTitle>{t.detail.notes}</SectionTitle>
      {patient.notes ? (
        <p className="mt-2 text-sm whitespace-pre-wrap text-foreground/90">
          {patient.notes}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{t.detail.noNotes}</p>
      )}

      <Separator className="my-5" />

      {/* What this person has actually paid, taken from the payments ledger
          rather than from the per-record `paymentStatus` flags — those say
          whether something was settled, not when or how much. */}
      <SectionTitle>{ro.payments.patientSection.title}</SectionTitle>
      <div className="mt-2">
        <PatientPayments patientId={patient.id} />
      </div>
    </Card>
  );
}

function EntryList({
  entries,
  loading,
  emptyIcon,
  emptyTitle,
  emptyBody,
  onEdit,
  onDelete,
}: {
  entries: PatientEntryDto[];
  loading: boolean;
  emptyIcon: React.ComponentProps<typeof EmptyState>['icon'];
  emptyTitle: string;
  emptyBody: string;
  onEdit: (entry: PatientEntryDto) => void;
  onDelete: (entry: PatientEntryDto) => void;
}) {
  if (loading) return <EntryListSkeleton />;
  if (entries.length === 0)
    return <CardEmpty icon={emptyIcon} title={emptyTitle} body={emptyBody} />;
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

/* ------------------------------ primitives ---------------------------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium break-words">{children}</dd>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span className="font-normal text-muted-foreground">{children}</span>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
      {children}
    </p>
  );
}

function SectionActions({
  label,
  hint,
  action,
}: {
  label: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold">{label}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="text-xs text-muted-foreground/70 tabular-nums">{n}</span>
  );
}

function CardEmpty({
  icon,
  title,
  body,
}: {
  icon: React.ComponentProps<typeof EmptyState>['icon'];
  title: string;
  body: string;
}) {
  return (
    <Card className="py-0">
      <EmptyState icon={icon} title={title} description={body} className="py-14" />
    </Card>
  );
}

function PatientHeaderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card className="p-5">
        <Skeleton className="h-5 w-full max-w-md" />
      </Card>
      <Skeleton className="h-9 w-full max-w-xl" />
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4 pl-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}

function EntryListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}
