/** Public data module for subscribers — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/subscribers/mock';
import * as remote from '@/features/subscribers/api';

// Consent is a record with legal weight, so it is stamped to the minute.
export { formatDateTime as formatConsentDate } from '@/lib/format';

export const fetchSubscribers = USE_MOCKS
  ? mock.fetchSubscribers
  : remote.fetchSubscribers;
