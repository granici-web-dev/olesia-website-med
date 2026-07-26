import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CaptchaService } from './captcha.service';

export const CAPTCHA_ACTION = 'captchaAction';

/**
 * Marks a public route as captcha-protected and names the action the token must
 * have been minted for (the frontend passes the same name), so a token taken
 * from one form cannot be replayed against another.
 */
export const CaptchaProtected = (action: string) => SetMetadata(CAPTCHA_ACTION, action);

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly captcha: CaptchaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.getAllAndOverride<string>(CAPTCHA_ACTION, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!action) return true;

    // The token travels in a header, not the body: the global ValidationPipe
    // runs `forbidNonWhitelisted`, so an extra body field would 400 unless every
    // DTO declared it. A header also keeps the token out of the payloads we log.
    const req = context.switchToHttp().getRequest<{
      headers?: Record<string, string | string[] | undefined>;
    }>();
    const header = req.headers?.['x-captcha-token'];
    const token = typeof header === 'string' ? header : undefined;

    if (await this.captcha.verify(token, action)) return true;

    // Deliberately vague: telling a bot *why* it failed helps it tune.
    throw new ForbiddenException('captcha_failed');
  }
}
