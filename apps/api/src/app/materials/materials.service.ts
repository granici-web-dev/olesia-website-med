import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  MaterialCategoryDto,
  MaterialDto,
  PublicMaterialDto,
} from '@olesia/shared';
import { slugify } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
import {
  toMaterialCategoryDto,
  toMaterialDto,
  toPublicMaterialDto,
} from './materials.mapper';
import {
  CreateMaterialCategoryDto,
  CreateMaterialDto,
  UpdateMaterialCategoryDto,
  UpdateMaterialDto,
} from './dto/material.dto';

/** A category named in a script we cannot transliterate still needs a slug. */
const CATEGORY_SLUG_FALLBACK = 'categorie';

/**
 * The two file columns, of which a material may hold exactly one.
 *
 * A free material's PDF is a public URL under `/uploads`; a paid one's is an
 * opaque key in `PRIVATE_UPLOADS_DIR`, released only by a `MaterialGrant`.
 * Writing both would put a paid file back on the public route, which is the
 * exact failure this step exists to close (audit A4, F1). The column that does
 * not apply is nulled rather than left alone, so a material that changes hands
 * between the two cannot keep a stale pointer into the other store.
 */
function fileColumnsFor(
  access: string,
  fileUrl: string | null | undefined,
  fileKey: string | null | undefined,
): { fileUrl: string | null; fileKey: string | null } {
  return access === 'paid'
    ? { fileUrl: null, fileKey: fileKey ?? null }
    : { fileUrl: fileUrl ?? null, fileKey: null };
}

const withCategory = { category: { select: { slug: true } } };

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public storefront: published materials only. */
  async findPublished(): Promise<PublicMaterialDto[]> {
    const list = await this.prisma.material.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: withCategory,
    });
    return list.map(toPublicMaterialDto);
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
    const sortOrder = dto.sortOrder ?? (await this.nextSortOrder());
    const created = await writeOrTranslate(() =>
      this.prisma.material.create({
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
          ...fileColumnsFor(dto.access ?? 'free', dto.fileUrl, dto.fileKey),
          fileName: dto.fileName ?? null,
          sortOrder,
          active: dto.active ?? true,
        },
        include: withCategory,
      }),
    );
    return toMaterialDto(created);
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<MaterialDto> {
    const existing = await this.materialOrThrow(id);
    if (dto.categoryId) await this.categoryOrThrow(dto.categoryId);
    if (dto.slug && dto.slug !== existing.slug) {
      await this.assertSlugFree(dto.slug);
    }
    // Only the keys actually sent are written, so a PATCH that flips `active`
    // cannot blank the description or drop the age tags. The exception is the
    // pair of file columns: flipping `access` clears the file rather than
    // moving bytes between two volumes, because the two are separate volumes
    // in docker-compose.prod.yml and a copy-plus-unlink can half-fail. The
    // storefront already renders a material with no file honestly, as
    // "în curând", so asking for it again is a visible, recoverable state.
    const access = dto.access ?? existing.access;
    const data =
      dto.access && dto.access !== existing.access
        ? { ...dto, fileUrl: null, fileKey: null, fileName: null }
        : { ...dto, ...fileColumnsFor(access, dto.fileUrl, dto.fileKey) };

    const updated = await writeOrTranslate(() =>
      this.prisma.material.update({
        where: { id },
        data,
        include: withCategory,
      }),
    );
    return toMaterialDto(updated);
  }

  async remove(id: string): Promise<void> {
    await this.materialOrThrow(id);
    await this.prisma.material.delete({ where: { id } });
  }

  async createCategory(
    dto: CreateMaterialCategoryDto,
  ): Promise<MaterialCategoryDto> {
    const slug = await this.uniqueCategorySlug(
      slugify(dto.nameRo, CATEGORY_SLUG_FALLBACK),
    );
    const sortOrder = dto.sortOrder ?? (await this.nextCategoryOrder());
    const created = await writeOrTranslate(() =>
      this.prisma.materialCategory.create({
        data: {
          slug,
          nameRo: dto.nameRo,
          nameEn: dto.nameEn,
          nameRu: dto.nameRu ?? null,
          sortOrder,
        },
      }),
    );
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
      await writeOrTranslate(() =>
        this.prisma.materialCategory.update({ where: { id }, data: dto }),
      ),
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
