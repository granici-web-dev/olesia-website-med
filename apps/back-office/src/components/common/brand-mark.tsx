import { Sprout } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

/** Olesia wordmark + sprout glyph. `compact` drops the text for collapsed rails. */
export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs">
        <Sprout className="size-[18px]" strokeWidth={2.25} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {ro.app.name}
          </span>
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">
            {ro.app.tagline}
          </span>
        </span>
      )}
    </span>
  );
}
