import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/** Video-call quota indicator: consumption bar + used/total count. */
export function QuotaBar({
  used,
  total,
  className,
}: {
  used: number;
  total: number;
  className?: string;
}) {
  const remaining = Math.max(0, total - used);
  const percent = total > 0 ? (used / total) * 100 : 0;

  const indicator =
    remaining === 0
      ? 'bg-muted-foreground/45'
      : remaining <= 1
        ? 'bg-warning'
        : 'bg-primary';

  return (
    <div className={cn('w-32 space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium tabular-nums">
          {used}/{total}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {remaining} rămase
        </span>
      </div>
      <Progress value={percent} indicatorClassName={indicator} />
    </div>
  );
}
