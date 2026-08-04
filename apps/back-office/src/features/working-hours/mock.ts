import type {
  WorkingHours,
  WorkingHoursInput,
} from '@/features/working-hours/types';

/* Used only when `VITE_API_MOCKS !== 'false'`; the real API is in `api.ts`. */

let store: WorkingHours = {
  timezone: 'Europe/Chisinau',
  days: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
    weekday,
    closed: weekday > 5,
    opensAt: '09:00',
    closesAt: '17:00',
  })),
  expressSlaMinutes: 60,
  // Same placeholder state as a fresh database: the client still owes us the
  // real schedule, and the page has to keep saying so.
  isPlaceholder: true,
  updatedAt: new Date().toISOString(),
};

export async function fetchWorkingHours(): Promise<WorkingHours> {
  return { ...store, days: store.days.map((d) => ({ ...d })) };
}

export async function saveWorkingHours(
  input: WorkingHoursInput,
): Promise<WorkingHours> {
  store = {
    ...store,
    ...input,
    days: input.days.map((d) => ({ ...d })),
    isPlaceholder: false,
    updatedAt: new Date().toISOString(),
  };
  return fetchWorkingHours();
}
