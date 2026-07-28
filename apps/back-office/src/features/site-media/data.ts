/** Public data module for site media — mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/site-media/mock';
import * as remote from '@/features/site-media/api';

export const fetchSiteMedia = USE_MOCKS
  ? mock.fetchSiteMedia
  : remote.fetchSiteMedia;
export const setSiteMedia = USE_MOCKS ? mock.setSiteMedia : remote.setSiteMedia;
export const resetSiteMedia = USE_MOCKS
  ? mock.resetSiteMedia
  : remote.resetSiteMedia;
export const uploadSiteImage = USE_MOCKS
  ? mock.uploadSiteImage
  : remote.uploadSiteImage;
export const uploadSiteVideo = USE_MOCKS
  ? mock.uploadSiteVideo
  : remote.uploadSiteVideo;
