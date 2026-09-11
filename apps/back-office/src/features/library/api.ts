import type { MaterialCategoryDto, MaterialDto } from '@olesia/shared';

import { http } from '@/api/http';
import type {
  Material,
  MaterialCategory,
  MaterialCategoryInput,
  MaterialInput,
  UploadedFileInfo,
} from '@/features/library/types';

/** Real `materials` endpoints; the back office reads the `/all` list. */

function toView(d: MaterialDto): Material {
  return {
    id: d.id,
    slug: d.slug,
    categoryId: d.categoryId,
    categorySlug: d.categorySlug,
    ageKeys: d.ageKeys,
    titleRo: d.titleRo,
    titleEn: d.titleEn,
    titleRu: d.titleRu,
    descriptionRo: d.descriptionRo,
    descriptionEn: d.descriptionEn,
    descriptionRu: d.descriptionRu,
    pageCount: d.pageCount,
    fileLang: d.fileLang,
    access: d.access as Material['access'],
    price: d.price,
    flags: d.flags as Material['flags'],
    fileUrl: d.fileUrl,
    fileKey: d.fileKey,
    fileName: d.fileName,
    sortOrder: d.sortOrder,
    active: d.active,
  };
}

function toCategoryView(d: MaterialCategoryDto): MaterialCategory {
  return {
    id: d.id,
    slug: d.slug,
    nameRo: d.nameRo,
    nameEn: d.nameEn,
    nameRu: d.nameRu,
    sortOrder: d.sortOrder,
  };
}

export async function fetchMaterials(): Promise<Material[]> {
  const list = await http.get<MaterialDto[]>('/materials/all');
  return list.map(toView).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchMaterialCategories(): Promise<MaterialCategory[]> {
  const list = await http.get<MaterialCategoryDto[]>('/materials/categories');
  return list.map(toCategoryView).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createMaterial(input: MaterialInput): Promise<Material> {
  return toView(await http.post<MaterialDto>('/materials', input));
}

export async function updateMaterial(
  id: string,
  input: Partial<MaterialInput> & { sortOrder?: number },
): Promise<Material> {
  return toView(await http.patch<MaterialDto>(`/materials/${id}`, input));
}

export async function deleteMaterial(id: string): Promise<void> {
  await http.del<void>(`/materials/${id}`);
}

export async function createMaterialCategory(
  input: MaterialCategoryInput,
): Promise<MaterialCategory> {
  return toCategoryView(
    await http.post<MaterialCategoryDto>('/materials/categories', input),
  );
}

export async function updateMaterialCategory(
  id: string,
  input: Partial<MaterialCategoryInput>,
): Promise<MaterialCategory> {
  return toCategoryView(
    await http.patch<MaterialCategoryDto>(`/materials/categories/${id}`, input),
  );
}

export async function deleteMaterialCategory(id: string): Promise<void> {
  await http.del<void>(`/materials/categories/${id}`);
}

/**
 * Upload the PDF of a FREE material. Returns the public URL plus the original
 * filename — the storefront links it directly.
 */
export async function uploadMaterialFile(
  file: File,
): Promise<UploadedFileInfo> {
  const form = new FormData();
  form.append('file', file);
  return http.post<UploadedFileInfo>('/materials/file', form);
}

/**
 * Upload the PDF of a PAID material, into private storage. Returns an opaque
 * key rather than a URL: there is no URL, which is the point.
 */
export async function uploadPrivateMaterialFile(
  file: File,
): Promise<UploadedFileInfo> {
  const form = new FormData();
  form.append('file', file);
  return http.post<UploadedFileInfo>('/materials/file/private', form);
}
