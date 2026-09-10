import { Injectable, NotFoundException } from '@nestjs/common';
import type { FaqCategoryDto, FaqItemDto } from '@olesia/shared';
import { slugify } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { toFaqCategoryDto, toFaqItemDto } from './faq.mapper';
import {
  CreateFaqCategoryDto,
  UpdateFaqCategoryDto,
} from './dto/faq-category.dto';
import { CreateFaqItemDto, UpdateFaqItemDto } from './dto/faq-item.dto';

/**
 * A title made entirely of characters we cannot transliterate (e.g. Cyrillic
 * pasted into the Romanian field) would collapse to an empty anchor.
 */
const SECTION_SLUG_FALLBACK = 'sectiune';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public page: only what is published, categories and questions alike. */
  async findPublished(): Promise<FaqCategoryDto[]> {
    const categories = await this.prisma.faqCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    // A section whose questions are all hidden would render as a bare heading
    // and a dead entry in the category nav.
    return categories.filter((c) => c.items.length > 0).map(toFaqCategoryDto);
  }

  /** Back office: everything, including what is currently hidden. */
  async findAll(): Promise<FaqCategoryDto[]> {
    const categories = await this.prisma.faqCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    return categories.map(toFaqCategoryDto);
  }

  async createCategory(dto: CreateFaqCategoryDto): Promise<FaqCategoryDto> {
    const created = await this.prisma.faqCategory.create({
      data: {
        slug: await this.uniqueSlug(
          slugify(dto.titleRo, SECTION_SLUG_FALLBACK),
        ),
        titleRo: dto.titleRo,
        titleEn: dto.titleEn,
        titleRu: dto.titleRu ?? null,
        sortOrder: dto.sortOrder ?? (await this.nextCategoryOrder()),
        active: dto.active ?? true,
      },
      include: { items: true },
    });
    return toFaqCategoryDto(created);
  }

  async updateCategory(
    id: string,
    dto: UpdateFaqCategoryDto,
  ): Promise<FaqCategoryDto> {
    await this.categoryOrThrow(id);
    // `slug` is intentionally not derived again from a renamed title: the
    // anchor is a public URL and outlives the wording of the heading.
    const updated = await this.prisma.faqCategory.update({
      where: { id },
      data: {
        titleRo: dto.titleRo,
        titleEn: dto.titleEn,
        titleRu: dto.titleRu,
        sortOrder: dto.sortOrder,
        active: dto.active,
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    return toFaqCategoryDto(updated);
  }

  /** Deleting a section takes its questions with it (cascade in the schema). */
  async removeCategory(id: string): Promise<void> {
    await this.categoryOrThrow(id);
    await this.prisma.faqCategory.delete({ where: { id } });
  }

  async createItem(dto: CreateFaqItemDto): Promise<FaqItemDto> {
    await this.categoryOrThrow(dto.categoryId);
    const created = await this.prisma.faqItem.create({
      data: {
        categoryId: dto.categoryId,
        questionRo: dto.questionRo,
        questionEn: dto.questionEn,
        questionRu: dto.questionRu ?? null,
        answerRo: dto.answerRo,
        answerEn: dto.answerEn,
        answerRu: dto.answerRu ?? null,
        sortOrder: dto.sortOrder ?? (await this.nextItemOrder(dto.categoryId)),
        active: dto.active ?? true,
      },
    });
    return toFaqItemDto(created);
  }

  async updateItem(id: string, dto: UpdateFaqItemDto): Promise<FaqItemDto> {
    await this.itemOrThrow(id);
    if (dto.categoryId) await this.categoryOrThrow(dto.categoryId);
    const updated = await this.prisma.faqItem.update({
      where: { id },
      data: dto,
    });
    return toFaqItemDto(updated);
  }

  async removeItem(id: string): Promise<void> {
    await this.itemOrThrow(id);
    await this.prisma.faqItem.delete({ where: { id } });
  }

  private async categoryOrThrow(id: string) {
    const category = await this.prisma.faqCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('faq_category_not_found');
    return category;
  }

  private async itemOrThrow(id: string) {
    const item = await this.prisma.faqItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('faq_item_not_found');
    return item;
  }

  /** `programare`, then `programare-2`, `programare-3`, … */
  private async uniqueSlug(base: string): Promise<string> {
    const taken = await this.prisma.faqCategory.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    const set = new Set(taken.map((c) => c.slug));
    if (!set.has(base)) return base;
    let n = 2;
    while (set.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }

  private async nextCategoryOrder(): Promise<number> {
    const last = await this.prisma.faqCategory.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? 0) + 1;
  }

  private async nextItemOrder(categoryId: string): Promise<number> {
    const last = await this.prisma.faqItem.findFirst({
      where: { categoryId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? 0) + 1;
  }
}
