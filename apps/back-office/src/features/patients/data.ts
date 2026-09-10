/** Public data module for patients — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/patients/mock';
import * as remote from '@/features/patients/api';

// Pure formatting/badge helpers live in the mock module and are always real.
export * from '@/features/patients/mock';

export const fetchPatients = USE_MOCKS ? mock.fetchPatients : remote.fetchPatients;
export const fetchPatient = USE_MOCKS ? mock.fetchPatient : remote.fetchPatient;
export const fetchTimeline = USE_MOCKS ? mock.fetchTimeline : remote.fetchTimeline;
export const createPatient = USE_MOCKS ? mock.createPatient : remote.createPatient;
export const updatePatient = USE_MOCKS ? mock.updatePatient : remote.updatePatient;
export const deletePatient = USE_MOCKS ? mock.deletePatient : remote.deletePatient;
export const setConsent = USE_MOCKS ? mock.setConsent : remote.setConsent;
export const addEntry = USE_MOCKS ? mock.addEntry : remote.addEntry;
export const updateEntry = USE_MOCKS ? mock.updateEntry : remote.updateEntry;
export const deleteEntry = USE_MOCKS ? mock.deleteEntry : remote.deleteEntry;
export const uploadDocument = USE_MOCKS
  ? mock.uploadDocument
  : remote.uploadDocument;
export const downloadDocument = USE_MOCKS
  ? mock.downloadDocument
  : remote.downloadDocument;
export const fromLead = USE_MOCKS ? mock.fromLead : remote.fromLead;
export const linkLead = USE_MOCKS ? mock.linkLead : remote.linkLead;
