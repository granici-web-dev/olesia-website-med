import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../common/decorators/public.decorator';
import { CaptchaGuard, CaptchaProtected } from '../common/captcha/captcha.guard';
import { LeadsService } from './leads.service';
import {
  ContactMessageDto,
  DeliverableLeadDto,
  MonitoringLeadDto,
  PublicLeadDto,
  QuickQuestionLeadDto,
} from './dto/create-lead.dto';

/**
 * Public lead intake for group-B services (module_calendly.md §3.2.4–3.2.5).
 * No auth: the public site posts here; each lead lands in the back office as a
 * `pending` record and triggers a notification email.
 *
 * Spam protection (answers v2 §10): every route is captcha-protected. The token
 * arrives in `x-captcha-token` and must have been minted for that route's own
 * action, so a token from one form cannot be replayed against another. With no
 * RECAPTCHA_SECRET configured the guard is a no-op, which is the state until
 * the client's keys exist — so every route also carries a honeypot, which
 * costs nothing and works without keys.
 *
 * The rate limit is per route, which is how the throttler keys it: a
 * controller-level `@Throttle` reads as "six a minute" and delivers six a
 * minute *each*, twenty-four across the four (audit A3, F17). Three is
 * generous for a form a person fills in once.
 */
const LEAD_RATE_LIMIT = { default: { ttl: 60_000, limit: 3 } };

/**
 * What a tripped honeypot answers. Success, so the bot learns nothing from
 * the difference; the only public caller (`apps/frontend/lib/leads.ts`)
 * checks the status and ignores the body, so a shape of its own costs
 * nothing.
 */
const DROPPED = { ok: true } as const;

@ApiTags('leads')
@ApiHeader({
  name: 'x-captcha-token',
  required: false,
  description: 'reCAPTCHA v3 token; required once RECAPTCHA_SECRET is configured.',
})
@UseGuards(CaptchaGuard)
@Controller('leads')
export class LeadsController {
  private readonly logger = new Logger(LeadsController.name);

  constructor(private readonly leads: LeadsService) {}

  @Public()
  @Throttle(LEAD_RATE_LIMIT)
  @CaptchaProtected('lead_monitoring')
  @Post('monitoring')
  monitoring(@Body() dto: MonitoringLeadDto) {
    if (this.isBot(dto, 'monitoring')) return DROPPED;
    return this.leads.createMonitoring(dto);
  }

  @Public()
  @Throttle(LEAD_RATE_LIMIT)
  @CaptchaProtected('lead_quick_question')
  @Post('quick-question')
  quickQuestion(@Body() dto: QuickQuestionLeadDto) {
    if (this.isBot(dto, 'quick-question')) return DROPPED;
    return this.leads.createQuickQuestion(dto);
  }

  /** Group-C product order (personalized menu / written protocol). */
  @Public()
  @Throttle(LEAD_RATE_LIMIT)
  @CaptchaProtected('lead_deliverable')
  @Post('deliverable')
  deliverable(@Body() dto: DeliverableLeadDto) {
    if (this.isBot(dto, 'deliverable')) return DROPPED;
    return this.leads.createDeliverable(dto);
  }

  @Public()
  @Throttle(LEAD_RATE_LIMIT)
  @CaptchaProtected('lead_contact')
  @Post('contact')
  contact(@Body() dto: ContactMessageDto) {
    if (this.isBot(dto, 'contact')) return DROPPED;
    return this.leads.createContact(dto);
  }

  private isBot(dto: PublicLeadDto, route: string): boolean {
    if (!dto.company) return false;
    this.logger.warn(`Lead dropped on /${route} (honeypot tripped).`);
    return true;
  }
}
