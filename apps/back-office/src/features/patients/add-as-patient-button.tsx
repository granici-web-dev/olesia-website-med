import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import { ApiError } from '@/api/http';
import { ro } from '@/i18n/ro';
import { patientDetailPath } from '@/config/routes';

import { fromLead, linkLead } from '@/features/patients/api';
import { patientsQueryKey } from '@/features/patients/query-key';
import type {
  LeadSource,
  PatientLeadConflictDto,
} from '@/features/patients/types';

const t = ro.patients;

/** The 409 body, when the API says this address already has a dossier. */
function readConflict(err: unknown): PatientLeadConflictDto | null {
  if (!(err instanceof ApiError) || err.status !== 409) return null;
  const body = err.details as Partial<PatientLeadConflictDto> | undefined;
  if (body?.message !== 'patient_exists' || !body.patientId) return null;
  return {
    message: 'patient_exists',
    patientId: body.patientId,
    fullName: body.fullName ?? '',
  };
}

/**
 * "Adaugă ca pacient" — promotes a lead to a dossier.
 *
 * An address that already has one no longer merges silently: the API answers
 * 409 with the existing dossier and this asks which it is, because one email
 * is often a parent's and two children behind it are two medical records
 * (module_patients.md; audit A3, F4).
 */
export function AddAsPatientButton({
  source,
  sourceId,
  disabled,
}: {
  source: LeadSource;
  sourceId: string;
  disabled?: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [conflict, setConflict] = React.useState<PatientLeadConflictDto | null>(
    null,
  );

  const open = (patientId: string) => {
    queryClient.invalidateQueries({ queryKey: patientsQueryKey });
    navigate(patientDetailPath(patientId));
  };

  const create = useMutation({
    mutationFn: () => fromLead(source, sourceId),
    onSuccess: (patient) => {
      toast.success(t.toast.leadAdded);
      open(patient.id);
    },
    onError: (err) => {
      const existing = readConflict(err);
      if (existing) {
        setConflict(existing);
        return;
      }
      if (err instanceof ApiError && err.message === 'lead_without_email') {
        toast.error(t.fromLead.noEmail);
        return;
      }
      toast.error(t.toast.error);
    },
  });

  const link = useMutation({
    mutationFn: (patientId: string) => linkLead(patientId, source, sourceId),
    onSuccess: (patient) => {
      toast.success(t.toast.leadLinked);
      setConflict(null);
      open(patient.id);
    },
    onError: () => toast.error(t.toast.error),
  });

  const busy = create.isPending || link.isPending;

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        disabled={disabled || busy}
        onClick={() => create.mutate()}
      >
        {busy ? <Loader2 className="animate-spin" /> : <UserPlus />}
        {create.isPending ? t.fromLead.adding : t.fromLead.action}
      </Button>

      <AlertDialog
        open={conflict !== null}
        onOpenChange={(next) => !next && setConflict(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.fromLead.conflictTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.fromLead.conflictBody}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {conflict && (
            <div className="rounded-md border bg-muted/40 px-3 py-2.5 text-sm">
              <div className="text-xs text-muted-foreground">
                {t.fromLead.conflictExisting}
              </div>
              <div className="font-medium">{conflict.fullName}</div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={link.isPending}>
              {ro.common.cancel}
            </AlertDialogCancel>
            <Button
              variant="outline"
              disabled={link.isPending}
              onClick={() => conflict && open(conflict.patientId)}
            >
              {t.fromLead.conflictOpen}
            </Button>
            <AlertDialogAction
              disabled={link.isPending}
              onClick={(e) => {
                // Keep the dialog up until the link actually lands.
                e.preventDefault();
                if (conflict) link.mutate(conflict.patientId);
              }}
            >
              {link.isPending
                ? t.fromLead.conflictLinking
                : t.fromLead.conflictLink}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
