/**
 * Blog posts & categories.
 *
 * TODO(shared): replace with DTOs/enums from `packages/shared` once it exists —
 * mirrors the `Post` / `Category` models in module_calendly.md §7.
 */

export type PostStatus = 'draft' | 'published';

export interface Category {
  id: string;
  slug: string;
  nameRo: string;
  nameEn: string;
  nameRu: string | null;
}

export type CategoryInput = Omit<Category, 'id'>;

export interface Post {
  id: string;
  slug: string;
  titleRo: string;
  titleEn: string;
  /** RU may be empty — an article can be published before it is translated. */
  titleRu: string;
  excerptRo: string;
  excerptEn: string;
  excerptRu: string;
  contentRo: string; // markdown
  contentEn: string; // markdown
  contentRu: string; // markdown
  coverImageUrl: string | null;
  status: PostStatus;
  publishedAt: string | null; // ISO
  categoryIds: string[];
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

/** Editable payload (server owns id / timestamps / author). */
export type PostInput = Pick<
  Post,
  | 'slug'
  | 'titleRo'
  | 'titleEn'
  | 'titleRu'
  | 'excerptRo'
  | 'excerptEn'
  | 'excerptRu'
  | 'contentRo'
  | 'contentEn'
  | 'contentRu'
  | 'coverImageUrl'
  | 'status'
  | 'publishedAt'
  | 'categoryIds'
>;

export type StatusFilter = 'all' | PostStatus;
