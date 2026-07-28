/** Public data module for media appearances — mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/media/mock';
import * as remote from '@/features/media/api';

export const fetchMedia = USE_MOCKS ? mock.fetchMedia : remote.fetchMedia;
export const createMedia = USE_MOCKS ? mock.createMedia : remote.createMedia;
export const updateMedia = USE_MOCKS ? mock.updateMedia : remote.updateMedia;
export const deleteMedia = USE_MOCKS ? mock.deleteMedia : remote.deleteMedia;
export const fetchThumbnail = USE_MOCKS
  ? mock.fetchThumbnail
  : remote.fetchThumbnail;
export const uploadThumbnail = USE_MOCKS
  ? mock.uploadThumbnail
  : remote.uploadThumbnail;
