import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { toPostDto } from './blog.mapper';

/** Public blog reads for the marketing site — published posts only (§7). */
@ApiTags('blog')
@Controller('blog')
export class BlogPublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('published')
  async list() {
    const posts = await this.prisma.post.findMany({
      where: { status: 'published' },
      include: { categories: true },
      orderBy: { publishedAt: 'desc' },
    });
    return posts.map(toPostDto);
  }

  @Public()
  @Get('published/:slug')
  async one(@Param('slug') slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, status: 'published' },
      include: { categories: true },
    });
    if (!post) throw new NotFoundException('post_not_found');
    return toPostDto(post);
  }
}
