import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicPostDto } from './blog.mapper';
import { isPubliclyVisible } from './post-visibility';

/** Public blog reads for the marketing site — published posts only (§7). */
@ApiTags('blog')
@Controller('blog')
export class BlogPublicController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * `isPubliclyVisible` written as a query, because a list cannot filter in
   * memory. The two say the same thing and have to keep saying it;
   * `post-visibility.spec.ts` pins the boundary they share.
   */
  @Public()
  @Get('published')
  async list() {
    const posts = await this.prisma.post.findMany({
      where: {
        status: 'published',
        publishedAt: { not: null, lte: new Date() },
      },
      include: { categories: true },
      orderBy: { publishedAt: 'desc' },
    });
    return posts.map(toPublicPostDto);
  }

  /**
   * A post scheduled for later answers exactly as one that does not exist. A
   * separate "not yet published" would tell an unauthenticated reader that the
   * slug is real and worth coming back to.
   */
  @Public()
  @Get('published/:slug')
  async one(@Param('slug') slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: { categories: true },
    });
    if (
      !post ||
      !isPubliclyVisible(post.status, post.publishedAt, new Date())
    ) {
      throw new NotFoundException('post_not_found');
    }
    return toPublicPostDto(post);
  }
}
