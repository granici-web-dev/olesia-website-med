import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import type { AuthUser } from '../../auth/jwt.types';

/**
 * Injects the authenticated user (set by JwtStrategy) into a handler param.
 *
 * It claimed to return `AuthUser` while returning whatever was on the request,
 * which is `undefined` on a `@Public()` route (audit A5, F18). Every caller
 * read `user.id` off that promise, so the type was doing the opposite of its
 * job. Throwing makes the annotation true: a handler that asks for the current
 * user only ever gets one.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const user: AuthUser | undefined = ctx.switchToHttp().getRequest().user;
    if (!user) throw new UnauthorizedException();
    return user;
  },
);
