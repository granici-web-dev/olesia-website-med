/** Public data module for messages — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/messages/mock';
import * as remote from '@/features/messages/api';

// Re-export the pure presentation helpers (badge variants, formatters, bucket).
export {
  statusBadgeVariant,
  bucketOf,
  formatDateTime,
} from '@/features/messages/mock';

export const fetchMessages = USE_MOCKS
  ? mock.fetchMessages
  : remote.fetchMessages;
export const markRead = USE_MOCKS ? mock.markRead : remote.markRead;
export const deleteMessage = USE_MOCKS
  ? mock.deleteMessage
  : remote.deleteMessage;
