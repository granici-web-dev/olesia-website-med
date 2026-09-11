import { CircleDot, CheckCheck, MailOpen } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type { MessageStatus, MessageSubject } from '@/features/messages/types';
import { statusBadgeVariant } from '@/features/messages/format';

const STATUS_ICON = {
  new: CircleDot,
  read: MailOpen,
  replied: CheckCheck,
} as const;

export function StatusBadge({ status }: { status: MessageStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge variant={statusBadgeVariant[status]}>
      <Icon />
      {ro.messages.status[status]}
    </Badge>
  );
}

export function SubjectBadge({ subject }: { subject: MessageSubject }) {
  return <Badge variant="outline">{ro.messages.subjects[subject]}</Badge>;
}
