/** Shared TanStack Query keys for the patients feature. */
export const patientsQueryKey = ['patients'] as const;

export const patientQueryKey = (id: string) => ['patients', id] as const;

export const patientTimelineQueryKey = (id: string) =>
  ['patients', id, 'timeline'] as const;
