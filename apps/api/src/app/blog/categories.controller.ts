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
import { BlogService } from './blog.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

/** Blog categories (module_calendly.md §7). GET public; writes admin/editor. */
@ApiTags('blog')
@Controller('blog/categories')
export class CategoriesController {
  constructor(private readonly blog: BlogService) {}

  @Public()
  @Get()
  findAll() {
    return this.blog.findAllCategories();
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.blog.createCategory(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.blog.updateCategory(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.blog.removeCategory(id);
  }
}
