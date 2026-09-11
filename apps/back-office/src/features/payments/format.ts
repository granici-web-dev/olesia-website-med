import type { VariantProps } from 'class-variance-authority';

import { formatAmount, formatDateTime } from '@/lib/format';
import { ro } from '@/i18n/ro';
import type { badgeVariants } from '@/components/ui/badge';
import type { Payment, PaymentState } from '@/features/payments/types';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

/**
 * Colour is information here, so the vocabulary is deliberately narrow:
 * money arrived (success), money is in flight (warning), money went back
 * (info), nothing happened (muted). Only an outright failure is destructive —
 * an expired or abandoned checkout is a non-event, not an error, and painting
 * it red would make the ledger look alarming on an ordinary day.
 */
export const stateBadgeVariant: Record<PaymentState, BadgeVariant> = {
  created: 'muted',
  pending: 'warning',
  paid: 'success',
  failed: 'destructive',
  expired: 'muted',
  abandoned: 'muted',
  cancelled: 'muted',
  refunded: 'info',
  partially_refunded: 'info',
};

/**
 * The receipt as plain text, so it can be pasted into whatever the doctor uses
 * to write to a client today. Same four facts as the email template in
 * `apps/api/src/app/mail/patient-templates.ts`: the order reference, what was
 * bought, how much and when.
 */
export function confirmationText(p: Payment): string {
  return [
    `Confirmarea plății — comanda ${p.orderId}`,
    '',
    `Comanda: ${p.orderId}`,
    `Serviciu: ${ro.payments.target[p.targetType]}`,
    `Sumă: ${formatAmount(p.amount, p.currency)}`,
    `Data plății: ${formatDateTime(p.paidAt ?? p.createdAt)}`,
  ].join('\n');
}

/**
 * What the doctor typed into the manual-payment field, as money.
 *
 * A Romanian keyboard puts a comma on the decimal key, so "1200,50" is what
 * gets typed without thinking about it. Rounded to the cent because this is
 * written into the ledger: "10,005" used to reach the API as 10.005 and sit
 * there as a sum no receipt could ever state.
 *
 * Null for anything that is not a positive amount.
 */
export function parseManualAmount(input: string): number | null {
  const value = Number(input.replace(',', '.').trim());
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}
