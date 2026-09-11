import type { UploadTarget } from '@/features/uploads/types';

/** Query key for the upload links attached to one appointment or order. */
export const uploadLinksQueryKey = (target: UploadTarget, id: string) =>
  ['upload-links', target, id] as const;
