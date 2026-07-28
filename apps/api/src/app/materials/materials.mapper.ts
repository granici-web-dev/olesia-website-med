import type { MaterialCategoryDto, MaterialDto } from '@olesia/shared';
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
