import type { ServiceCode, ServiceGroup } from '@/features/services/types';

/** Fixed catalog of service codes → group + default duration (group A). */
export const CODE_META: Record<
  ServiceCode,
  { group: ServiceGroup; defaultDuration: number | null }
> = {
  pediatric: { group: 'A_booking', defaultDuration: 30 },
  nutrition_copii: { group: 'A_booking', defaultDuration: 60 },
  nutrition_adulti: { group: 'A_booking', defaultDuration: 60 },
  integrative: { group: 'A_booking', defaultDuration: 90 },
  monitoring: { group: 'B_portal', defaultDuration: null },
  quick_question: { group: 'B_portal', defaultDuration: null },
  free_consult: { group: 'A_booking', defaultDuration: 30 },
};

export const ALL_CODES = Object.keys(CODE_META) as ServiceCode[];

export function groupForCode(code: ServiceCode): ServiceGroup {
  return CODE_META[code].group;
}
