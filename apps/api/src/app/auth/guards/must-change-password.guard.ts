import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { PASSWORD_CHANGE_PENDING_KEY } from '../../common/decorators/password-change-pending.decorator';
import type { AuthUser } from '../jwt.types';

/**
 * An account still on the password an admin read out over the phone may do
 * exactly three things: read itself, change that password, and sign out.
 *
 * The back office already puts such an account in front of the change-password
 * form and nowhere else, but that is a screen, not a rule: the access token it
 * holds is a normal one, and a second tab, a bookmark or curl reached every
 * route in the API with it. The starter password is shared over a channel
 * nobody controls, so the window between "an admin created the account" and
 * "the owner chose a password" is the weakest the account will ever be.
 */
@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const exempt = this.reflector.getAllAndOverride<boolean>(
      PASSWORD_CHANGE_PENDING_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (exempt) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const user: AuthUser | undefined = context.switchToHttp().getRequest().user;
    if (user?.mustChangePassword) {
      throw new ForbiddenException('must_change_password');
    }
    return true;
  }
}
