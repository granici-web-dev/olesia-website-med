import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MaterialCategoryDto, MaterialDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { toMaterialCategoryDto, toMaterialDto } from './materials.mapper';
import {
  CreateMaterialCategoryDto,
  CreateMaterialDto,
  UpdateMaterialCategoryDto,
  UpdateMaterialDto,
} from './dto/material.dto';

/** Romanian diacritics → ASCII, so "Urgențe" slugs as `urgente`. */
const DIACRITICS: Record<string, string> = {
  ă: 'a',
  â: 'a',
  î: 'i',
  ș: 's',
  ş: 's',
  ț: 't',
  ţ: 't',
};

function slugify(value: string): string {
  const ascii = value
    .toLowerCase()
    .replace(/[ăâîșşțţ]/g, (c) => DIACRITICS[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return ascii || 'categorie';
}

const withCategory = { category: { select: { slug: true } } };

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public storefront: published materials only. */
  async findPublished(): Promise<MaterialDto[]> {
    const list = await this.prisma.material.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: withCategory,
    });
    return list.map(toMaterialDto);
  }

  /** Back office: everything, including what is currently hidden. */
  async findAll(): Promise<MaterialDto[]> {
    const list = await this.prisma.material.findMany({
      orderBy: { sortOrder: 'asc' },
      include: withCategory,
    });
    return list.map(toMaterialDto);
  }

  async findCategories(): Promise<MaterialCategoryDto[]> {
    const list = await this.prisma.materialCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toMaterialCategoryDto);
  }

  async create(dto: CreateMaterialDto): Promise<MaterialDto> {
    await this.categoryOrThrow(dto.categoryId);
    await this.assertSlugFree(dto.slug);
    const created = await this.prisma.material.create({
      data: {
        slug: dto.slug,
        categoryId: dto.categoryId,
        ageKeys: dto.ageKeys ?? [],
        titleRo: dto.titleRo,
        titleEn: dto.titleEn,
        titleRu: dto.titleRu ?? null,
        descriptionRo: dto.descriptionRo,
        descriptionEn: dto.descriptionEn,
        descriptionRu: dto.descriptionRu ?? null,
        pageCount: dto.pageCount ?? null,
        fileLang: dto.fileLang ?? null,
        access: dto.access ?? 'free',
        price: dto.price ?? null,
        flags: dto.flags ?? [],
        fileUrl: dto.fileUrl ?? null,
        fileName: dto.fileName ?? null,
        sortOrder: dto.sortOrder ?? (await this.nextSortOrder()),
        active: dto.active ?? true,
      },
      include: withCategory,
    });
    return toMaterialDto(created);
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<MaterialDto> {
    const existing = await this.materialOrThrow(id);
    if (dto.categoryId) await this.categoryOrThrow(dto.categoryId);
    if (dto.slug && dto.slug !== existing.slug) {
      await this.assertSlugFree(dto.slug);
    }
    // Only the keys actually sent are written, so a PATCH that flips `active`
    // cannot blank the description or drop the age tags.
    const updated = await this.prisma.material.update({
      where: { id },
      data: dto,
      include: withCategory,
    });
    return toMaterialDto(updated);
  }

  async remove(id: string): Promise<void> {
    await this.materialOrThrow(id);
    await this.prisma.material.delete({ where: { id } });
  }

  async createCategory(
    dto: CreateMaterialCategoryDto,
  ): Promise<MaterialCategoryDto> {
    const created = await this.prisma.materialCategory.create({
      data: {
        slug: await this.uniqueCategorySlug(slugify(dto.nameRo)),
        nameRo: dto.nameRo,
        nameEn: dto.nameEn,
        nameRu: dto.nameRu ?? null,
        sortOrder: dto.sortOrder ?? (await this.nextCategoryOrder()),
      },
    });
    return toMaterialCategoryDto(created);
  }

  async updateCategory(
    id: string,
    dto: UpdateMaterialCategoryDto,
  ): Promise<MaterialCategoryDto> {
    await this.categoryOrThrow(id);
    // As with the FAQ sections, the slug is not re-derived from a renamed
    // category: it is a public filter value in the URL.
    return toMaterialCategoryDto(
      await this.prisma.materialCategory.update({ where: { id }, data: dto }),
    );
  }

  /** Refused while materials still point at it — nothing is deleted silently. */
  async removeCategory(id: string): Promise<void> {
    await this.categoryOrThrow(id);
    const inUse = await this.prisma.material.count({
      where: { categoryId: id },
    });
    if (inUse > 0) throw new ConflictException('material_category_in_use');
    await this.prisma.materialCategory.delete({ where: { id } });
  }

  private async assertSlugFree(slug: string) {
    const clash = await this.prisma.material.findUnique({ where: { slug } });
    if (clash) throw new ConflictException('material_slug_taken');
  }

  private async materialOrThrow(id: string) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('material_not_found');
    return material;
  }

  private async categoryOrThrow(id: string) {
    const category = await this.prisma.materialCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('material_category_not_found');
    return category;
  }

  private async uniqueCategorySlug(base: string): Promise<string> {
    const taken = await this.prisma.materialCategory.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    const set = new Set(taken.map((c) => c.slug));
    if (!set.has(base)) return base;
    let n = 2;
    while (set.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }

  private async nextSortOrder(): Promise<number> {
    const last = await this.prisma.material.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? 0) + 1;
  }

  private async nextCategoryOrder(): Promise<number> {
    const last = await this.prisma.materialCategory.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? 0) + 1;
  }
}
