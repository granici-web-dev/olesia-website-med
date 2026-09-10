/**
 * Blog posts & categories.
 *
 * The wire shapes are the DTOs in `@olesia/shared`; `api.ts` maps them into
 * the view types below. That layer is deliberate, not a placeholder — it is
 * where a shared enum gets narrowed to what this UI actually renders.
 * Mirrors the `Post` / `Category` models in module_calendly.md §7.
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
  /** Child-age taxonomy keys (`@/config/ages`); empty = not age-specific. */
  ageKeys: string[];
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
  | 'ageKeys'
  | 'status'
  | 'publishedAt'
  | 'categoryIds'
>;

export type StatusFilter = 'all' | PostStatus;
