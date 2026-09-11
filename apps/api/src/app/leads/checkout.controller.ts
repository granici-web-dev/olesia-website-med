import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../common/decorators/public.decorator';
import {
  CaptchaGuard,
  CaptchaProtected,
} from '../common/captcha/captcha.guard';
import { LeadsService } from './leads.service';
import { QuickQuestionCheckoutDto } from './dto/checkout.dto';

/**
 * The one public route that takes money.
 *
 * It sits in `leads` rather than in `payments` because `leads` already owns the
 * public front door — the captcha, the honeypot, the per-route rate limit and
 * the locale rule are all here, and a second front door would be a second place
 * to get those right. `leads → payments` is one new edge and no cycle.
 *
 * Same protections as the other four lead routes, and the same reasoning behind
 * each: a token minted for this action only, a honeypot that works without
 * captcha keys, and three a minute, which is generous for a form a person fills
 * in once.
 *
 * The honeypot is handled differently here. Everywhere else a tripped honeypot
 * answers success so the bot learns nothing; this route has to answer with a
 * URL to redirect to, and inventing one would send a real person who tripped it
 * by accident to a page that does not exist. It answers the same generic
 * failure the route gives for anything else instead, so the bot still learns
 * nothing about which field gave it away.
 */
const CHECKOUT_RATE_LIMIT = { default: { ttl: 60_000, limit: 3 } };

@ApiTags('leads')
@ApiHeader({
  name: 'x-captcha-token',
  required: false,
  description:
    'reCAPTCHA v3 token; required once RECAPTCHA_SECRET is configured.',
})
@UseGuards(CaptchaGuard)
@Controller('leads')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(private readonly leads: LeadsService) {}

  @Public()
  @Throttle(CHECKOUT_RATE_LIMIT)
  @CaptchaProtected('quick_question_checkout')
  @Post('quick-question/checkout')
  quickQuestionCheckout(@Body() dto: QuickQuestionCheckoutDto) {
    if (dto.company) {
      this.logger.warn(
        'Checkout dropped on /quick-question/checkout (honeypot tripped).',
      );
      throw new BadRequestException('checkout_failed');
    }
    return this.leads.startQuickQuestionCheckout(dto);
  }
}
