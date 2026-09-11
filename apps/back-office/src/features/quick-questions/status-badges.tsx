import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type { TicketBucket } from '@/features/quick-questions/types';
import { bucketBadgeVariant } from '@/features/quick-questions/format';

export function StatusBadge({ bucket }: { bucket: TicketBucket }) {
  return (
    <Badge variant={bucketBadgeVariant[bucket]}>
      {ro.quickQuestions.status[bucket]}
    </Badge>
  );
}
