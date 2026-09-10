/** Data module for payments — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/payments/mock';
import * as remote from '@/features/payments/api';

// Pure presentation helpers live with the mock, as in every other feature.
export {
  stateBadgeVariant,
  formatDateTime,
  formatAmount,
  TARGET_KEYS,
} from '@/features/payments/mock';

export const fetchPayments = USE_MOCKS ? mock.fetchPayments : remote.fetchPayments;
export const fetchPatientPayments = USE_MOCKS
  ? mock.fetchPatientPayments
  : remote.fetchPatientPayments;
export const fetchTargetPayments = USE_MOCKS
  ? mock.fetchTargetPayments
  : remote.fetchTargetPayments;
export const syncPayment = USE_MOCKS ? mock.syncPayment : remote.syncPayment;
export const refundPayment = USE_MOCKS ? mock.refundPayment : remote.refundPayment;
export const recordManualPayment = USE_MOCKS
  ? mock.recordManualPayment
  : remote.recordManualPayment;
export const voidPayment = USE_MOCKS ? mock.voidPayment : remote.voidPayment;
