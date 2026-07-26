import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { CaptchaGuard, CaptchaProtected } from '../common/captcha/captcha.guard';
import { LeadsService } from './leads.service';
import {
  ContactMessageDto,
  MonitoringLeadDto,
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
 * RECAPTCHA_SECRET configured the guard is a no-op, so local dev is unaffected.
 * The contact form keeps its honeypot as a second, zero-dependency line.
 */
@ApiTags('leads')
@ApiHeader({
  name: 'x-captcha-token',
  required: false,
  description: 'reCAPTCHA v3 token; required once RECAPTCHA_SECRET is configured.',
})
@UseGuards(CaptchaGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Public()
  @CaptchaProtected('lead_monitoring')
  @Post('monitoring')
  monitoring(@Body() dto: MonitoringLeadDto) {
    return this.leads.createMonitoring(dto);
  }

  @Public()
  @CaptchaProtected('lead_quick_question')
  @Post('quick-question')
  quickQuestion(@Body() dto: QuickQuestionLeadDto) {
    return this.leads.createQuickQuestion(dto);
  }

  @Public()
  @CaptchaProtected('lead_contact')
  @Post('contact')
  contact(@Body() dto: ContactMessageDto) {
    return this.leads.createContact(dto);
  }
}
