import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AuthUser } from '../../auth/jwt.types';

/** Injects the authenticated user (set by JwtStrategy) into a handler param. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);
