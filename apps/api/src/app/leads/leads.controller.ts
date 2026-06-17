import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
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
 */
@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Public()
  @Post('monitoring')
  monitoring(@Body() dto: MonitoringLeadDto) {
    return this.leads.createMonitoring(dto);
  }

  @Public()
  @Post('quick-question')
  quickQuestion(@Body() dto: QuickQuestionLeadDto) {
    return this.leads.createQuickQuestion(dto);
  }

  @Public()
  @Post('contact')
  contact(@Body() dto: ContactMessageDto) {
    return this.leads.createContact(dto);
  }
}
