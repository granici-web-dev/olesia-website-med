/**
 * Public data module for the services feature.
 * Re-exports the mock's types/helpers, then overrides the CRUD functions with
 * either the mock or the real API client based on `USE_MOCKS`.
 */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/services/mock';
import * as remote from '@/features/services/api';

export * from '@/features/services/mock';

export const fetchServices = USE_MOCKS ? mock.fetchServices : remote.fetchServices;
export const createService = USE_MOCKS ? mock.createService : remote.createService;
export const updateService = USE_MOCKS ? mock.updateService : remote.updateService;
export const deleteService = USE_MOCKS ? mock.deleteService : remote.deleteService;
export const setServiceActive = USE_MOCKS
  ? mock.setServiceActive
  : remote.setServiceActive;
