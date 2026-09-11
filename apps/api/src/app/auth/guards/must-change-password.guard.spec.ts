/**
 * An account still on the starter password may reach three routes and no
 * others. The back office puts such an account in front of the change-password
 * form, but that is a screen: the access token it holds is an ordinary one, so
 * the rule has to exist here as well, and the only way to know it does is to
 * name the exempt routes in a test rather than to re-read the controllers.
 *
 * A `Reflector` stand-in rather than a Nest testing module, for the reason
 * `roles.guard.spec.ts` gives: two pieces of metadata and one request property.
 */
import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { PASSWORD_CHANGE_PENDING_KEY } from '../../common/decorators/password-change-pending.decorator';
import { Role } from '../../../generated/prisma/enums';
import type { AuthUser } from '../jwt.types';
import { MustChangePasswordGuard } from './must-change-password.guard';

const settled: AuthUser = {
  id: 'u1',
  email: 'a@example.com',
  role: Role.admin,
  mustChangePassword: false,
};
const onStarterPassword: AuthUser = { ...settled, mustChangePassword: true };

function guardFor(metadata: { public?: boolean; exempt?: boolean }) {
  const reflector = {
    getAllAndOverride: (key: string) =>
      key === IS_PUBLIC_KEY
        ? metadata.public
        : key === PASSWORD_CHANGE_PENDING_KEY
          ? metadata.exempt
          : undefined,
  } as unknown as Reflector;
  return new MustChangePasswordGuard(reflector);
}

function contextFor(user?: AuthUser): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('MustChangePasswordGuard', () => {
  it('refuses an ordinary route to an account on the starter password', () => {
    expect(() =>
      guardFor({}).canActivate(contextFor(onStarterPassword)),
    ).toThrow(ForbiddenException);
  });

  it('lets the three routes that end that state through', () => {
    // /auth/me, /auth/change-password and /auth/logout, each marked
    // `@AllowsPasswordChangePending()`.
    expect(
      guardFor({ exempt: true }).canActivate(contextFor(onStarterPassword)),
    ).toBe(true);
  });

  it('does not stand in the way of an account with its own password', () => {
    expect(guardFor({}).canActivate(contextFor(settled))).toBe(true);
  });

  it('leaves public routes alone', () => {
    expect(guardFor({ public: true }).canActivate(contextFor(undefined))).toBe(
      true,
    );
  });
});
