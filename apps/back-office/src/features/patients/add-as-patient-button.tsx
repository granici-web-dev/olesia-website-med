import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ro } from '@/i18n/ro';
import { patientDetailPath } from '@/config/routes';

import { fromLead } from '@/features/patients/data';
import { patientsQueryKey } from '@/features/patients/query-key';
import type { LeadSource } from '@/features/patients/types';

/**
 * "Adaugă ca pacient" — promotes a paid lead (appointment / subscription /
 * quick question) to a patient via `POST /patients/from-lead`, then opens the
 * created-or-linked dossier. Shown on a lead's detail sheet once paid.
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

  const mutation = useMutation({
    mutationFn: () => fromLead(source, sourceId),
    onSuccess: (patient) => {
      toast.success(ro.patients.toast.leadAdded);
      queryClient.invalidateQueries({ queryKey: patientsQueryKey });
      navigate(patientDetailPath(patient.id));
    },
    onError: () => toast.error(ro.patients.toast.error),
  });

  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={disabled || mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
      {mutation.isPending
        ? ro.patients.fromLead.adding
        : ro.patients.fromLead.action}
    </Button>
  );
}
