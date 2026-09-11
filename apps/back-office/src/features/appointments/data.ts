/** Public data module for appointments — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/appointments/mock';
import * as remote from '@/features/appointments/api';

export { formatDateTime, formatTime, durationMinutes } from '@/lib/format';
export {
  statusBadgeVariant,
  paymentBadgeVariant,
  isFreeAppointment,
  serviceLabel,
} from '@/features/appointments/format';

export const fetchAppointments = USE_MOCKS
  ? mock.fetchAppointments
  : remote.fetchAppointments;
export const markNoShow = USE_MOCKS ? mock.markNoShow : remote.markNoShow;
export const uploadPlan = USE_MOCKS ? mock.uploadPlan : remote.uploadPlan;
export const downloadPlanFile = USE_MOCKS
  ? mock.downloadPlanFile
  : remote.downloadPlanFile;
