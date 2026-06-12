import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { SubscriptionsService } from './subscriptions.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

/** Subscriptions (module_calendly.md §3.2.4) — back-office, admin/editor. */
@ApiTags('subscriptions')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.subscriptions.findAll(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptions.update(id, dto);
  }

  @Post(':id/video-call')
  logVideoCall(@Param('id') id: string) {
    return this.subscriptions.logVideoCall(id);
  }
}
