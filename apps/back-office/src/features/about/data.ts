/** Public data module for about — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/about/mock';
import * as remote from '@/features/about/api';

export { formatDateTime } from '@/lib/format';

export const fetchAbout = USE_MOCKS ? mock.fetchAbout : remote.fetchAbout;
export const updateAbout = USE_MOCKS ? mock.updateAbout : remote.updateAbout;
export const uploadImage = USE_MOCKS ? mock.uploadImage : remote.uploadImage;
