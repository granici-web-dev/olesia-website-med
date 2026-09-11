/**
 * Public data module for the services feature: the catalog helpers, then the
 * CRUD functions from either the mock or the real client by `USE_MOCKS`.
 */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/services/mock';
import * as remote from '@/features/services/api';

export { formatPrice } from '@/lib/format';
export { CODE_META, ALL_CODES, groupForCode } from '@/features/services/format';

export const fetchServices = USE_MOCKS
  ? mock.fetchServices
  : remote.fetchServices;
export const createService = USE_MOCKS
  ? mock.createService
  : remote.createService;
export const updateService = USE_MOCKS
  ? mock.updateService
  : remote.updateService;
export const deleteService = USE_MOCKS
  ? mock.deleteService
  : remote.deleteService;
export const setServiceActive = USE_MOCKS
  ? mock.setServiceActive
  : remote.setServiceActive;
