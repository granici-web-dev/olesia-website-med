/** Public data module for messages — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/messages/mock';
import * as remote from '@/features/messages/api';

// The inbox lists this week's mail, so the year is noise in every row.
export { formatShortDateTime as formatDateTime } from '@/lib/format';
export { statusBadgeVariant, bucketOf } from '@/features/messages/format';

export const fetchMessages = USE_MOCKS
  ? mock.fetchMessages
  : remote.fetchMessages;
export const markRead = USE_MOCKS ? mock.markRead : remote.markRead;
export const deleteMessage = USE_MOCKS
  ? mock.deleteMessage
  : remote.deleteMessage;
