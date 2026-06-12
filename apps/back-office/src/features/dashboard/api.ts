import type { DashboardStatsDto } from '@olesia/shared';

import { http } from '@/api/http';

/** Real `dashboard` stats endpoint (module_calendly.md §11). */
export function fetchDashboardStats(): Promise<DashboardStatsDto> {
  return http.get<DashboardStatsDto>('/dashboard/stats');
}
