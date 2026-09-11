/** Public data module for users — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/users/mock';
import * as remote from '@/features/users/api';

export { formatDate } from '@/lib/format';
export { initials, generatePassword } from '@/features/users/format';

export const fetchUsers = USE_MOCKS ? mock.fetchUsers : remote.fetchUsers;
export const createUser = USE_MOCKS ? mock.createUser : remote.createUser;
export const updateUser = USE_MOCKS ? mock.updateUser : remote.updateUser;
export const setUserActive = USE_MOCKS
  ? mock.setUserActive
  : remote.setUserActive;
export const resetPassword = USE_MOCKS
  ? mock.resetPassword
  : remote.resetPassword;
