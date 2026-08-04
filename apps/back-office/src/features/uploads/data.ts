/** Public data module for upload links — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/uploads/mock';
import * as remote from '@/features/uploads/api';

export const fetchUploadLinks = USE_MOCKS
  ? mock.fetchUploadLinks
  : remote.fetchUploadLinks;
export const issueUploadLink = USE_MOCKS
  ? mock.issueUploadLink
  : remote.issueUploadLink;
export const sendUploadLink = USE_MOCKS
  ? mock.sendUploadLink
  : remote.sendUploadLink;
export const revokeUploadLink = USE_MOCKS
  ? mock.revokeUploadLink
  : remote.revokeUploadLink;
export const deleteUploadedDocument = USE_MOCKS
  ? mock.deleteUploadedDocument
  : remote.deleteUploadedDocument;
export const downloadUploadedDocument = USE_MOCKS
  ? mock.downloadUploadedDocument
  : remote.downloadUploadedDocument;
