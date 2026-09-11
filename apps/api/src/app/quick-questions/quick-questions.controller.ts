import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { QuickQuestionsService } from './quick-questions.service';
import { AnswerTicketDto } from './dto/quick-question.dto';
import { ListTicketsQueryDto } from './dto/list-tickets-query.dto';

/** Quick-question tickets (module_calendly.md §3.2.5) — admin/editor. */
@ApiTags('quick-questions')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
@Controller('quick-questions')
export class QuickQuestionsController {
  constructor(private readonly tickets: QuickQuestionsService) {}

  @Get()
  findAll(@Query() query: ListTicketsQueryDto) {
    return this.tickets.findAll(query);
  }

  @Post(':id/answer')
  answer(@Param('id') id: string, @Body() dto: AnswerTicketDto) {
    return this.tickets.answer(id, dto);
  }
}
