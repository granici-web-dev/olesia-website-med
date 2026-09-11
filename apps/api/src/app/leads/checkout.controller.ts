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
import {
  DeliverableCheckoutDto,
  MaterialCheckoutDto,
  QuickQuestionCheckoutDto,
} from './dto/checkout.dto';

/**
 * The three public routes that take money.
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
 * Three routes with three plain DTOs rather than one with a discriminated
 * body. `class-validator` discriminated unions need `@ValidateNested` plus a
 * discriminator configured on the pipe, which is machinery this codebase has
 * nowhere, and one route would collapse three captcha actions into one — so a
 * token minted for the cheapest purchase would open the dearest.
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
    this.refuseBots(dto.company, 'quick-question');
    return this.leads.startQuickQuestionCheckout(dto);
  }

  /** A personalized menu or a written protocol (group C). */
  @Public()
  @Throttle(CHECKOUT_RATE_LIMIT)
  @CaptchaProtected('deliverable_checkout')
  @Post('deliverable/checkout')
  deliverableCheckout(@Body() dto: DeliverableCheckoutDto) {
    this.refuseBots(dto.company, 'deliverable');
    return this.leads.startDeliverableCheckout(dto);
  }

  /** A paid material from the digital library. */
  @Public()
  @Throttle(CHECKOUT_RATE_LIMIT)
  @CaptchaProtected('material_checkout')
  @Post('material/checkout')
  materialCheckout(@Body() dto: MaterialCheckoutDto) {
    this.refuseBots(dto.company, 'material');
    return this.leads.startMaterialCheckout(dto);
  }

  private refuseBots(company: string | undefined, route: string): void {
    if (!company) return;
    this.logger.warn(
      `Checkout dropped on /${route}/checkout (honeypot tripped).`,
    );
    throw new BadRequestException('checkout_failed');
  }
}
