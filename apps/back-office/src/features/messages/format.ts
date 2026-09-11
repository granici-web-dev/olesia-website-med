import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/components/ui/badge';
import type {
  Message,
  MessageStatus,
  StatusFilter,
} from '@/features/messages/types';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const statusBadgeVariant: Record<MessageStatus, BadgeVariant> = {
  new: 'info',
  read: 'secondary',
  replied: 'success',
};

/** Tab bucket: `new` is unread; `read` and `replied` are both "seen". */
export function bucketOf(message: Message): Exclude<StatusFilter, 'all'> {
  return message.status === 'new' ? 'new' : 'read';
}
