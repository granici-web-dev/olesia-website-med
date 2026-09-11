/** Public data module for subscribers — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/subscribers/mock';
import * as remote from '@/features/subscribers/api';

export { formatConsentDate } from '@/features/subscribers/mock';

export const fetchSubscribers = USE_MOCKS
  ? mock.fetchSubscribers
  : remote.fetchSubscribers;
