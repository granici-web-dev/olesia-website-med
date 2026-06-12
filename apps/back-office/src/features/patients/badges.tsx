import {
  FileText,
  NotebookPen,
  Paperclip,
  Pill,
  ShieldCheck,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';

import {
  consentBadgeVariant,
  entryTypeBadgeVariant,
  paymentBadgeVariant,
} from '@/features/patients/mock';
import type { EntryType } from '@/features/patients/types';

const t = ro.patients;

/** Icon per medical-record entry type. */
export const entryTypeIcon: Record<EntryType, LucideIcon> = {
  anamnesis: FileText,
  note: NotebookPen,
  prescription: Pill,
  document: Paperclip,
};

/** GDPR consent state — recorded or missing. */
export function ConsentBadge({ consentAt }: { consentAt: string | null }) {
  const given = !!consentAt;
  const Icon = given ? ShieldCheck : ShieldAlert;
  return (
    <Badge variant={given ? consentBadgeVariant.given : consentBadgeVariant.missing}>
      <Icon />
      {given ? t.consent.given : t.consent.missing}
    </Badge>
  );
}

/** A medical-record entry type chip (label + icon). */
export function EntryTypeBadge({ type }: { type: EntryType }) {
  const Icon = entryTypeIcon[type];
  return (
    <Badge variant={entryTypeBadgeVariant[type]}>
      <Icon />
      {t.entryType[type]}
    </Badge>
  );
}

/** Payment state of a linked interaction. */
export function PaymentBadge({ status }: { status: string }) {
  return (
    <Badge variant={paymentBadgeVariant[status] ?? 'muted'}>
      {t.payment[status as 'pending' | 'confirmed'] ?? status}
    </Badge>
  );
}
