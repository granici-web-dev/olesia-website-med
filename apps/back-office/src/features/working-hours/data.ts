/** Public data module for the schedule — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/working-hours/mock';
import * as remote from '@/features/working-hours/api';

export const fetchWorkingHours = USE_MOCKS
  ? mock.fetchWorkingHours
  : remote.fetchWorkingHours;
export const saveWorkingHours = USE_MOCKS
  ? mock.saveWorkingHours
  : remote.saveWorkingHours;
