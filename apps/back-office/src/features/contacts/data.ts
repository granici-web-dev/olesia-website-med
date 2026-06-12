/** Public data module for contacts — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/contacts/mock';
import * as remote from '@/features/contacts/api';

export * from '@/features/contacts/mock';

export const fetchContacts = USE_MOCKS ? mock.fetchContacts : remote.fetchContacts;
export const createContact = USE_MOCKS ? mock.createContact : remote.createContact;
export const updateContact = USE_MOCKS ? mock.updateContact : remote.updateContact;
export const deleteContact = USE_MOCKS ? mock.deleteContact : remote.deleteContact;
export const setContactActive = USE_MOCKS
  ? mock.setContactActive
  : remote.setContactActive;
