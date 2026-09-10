/**
 * Deny-by-default, which is the whole point of this guard.
 *
 * It used to return true when a route carried no `@Roles` metadata (audit A5,
 * F13), so "somebody forgot the decorator" and "everyone with a token may do
 * this" were the same thing to read and the same thing to run. Every route in
 * the tree happened to carry one, so nothing was actually open — which is
 * exactly why a test is worth more here than a re-read of the controllers.
 *
 * A `Reflector` stand-in rather than a Nest testing module: the guard's whole
 * behaviour is a function of two pieces of metadata and one request property,
 * and none of that needs a container (TESTING.md, "no Nest test module").
 */
import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Role } from '../../../generated/prisma/enums';
import type { AuthUser } from '../jwt.types';
import { RolesGuard } from './roles.guard';

const ADMIN: AuthUser = { id: 'u1', email: 'a@example.com', role: Role.admin };
const EDITOR: AuthUser = { id: 'u2', email: 'e@example.com', role: Role.editor };

/** Metadata a route declares, plus whoever the JWT guard put on the request. */
function guardFor(metadata: { public?: boolean; roles?: Role[] }) {
  const reflector = {
    getAllAndOverride: (key: string) =>
      key === IS_PUBLIC_KEY ? metadata.public : key === ROLES_KEY ? metadata.roles : undefined,
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

function contextFor(user?: AuthUser): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('refuses a route that declares no roles at all', () => {
    expect(() => guardFor({}).canActivate(contextFor(ADMIN))).toThrow(
      ForbiddenException,
    );
  });

  it('refuses a route whose roles list is empty', () => {
    expect(() => guardFor({ roles: [] }).canActivate(contextFor(ADMIN))).toThrow(
      ForbiddenException,
    );
  });

  it('lets a public route through before it looks at roles', () => {
    // The shape that matters: a `@Public()` handler inside a `@Roles(admin)`
    // controller, reached by a visitor with no token at all.
    const guard = guardFor({ public: true, roles: [Role.admin] });
    expect(guard.canActivate(contextFor(undefined))).toBe(true);
  });

  it('lets a matching role through', () => {
    expect(
      guardFor({ roles: [Role.admin, Role.editor] }).canActivate(contextFor(EDITOR)),
    ).toBe(true);
  });

  it('refuses a role the route did not name', () => {
    expect(() =>
      guardFor({ roles: [Role.admin] }).canActivate(contextFor(EDITOR)),
    ).toThrow(ForbiddenException);
  });

  it('refuses a guarded route with nobody on the request', () => {
    expect(() =>
      guardFor({ roles: [Role.admin] }).canActivate(contextFor(undefined)),
    ).toThrow(ForbiddenException);
  });
});
