import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import {
  CaptchaGuard,
  CaptchaProtected,
} from '../common/captcha/captcha.guard';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';

/**
 * Newsletter signup (public) and the "Abonați" list (staff).
 *
 * The public route is protected exactly like the lead routes: a captcha token
 * minted for its own action, a honeypot that works without captcha keys, and
 * three submissions a minute — an address is typed once, and the rate limit is
 * what stands between the list and a script.
 *
 * There is no unsubscribe route yet, deliberately: an unsubscribe link only
 * exists inside an email, and nothing sends email until the client has SMTP
 * (blocker #8). Removing an address is a back-office action until then.
 */
@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  private readonly logger = new Logger(NewsletterController.name);

  constructor(private readonly newsletter: NewsletterService) {}

  @Public()
  @UseGuards(CaptchaGuard)
  @CaptchaProtected('newsletter_subscribe')
  @ApiHeader({
    name: 'x-captcha-token',
    required: false,
    description:
      'reCAPTCHA v3 token; required once RECAPTCHA_SECRET is configured.',
  })
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('subscribe')
  @HttpCode(200)
  async subscribe(@Body() dto: SubscribeDto): Promise<{ ok: true }> {
    // Same answer as a real subscription, so a bot learns nothing from it.
    if (dto.company) {
      this.logger.warn('Newsletter signup dropped (honeypot tripped).');
      return { ok: true };
    }
    await this.newsletter.subscribe(dto);
    return { ok: true };
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Get('subscribers')
  findAll(@Query() query: PaginationQueryDto) {
    return this.newsletter.findAll(query);
  }
}
