/** Public data module for subscriptions — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/subscriptions/mock';
import * as remote from '@/features/subscriptions/api';

export * from '@/features/subscriptions/mock';

export const fetchSubscriptions = USE_MOCKS
  ? mock.fetchSubscriptions
  : remote.fetchSubscriptions;
export const setPaymentStatus = USE_MOCKS
  ? mock.setPaymentStatus
  : remote.setPaymentStatus;
export const logVideoCall = USE_MOCKS ? mock.logVideoCall : remote.logVideoCall;
export const cancelSubscription = USE_MOCKS
  ? mock.cancelSubscription
  : remote.cancelSubscription;
