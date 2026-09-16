import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Locale } from '@olesia/shared';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError, NETWORK_ERROR_STATUS } from '@/api/http';
import { ro } from '@/i18n/ro';
import { formatDateTime } from '@/lib/format';

import { sendEntry } from '@/features/patients/api';
import { patientTimelineQueryKey } from '@/features/patients/query-key';
import type { PatientDto, PatientEntryDto } from '@/features/patients/types';

const t = ro.patients.send;

const LOCALES = [Locale.Ro, Locale.En, Locale.Ru];

const megabytes = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 1 });
const toMegabytes = (bytes: unknown) =>
  megabytes.format(Number(bytes) / (1024 * 1024));

/**
 * The API's refusal, in words the doctor can act on. A request that never got
 * an answer is its own case: the email may have left while the connection
 * dropped, and "try again" would send it twice.
 */
function refusalMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return t.errors.generic;
  if (error.status === NETWORK_ERROR_STATUS) return t.errors.unknownOutcome;
  const details = error.details as { sizeBytes?: unknown; maxBytes?: unknown };
  switch (error.message) {
    case 'mail_not_configured':
      return t.errors.mailNotConfigured;
    case 'attachment_too_large':
      return t.errors.tooLarge(
        toMegabytes(details.sizeBytes),
        toMegabytes(details.maxBytes),
      );
    case 'mail_send_failed':
      return t.errors.transportFailed;
    case 'entry_empty':
      return t.errors.empty;
    default:
      return t.errors.generic;
  }
}

/**
 * Confirms where a prescription or a document is about to go before it goes
 * (docs/shape-send-prescription.md). The address is shown, not editable: a
 * wrong one is corrected in the dossier, never typed here.
 */
export function SendEntryDialog({
  patient,
  entry,
  onClose,
}: {
  patient: PatientDto;
  entry: PatientEntryDto | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [locale, setLocale] = React.useState<Locale>(Locale.Ro);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!entry) return;
    setLocale(patient.lastKnownLocale ?? Locale.Ro);
    setError(null);
  }, [entry, patient.lastKnownLocale]);

  const mutation = useMutation({
    mutationFn: (target: PatientEntryDto) =>
      sendEntry(patient.id, target.id, locale),
    onSuccess: () => {
      toast.success(t.sent);
      queryClient.invalidateQueries({
        queryKey: patientTimelineQueryKey(patient.id),
      });
      onClose();
    },
    onError: (failure) => {
      setError(refusalMessage(failure));
      if (
        failure instanceof ApiError &&
        failure.status === NETWORK_ERROR_STATUS
      ) {
        queryClient.invalidateQueries({
          queryKey: patientTimelineQueryKey(patient.id),
        });
      }
    },
  });

  const lastSend = entry?.sends[0];
  const isDocument = entry?.type === 'document';

  return (
    <AlertDialog
      open={entry !== null}
      onOpenChange={(open) => !open && !mutation.isPending && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {isDocument ? t.documentBody : t.prescriptionBody}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {entry && (
          <dl className="space-y-4 text-sm">
            <div className="space-y-1">
              <dt className="text-muted-foreground">{t.recipient}</dt>
              <dd className="font-medium break-all">{patient.email}</dd>
              <dd className="text-xs text-muted-foreground">
                {t.recipientHint}
              </dd>
            </div>

            <div className="space-y-1.5">
              <dt>
                <label htmlFor="send-locale" className="text-muted-foreground">
                  {t.language}
                </label>
              </dt>
              <dd>
                <Select
                  value={locale}
                  onValueChange={(value) => setLocale(value as Locale)}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger id="send-locale" className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {t.locale[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </dd>
              {patient.lastKnownLocale == null && (
                <dd className="text-xs text-muted-foreground">
                  {t.languageUnknown}
                </dd>
              )}
            </div>

            {isDocument && entry.fileName && (
              <div className="space-y-1">
                <dt className="text-muted-foreground">{t.attachment}</dt>
                <dd className="truncate">{entry.fileName}</dd>
              </div>
            )}
          </dl>
        )}

        {lastSend && entry && (
          <p className="text-sm text-muted-foreground">
            {t.previous(entry.sends.length, formatDateTime(lastSend.sentAt))}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            {ro.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              if (entry) mutation.mutate(entry);
            }}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
            {mutation.isPending ? t.sending : lastSend ? t.ctaAgain : t.cta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
