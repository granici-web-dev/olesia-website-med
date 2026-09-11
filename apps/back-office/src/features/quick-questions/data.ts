/** Public data module for quick-questions — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/quick-questions/mock';
import * as remote from '@/features/quick-questions/api';

// A question is answered within the hour, so the year is noise in the list.
export { formatShortDateTime as formatDateTime } from '@/lib/format';
export {
  bucketBadgeVariant,
  paymentBadgeVariant,
  deadlineMs,
  remainingMs,
  bucketOf,
  slaMet,
  formatDuration,
} from '@/features/quick-questions/format';

export const fetchTickets = USE_MOCKS ? mock.fetchTickets : remote.fetchTickets;
export const answerTicket = USE_MOCKS ? mock.answerTicket : remote.answerTicket;
