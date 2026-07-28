/**
 * Biblioteca digitală — downloadable materials behind the public /guides page.
 * Mirrors `MaterialDto` / `MaterialCategoryDto` in `packages/shared`.
 */

export const MATERIAL_ACCESS = ['free', 'paid'] as const;
export type MaterialAccess = (typeof MATERIAL_ACCESS)[number];

export const MATERIAL_FLAGS = ['recommended', 'popular', 'new'] as const;
export type MaterialFlag = (typeof MATERIAL_FLAGS)[number];

/** Shared child-age taxonomy; the same keys will tag blog posts. */
export const AGE_KEYS = [
  '0-6m',
  '6-12m',
  '1-3y',
  '3-6y',
  '6-12y',
  'adolescent',
] as const;
export type AgeKey = (typeof AGE_KEYS)[number];

export interface MaterialCategory {
  id: string;
  slug: string;
  nameRo: string;
  nameEn: string;
  nameRu: string | null;
  sortOrder: number;
}

export interface Material {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  /** Empty means the material is not age-specific. */
  ageKeys: string[];
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  descriptionRo: string;
  descriptionEn: string;
  descriptionRu: string | null;
  pageCount: number | null;
  fileLang: string | null;
  access: MaterialAccess;
  /** Whole EUR, paid materials only. */
  price: number | null;
  flags: MaterialFlag[];
  /** Null until the PDF is uploaded — the site then shows "în curând". */
  fileUrl: string | null;
  fileName: string | null;
  sortOrder: number;
  active: boolean;
}

export type MaterialInput = Omit<Material, 'id' | 'sortOrder' | 'categorySlug'>;

export type MaterialCategoryInput = Omit<
  MaterialCategory,
  'id' | 'slug' | 'sortOrder'
>;

/** What the file-upload endpoint returns. */
export interface UploadedFileInfo {
  url: string;
  name: string;
}
