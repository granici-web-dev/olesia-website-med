import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CategoryDto, Paginated, PostDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { writeOrTranslate } from '../common/prisma-errors';
import { toPostDto, toCategoryDto } from './blog.mapper';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import type { PostStatus } from '../../generated/prisma/enums';

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
    const post = await writeOrTranslate(() =>
      this.prisma.post.create({
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
          publishedAt: publicationDate(dto.status, dto.publishedAt),
          author: { connect: { id: authorId } },
          categories: { connect: dto.categoryIds.map((id) => ({ id })) },
        },
        include: { categories: true },
      }),
    );
    return toPostDto(post);
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<PostDto> {
    const existing = await this.getPostOrThrow(id);
    const post = await writeOrTranslate(() =>
      this.prisma.post.update({
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
          publishedAt: publicationDateOnUpdate(existing, dto),
          categories: dto.categoryIds
            ? { set: dto.categoryIds.map((cid) => ({ id: cid })) }
            : undefined,
        },
        include: { categories: true },
      }),
    );
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
    return toCategoryDto(
      await writeOrTranslate(() => this.prisma.category.create({ data: dto })),
    );
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    await this.getCategoryOrThrow(id);
    return toCategoryDto(
      await writeOrTranslate(() =>
        this.prisma.category.update({ where: { id }, data: dto }),
      ),
    );
  }

  /**
   * Refused while articles are still filed under it. Post↔Category is an
   * implicit many-to-many, so deleting the row used to succeed and silently
   * drop the join rows with it (audit A4, F8): the articles stayed, their
   * category did not, and nothing said so. Same answer as the material
   * categories, which have had this guard from the start.
   */
  async removeCategory(id: string): Promise<void> {
    await this.getCategoryOrThrow(id);
    const inUse = await this.prisma.post.count({
      where: { categories: { some: { id } } },
    });
    if (inUse > 0) throw new ConflictException('category_in_use');
    await this.prisma.category.delete({ where: { id } });
  }

  private async getCategoryOrThrow(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('category_not_found');
    return category;
  }
}

/**
 * A published post has a date, always.
 *
 * The back office sends one, but nothing enforced it and nothing supplied it
 * (audit A4, F2): a post published through any other caller landed with
 * `publishedAt: null`, which the public list then sorted to the very top and
 * the date-aware filter now hides outright. "Published just now" is the only
 * honest reading of a publish with no date on it.
 */
function publicationDate(
  status: PostStatus,
  requested: string | null | undefined,
): Date | null {
  if (requested) return new Date(requested);
  return status === 'published' ? new Date() : null;
}

/**
 * The same rule for a PATCH, where every field may be absent: an untouched
 * date stays untouched, and only a post that ends up published without one
 * gets today's.
 */
function publicationDateOnUpdate(
  existing: { status: PostStatus; publishedAt: Date | null },
  dto: UpdatePostDto,
): Date | null | undefined {
  if (dto.publishedAt) return new Date(dto.publishedAt);
  const status = dto.status ?? existing.status;
  const cleared = dto.publishedAt === null;
  if (status === 'published' && (cleared || !existing.publishedAt)) {
    return new Date();
  }
  return cleared ? null : undefined;
}
