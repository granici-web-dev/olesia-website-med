import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ro } from '@/i18n/ro';

/**
 * How much of a list is on screen, and how to reach the rest.
 *
 * Every table used to render whatever one request returned and say nothing
 * about the rest, so a list longer than the page simply ended. The count is
 * the point of this bar: "50 din 250" is the sentence that was missing.
 */
export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const shown = Math.min(pageSize, Math.max(0, total - (page - 1) * pageSize));

  if (total <= pageSize) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-xs text-muted-foreground tabular-nums">
        {ro.common.pageCount(shown, total)}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground tabular-nums">
          {ro.common.pageOf(page, lastPage)}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={ro.common.previousPage}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={ro.common.nextPage}
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
