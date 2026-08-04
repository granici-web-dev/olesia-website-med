/**
 * Practice schedule (client answers v2 §11.5).
 *
 * It is not decoration: the EXPRESS deadline shown on every ticket is counted
 * against these hours, so a wrong schedule produces wrong deadlines.
 *
 * Mirrors `WorkingHoursDto` in `packages/shared`.
 */

export interface WorkingDay {
  /** 1 = Monday … 7 = Sunday. */
  weekday: number;
  closed: boolean;
  /** "HH:MM" in `timezone`. */
  opensAt: string;
  closesAt: string;
}

export interface WorkingHours {
  timezone: string;
  days: WorkingDay[];
  expressSlaMinutes: number;
  /** True while this is still our placeholder rather than the client's hours. */
  isPlaceholder: boolean;
  updatedAt: string;
}

export type WorkingHoursInput = Pick<
  WorkingHours,
  'timezone' | 'days' | 'expressSlaMinutes'
>;
