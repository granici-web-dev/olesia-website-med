import type {
  MaterialCategoryDto,
  MaterialDto,
  PublicMaterialDto,
} from '@olesia/shared';
import type { Material, MaterialCategory } from '../../generated/prisma/client';

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
    fileKey: m.fileKey,
    fileName: m.fileName,
    sortOrder: m.sortOrder,
    active: m.active,
  };
}

/**
 * The storefront shape: neither file column for a paid material, and `hasFile`
 * instead.
 *
 * Withholding `fileUrl` used to be all that stood between the price and the
 * download, and the comment here said so: the paid PDFs sat in the same public
 * `/uploads` directory as the free ones, so the URL *was* the file (audit A4,
 * F1). That is closed — a paid file lives in private storage under `fileKey`
 * and is released by a `MaterialGrant` — and the key is withheld too, not
 * because it is dangerous on its own but because the storefront has no use for
 * it. What the storefront does need is whether a file exists at all, which
 * decides between a card that sells and one that says "în curând".
 */
export function toPublicMaterialDto(
  m: Material & { category: Pick<MaterialCategory, 'slug'> },
): PublicMaterialDto {
  const { fileKey, ...dto } = toMaterialDto(m);
  const paid = dto.access === 'paid';
  return {
    ...dto,
    fileUrl: paid ? null : dto.fileUrl,
    hasFile: Boolean(paid ? fileKey : dto.fileUrl),
  };
}
