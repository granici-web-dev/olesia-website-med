import type { CategoryDto, PostDto } from '@olesia/shared';
import type { Category, Post } from '../../generated/prisma/client';

export function toCategoryDto(c: Category): CategoryDto {
  return {
    id: c.id,
    slug: c.slug,
    nameRo: c.nameRo,
    nameEn: c.nameEn,
    nameRu: c.nameRu,
  };
}

export function toPostDto(p: Post & { categories: Category[] }): PostDto {
  return {
    id: p.id,
    slug: p.slug,
    titleRo: p.titleRo,
    titleEn: p.titleEn,
    titleRu: p.titleRu,
    excerptRo: p.excerptRo,
    excerptEn: p.excerptEn,
    excerptRu: p.excerptRu,
    contentRo: p.contentRo,
    contentEn: p.contentEn,
    contentRu: p.contentRu,
    coverImageUrl: p.coverImageUrl,
    status: p.status as PostDto['status'],
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    authorId: p.authorId,
    categories: p.categories.map(toCategoryDto),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
