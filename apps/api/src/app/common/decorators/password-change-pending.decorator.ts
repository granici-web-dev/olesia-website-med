import { SetMetadata } from '@nestjs/common';

export const PASSWORD_CHANGE_PENDING_KEY = 'allowsPasswordChangePending';

/**
 * Marks a route as reachable by an account that still carries the password an
 * admin read out. Only the three routes that get such an account out of that
 * state may say this (see MustChangePasswordGuard).
 */
export const AllowsPasswordChangePending = () =>
  SetMetadata(PASSWORD_CHANGE_PENDING_KEY, true);
