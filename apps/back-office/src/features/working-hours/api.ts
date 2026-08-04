import type { WorkingHoursDto } from '@olesia/shared';

import { http } from '@/api/http';
import type {
  WorkingHours,
  WorkingHoursInput,
} from '@/features/working-hours/types';

function toView(d: WorkingHoursDto): WorkingHours {
  return {
    timezone: d.timezone,
    days: d.days,
    expressSlaMinutes: d.expressSlaMinutes,
    isPlaceholder: d.isPlaceholder,
    updatedAt: d.updatedAt,
  };
}

export async function fetchWorkingHours(): Promise<WorkingHours> {
  return toView(await http.get<WorkingHoursDto>('/working-hours'));
}

/** Saving the schedule is also how the placeholder flag gets cleared. */
export async function saveWorkingHours(
  input: WorkingHoursInput,
): Promise<WorkingHours> {
  return toView(await http.patch<WorkingHoursDto>('/working-hours', input));
}
