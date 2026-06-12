/** Public data module for the dashboard — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/dashboard/mock';
import * as remote from '@/features/dashboard/api';

export const fetchDashboardStats = USE_MOCKS
  ? mock.fetchDashboardStats
  : remote.fetchDashboardStats;
