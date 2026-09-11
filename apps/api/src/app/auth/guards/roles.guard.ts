import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import type { Role } from '../../../generated/prisma/enums';
import type { AuthUser } from '../jwt.types';

/**
 * Global role guard. A route is reachable only if it says who may reach it:
 * either `@Public()` or `@Roles(...)`.
 *
 * It used to return true when no `@Roles` metadata was present (audit A5,
 * F13), which made "forgot the decorator" indistinguishable from "everyone
 * with a token may do this". Every route in the tree carried one, so nothing
 * was open — but the next controller added without one would have been, and
 * the failure is silent in exactly the direction that costs the most here.
 * Deny-by-default turns that omission into a 403 the first time anyone tries.
 *
 * `@Public()` is read first and answers before the roles are consulted at all
 * (F14): a public route inside a `@Roles`-decorated controller inherits the
 * class metadata, and without this it would answer 403 to an anonymous
 * visitor.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) throw new ForbiddenException();

    const user: AuthUser | undefined = context.switchToHttp().getRequest().user;
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
