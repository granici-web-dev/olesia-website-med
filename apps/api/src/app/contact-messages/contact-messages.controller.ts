import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ContactMessagesService } from './contact-messages.service';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';

/** Contact-form messages inbox ("Mesaje") — admin/editor only. */
@ApiTags('contact-messages')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly messages: ContactMessagesService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.messages.findAll(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContactMessageDto) {
    return this.messages.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.messages.remove(id);
  }
}
