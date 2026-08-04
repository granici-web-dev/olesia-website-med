/** Query key for the upload links attached to one appointment. */
export const uploadLinksQueryKey = (appointmentId: string) =>
  ['upload-links', 'appointment', appointmentId] as const;
