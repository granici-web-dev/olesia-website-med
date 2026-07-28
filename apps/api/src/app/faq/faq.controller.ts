import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { FaqService } from './faq.service';
import {
  CreateFaqCategoryDto,
  UpdateFaqCategoryDto,
} from './dto/faq-category.dto';
import { CreateFaqItemDto, UpdateFaqItemDto } from './dto/faq-item.dto';

/**
 * FAQ sections and questions behind the public /faq page.
 *
 * `GET /faq` serves the site and returns only published content; the back
 * office reads `GET /faq/all`, which also includes what is hidden. Unlike the
 * other content modules, the public payload is filtered rather than sent whole:
 * a question the doctor deactivated is content she chose not to publish yet.
 */
@ApiTags('faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly faq: FaqService) {}

  @Public()
  @Get()
  findPublished() {
    return this.faq.findPublished();
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Get('all')
  findAll() {
    return this.faq.findAll();
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post('categories')
  createCategory(@Body() dto: CreateFaqCategoryDto) {
    return this.faq.createCategory(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateFaqCategoryDto) {
    return this.faq.updateCategory(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Delete('categories/:id')
  @HttpCode(204)
  removeCategory(@Param('id') id: string) {
    return this.faq.removeCategory(id);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post('items')
  createItem(@Body() dto: CreateFaqItemDto) {
    return this.faq.createItem(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateFaqItemDto) {
    return this.faq.updateItem(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Delete('items/:id')
  @HttpCode(204)
  removeItem(@Param('id') id: string) {
    return this.faq.removeItem(id);
  }
}
