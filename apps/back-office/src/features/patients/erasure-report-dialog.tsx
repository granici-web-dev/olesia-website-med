import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ro } from '@/i18n/ro';

import type { PatientErasureReportDto } from '@/features/patients/types';

const t = ro.patients.erasure;

/**
 * What the erasure actually reached, table by table.
 *
 * Shown rather than summarised in a toast because the erasure covers rows the
 * doctor has no other way to see — the group-C order, the contact message,
 * the payment that was anonymized instead of deleted — and because Calendly
 * keeps its own copy, which somebody has to go and delete by hand
 * (audit A3, F1 and F6).
 */
export function ErasureReportDialog({
  report,
  onClose,
}: {
  report: PatientErasureReportDto | null;
  onClose: () => void;
}) {
  return (
    <AlertDialog
      open={report !== null}
      onOpenChange={(next) => !next && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.title}</AlertDialogTitle>
          <AlertDialogDescription>{t.subtitle}</AlertDialogDescription>
        </AlertDialogHeader>

        {report && (
          <>
            <ul className="max-h-64 divide-y overflow-y-auto rounded-md border text-sm">
              {report.tables.map((row) => (
                <li
                  key={row.table}
                  className="flex items-baseline gap-3 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {row.table}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.action[row.action]}
                  </span>
                  <span className="tabular-nums">
                    {row.rows} {t.rows}
                  </span>
                </li>
              ))}
            </ul>

            {report.manualSteps.length > 0 && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <AlertTriangle className="size-3.5" />
                  {t.manualTitle}
                </div>
                <ul className="mt-1.5 space-y-1 text-sm">
                  {report.manualSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>{t.close}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
