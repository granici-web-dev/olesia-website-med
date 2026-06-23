import { Check, CheckCircle2, ChevronDown, Clock, Loader2 } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';

import { Badge, type badgeVariants } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

/**
 * Inline payment-status switcher for list rows. Payments happen offline, so the
 * status is set by hand: the badge doubles as a dropdown trigger that flips the
 * status without opening the detail sheet. Lives inside clickable table rows,
 * so it stops click propagation to avoid also opening the row.
 */

export type PaymentStatusValue = 'pending' | 'confirmed';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

const VARIANT: Record<PaymentStatusValue, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
};
const ICON = { pending: Clock, confirmed: CheckCircle2 } as const;
const ORDER: PaymentStatusValue[] = ['pending', 'confirmed'];

export function PaymentStatusMenu({
  status,
  onChange,
  pending = false,
  disabled = false,
  align = 'start',
}: {
  status: PaymentStatusValue;
  onChange: (next: PaymentStatusValue) => void;
  pending?: boolean;
  disabled?: boolean;
  align?: 'start' | 'end';
}) {
  const t = ro.payment;
  const Icon = ICON[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || pending}
          onClick={(e) => e.stopPropagation()}
          aria-label={t.change}
          className="cursor-pointer rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Badge
            variant={VARIANT[status]}
            className="gap-1 transition-[filter] hover:brightness-95"
          >
            {pending ? <Loader2 className="animate-spin" /> : <Icon />}
            {t[status]}
            <ChevronDown className="size-3 opacity-60" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-44"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel>{t.change}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ORDER.map((s) => {
          const ItemIcon = ICON[s];
          const active = s === status;
          return (
            <DropdownMenuItem
              key={s}
              onSelect={() => {
                if (!active) onChange(s);
              }}
              className={cn('justify-between gap-2', active && 'font-medium')}
            >
              <span className="flex items-center gap-2">
                <ItemIcon className="size-4 text-muted-foreground" />
                {t[s]}
              </span>
              {active && <Check className="size-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
