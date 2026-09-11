import type {
  MaterialCategoryDto,
  MaterialDto,
  PublicMaterialDto,
} from '@olesia/shared';
import type {
  Material,
  MaterialCategory,
} from '../../generated/prisma/client';

export function toMaterialCategoryDto(
  c: MaterialCategory,
): MaterialCategoryDto {
  return {
    id: c.id,
    slug: c.slug,
    nameRo: c.nameRo,
    nameEn: c.nameEn,
    nameRu: c.nameRu,
    sortOrder: c.sortOrder,
  };
}

/**
 * The back-office shape: everything, `fileUrl` included.
 *
 * The public one is `toPublicMaterialDto` and it is not the same payload —
 * see the note there.
 */
export function toMaterialDto(
  m: Material & { category: Pick<MaterialCategory, 'slug'> },
): MaterialDto {
  return {
    id: m.id,
    slug: m.slug,
    categoryId: m.categoryId,
    // The storefront filters by slug, so it is denormalised into the payload
    // rather than making every card look its category up by id.
    categorySlug: m.category.slug,
    ageKeys: m.ageKeys,
    titleRo: m.titleRo,
    titleEn: m.titleEn,
    titleRu: m.titleRu,
    descriptionRo: m.descriptionRo,
    descriptionEn: m.descriptionEn,
    descriptionRu: m.descriptionRu,
    pageCount: m.pageCount,
    fileLang: m.fileLang,
    access: m.access as MaterialDto['access'],
    price: m.price,
    flags: m.flags as MaterialDto['flags'],
    fileUrl: m.fileUrl,
    fileName: m.fileName,
    sortOrder: m.sortOrder,
    active: m.active,
  };
}

/**
 * The storefront shape: a paid material never carries its `fileUrl`.
 *
 * Paid PDFs sit in the same public `/uploads` directory as the free ones, so
 * the URL *is* the file (audit A4, F1) — publishing it on an unauthenticated
 * endpoint handed away everything the payment was supposed to buy. Until the
 * paid file moves to private storage and is released by the post-payment link
 * (`PLAN.md` 12c), withholding the URL is what stands between the price and
 * the download.
 */
export function toPublicMaterialDto(
  m: Material & { category: Pick<MaterialCategory, 'slug'> },
): PublicMaterialDto {
  const dto = toMaterialDto(m);
  return dto.access === 'free' ? dto : { ...dto, fileUrl: null };
}
