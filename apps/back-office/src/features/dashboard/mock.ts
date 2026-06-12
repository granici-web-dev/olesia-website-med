import type { DashboardStatsDto } from '@olesia/shared';

/** Demo stats so the dashboard works with `VITE_API_MOCKS=true`. */
const DEMO: DashboardStatsDto = {
  from: '2026-05-13T00:00:00.000Z',
  to: '2026-06-12T00:00:00.000Z',
  appointments: {
    total: 24,
    previousTotal: 21,
    byService: [],
    scheduled: 9,
    completed: 12,
    noShow: 2,
    canceled: 1,
    completionRate: 0.5,
  },
  pendingPayments: 5,
  subscriptions: { active: 11, quotaUsed: 14, quotaTotal: 22 },
  quickQuestions: { open: 3, total: 8, slaRate: 0.875 },
  upcoming: [],
};

export function fetchDashboardStats(): Promise<DashboardStatsDto> {
  return new Promise((resolve) => setTimeout(() => resolve(DEMO), 500));
}
