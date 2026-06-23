/** Public data module for quick-questions — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/quick-questions/mock';
import * as remote from '@/features/quick-questions/api';

export * from '@/features/quick-questions/mock';

export const fetchTickets = USE_MOCKS ? mock.fetchTickets : remote.fetchTickets;
export const answerTicket = USE_MOCKS ? mock.answerTicket : remote.answerTicket;
export const setPaymentStatus = USE_MOCKS
  ? mock.setPaymentStatus
  : remote.setPaymentStatus;
