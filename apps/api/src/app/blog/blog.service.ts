import { Injectable, NotFoundException } from '@nestjs/common';
import type { CategoryDto, Paginated, PostDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { toPostDto, toCategoryDto } from './blog.mapper';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  /* ------------------------------- posts ------------------------------ */

  async findAllPosts(query: PaginationQueryDto): Promise<Paginated<PostDto>> {
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        include: { categories: true },
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.post.count(),
    ]);
    return paginate(items.map(toPostDto), total, query);
  }

  async findPost(id: string): Promise<PostDto> {
    return toPostDto(await this.getPostOrThrow(id));
  }

  async createPost(dto: CreatePostDto, authorId: string): Promise<PostDto> {
    const post = await this.prisma.post.create({
      data: {
        slug: dto.slug,
        titleRo: dto.titleRo,
        titleEn: dto.titleEn,
        titleRu: dto.titleRu ?? null,
        excerptRo: dto.excerptRo ?? null,
        excerptEn: dto.excerptEn ?? null,
        excerptRu: dto.excerptRu ?? null,
        contentRo: dto.contentRo,
        contentEn: dto.contentEn,
        contentRu: dto.contentRu ?? null,
        coverImageUrl: dto.coverImageUrl ?? null,
        ageKeys: dto.ageKeys ?? [],
        status: dto.status,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
        author: { connect: { id: authorId } },
        categories: { connect: dto.categoryIds.map((id) => ({ id })) },
      },
      include: { categories: true },
    });
    return toPostDto(post);
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<PostDto> {
    await this.getPostOrThrow(id);
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        slug: dto.slug,
        titleRo: dto.titleRo,
        titleEn: dto.titleEn,
        titleRu: dto.titleRu,
        excerptRo: dto.excerptRo,
        excerptEn: dto.excerptEn,
        excerptRu: dto.excerptRu,
        contentRo: dto.contentRo,
        contentEn: dto.contentEn,
        contentRu: dto.contentRu,
        coverImageUrl: dto.coverImageUrl,
        ageKeys: dto.ageKeys,
        status: dto.status,
        publishedAt:
          dto.publishedAt === undefined
            ? undefined
            : dto.publishedAt
              ? new Date(dto.publishedAt)
              : null,
        categories: dto.categoryIds
          ? { set: dto.categoryIds.map((cid) => ({ id: cid })) }
          : undefined,
      },
      include: { categories: true },
    });
    return toPostDto(post);
  }

  async removePost(id: string): Promise<void> {
    await this.getPostOrThrow(id);
    await this.prisma.post.delete({ where: { id } });
  }

  private async getPostOrThrow(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { categories: true },
    });
    if (!post) throw new NotFoundException('post_not_found');
    return post;
  }

  /* ----------------------------- categories --------------------------- */

  async findAllCategories(): Promise<CategoryDto[]> {
    const list = await this.prisma.category.findMany({
      orderBy: { nameRo: 'asc' },
    });
    return list.map(toCategoryDto);
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryDto> {
    return toCategoryDto(await this.prisma.category.create({ data: dto }));
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    await this.getCategoryOrThrow(id);
    return toCategoryDto(
      await this.prisma.category.update({ where: { id }, data: dto }),
    );
  }

  async removeCategory(id: string): Promise<void> {
    await this.getCategoryOrThrow(id);
    await this.prisma.category.delete({ where: { id } });
  }

  private async getCategoryOrThrow(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('category_not_found');
    return category;
  }
}
