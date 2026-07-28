/** Public data module for the FAQ — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/faq/mock';
import * as remote from '@/features/faq/api';

export const fetchFaq = USE_MOCKS ? mock.fetchFaq : remote.fetchFaq;
export const createFaqCategory = USE_MOCKS
  ? mock.createFaqCategory
  : remote.createFaqCategory;
export const updateFaqCategory = USE_MOCKS
  ? mock.updateFaqCategory
  : remote.updateFaqCategory;
export const deleteFaqCategory = USE_MOCKS
  ? mock.deleteFaqCategory
  : remote.deleteFaqCategory;
export const createFaqItem = USE_MOCKS ? mock.createFaqItem : remote.createFaqItem;
export const updateFaqItem = USE_MOCKS ? mock.updateFaqItem : remote.updateFaqItem;
export const deleteFaqItem = USE_MOCKS ? mock.deleteFaqItem : remote.deleteFaqItem;
