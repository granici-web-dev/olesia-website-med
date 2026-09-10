import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { AuthTokens, UserDto } from '@olesia/shared';

import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ttlToMs } from './token-ttl';
import { TotpService, type EnrolmentStart } from './totp.service';
import { LoginDto, OptionalTotpCodeDto, TotpCodeDto } from './dto/login.dto';
import type { AuthUser } from './jwt.types';

const REFRESH_COOKIE = 'olesia_rt';
const REFRESH_COOKIE_PATH = '/api/auth';

/**
 * `Secure` is on unless COOKIE_SECURE says otherwise, rather than off unless
 * NODE_ENV says otherwise: the previous shape meant any deployment started
 * outside the Docker image sent the refresh cookie over plain HTTP without
 * anyone choosing that.
 */
const cookieSecure = () => process.env.COOKIE_SECURE !== 'false';

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: cookieSecure(),
    path: REFRESH_COOKIE_PATH,
    // The cookie dies with the token inside it.
    maxAge: ttlToMs(process.env.JWT_REFRESH_TTL ?? '7d'),
  });
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly totp: TotpService,
  ) {}

  /** 8 attempts a minute per IP: enough for a mistyped password or a 2FA
   *  retry, far too slow to walk a password list. */
  @Throttle({ default: { ttl: 60_000, limit: 8 } })
  @Public()
  @HttpCode(200)
  @Post('login')
  /**
   * Password first, second factor second. When the account has 2FA on and no
   * code was sent, this answers 401 `totp_required` — the client then re-posts
   * the same credentials plus `totpCode`. No half-authenticated session is
   * issued in between, so there is nothing to steal from that intermediate step.
   */
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens> {
    const user = await this.auth.validateUser(dto.email, dto.password);
    if (user.totpEnabled) {
      await this.totp.assertCode(user, dto.totpCode);
    }
    const { accessToken, refreshToken } = await this.auth.issueTokens(user, {
      userAgent: req.get('user-agent'),
    });
    setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens> {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new UnauthorizedException('no_refresh');
    const { accessToken, refreshToken } = await this.auth.rotate(
      token,
      req.get('user-agent'),
    );
    setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @HttpCode(200)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) await this.auth.endSession(token);
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return this.users.findOneDto(user.id);
  }

  // --- Two-factor authentication (answers v2 §10) ---

  /**
   * Step 1: mint a secret and show the QR. 2FA is NOT on yet.
   *
   * Re-enrolling an account that already has 2FA on needs a current code:
   * without that requirement this endpoint was a way to switch the second
   * factor off from a stolen session, which is exactly what `disable` refuses
   * to allow.
   */
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiBearerAuth()
  @HttpCode(200)
  @Post('2fa/setup')
  setupTotp(
    @CurrentUser() user: AuthUser,
    @Body() dto: OptionalTotpCodeDto,
  ): Promise<EnrolmentStart> {
    return this.totp.startEnrolment(user.id, dto.code);
  }

  /** Step 2: prove the authenticator works, then switch 2FA on. */
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiBearerAuth()
  @HttpCode(200)
  @Post('2fa/enable')
  async enableTotp(
    @CurrentUser() user: AuthUser,
    @Body() dto: TotpCodeDto,
  ): Promise<{ recoveryCodes: string[] }> {
    return { recoveryCodes: await this.totp.confirmEnrolment(user.id, dto.code) };
  }

  /** Turning it off also needs a valid code — a stolen session must not suffice. */
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiBearerAuth()
  @HttpCode(200)
  @Post('2fa/disable')
  async disableTotp(
    @CurrentUser() user: AuthUser,
    @Body() dto: TotpCodeDto,
  ): Promise<void> {
    await this.totp.disable(user.id, dto.code);
  }
}
