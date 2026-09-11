import type { CategoryDto, PostDto, PublicPostDto } from '@olesia/shared';
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

/** The back-office shape: everything, `authorId` and `status` included. */
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
    ageKeys: p.ageKeys,
    status: p.status as PostDto['status'],
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    authorId: p.authorId,
    categories: p.categories.map(toCategoryDto),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

/**
 * The public shape. `authorId` is a `User` primary key (audit A4, F7) — the
 * site renders the practice's single byline from its own copy and has never
 * read it, so publishing an internal account id to anonymous readers bought
 * nothing.
 */
export function toPublicPostDto(
  p: Post & { categories: Category[] },
): PublicPostDto {
  const { authorId: _authorId, ...post } = toPostDto(p);
  return post;
}
