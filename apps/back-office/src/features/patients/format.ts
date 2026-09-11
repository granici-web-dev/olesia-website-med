import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/components/ui/badge';
import type { EntryType } from '@/features/patients/types';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

/** Whole-year age from a birth date, or null when unset. */
export function ageYears(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) years -= 1;
  return years >= 0 ? years : null;
}

export const entryTypeBadgeVariant: Record<EntryType, BadgeVariant> = {
  anamnesis: 'info',
  note: 'muted',
  prescription: 'success',
  document: 'secondary',
};

export const consentBadgeVariant = {
  given: 'success',
  missing: 'warning',
} satisfies Record<string, BadgeVariant>;
