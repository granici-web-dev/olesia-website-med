import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../../generated/prisma/enums';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import type { AuthUser } from '../auth/jwt.types';

/** Blog posts (module_calendly.md §7) — back-office CRUD, admin/editor. */
@ApiTags('blog')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
@Controller('blog/posts')
export class PostsController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.blog.findAllPosts(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blog.findPost(id);
  }

  @Post()
  create(@Body() dto: CreatePostDto, @CurrentUser() user: AuthUser) {
    return this.blog.createPost(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.blog.updatePost(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.blog.removePost(id);
  }
}
