import { Injectable, NotFoundException } from '@nestjs/common';
import type { FaqCategoryDto, FaqItemDto } from '@olesia/shared';
import { slugify } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
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

/**
 * The anchor is `/faq#<slug>` and the slug is derived from a 200-character
 * heading, so without this a section could carry a 200-character URL fragment
 * (audit A5, F6). Cut before the uniqueness check, not after: truncating a
 * slug that was already proved unique can collide with an existing one.
 */
const MAX_SLUG_LENGTH = 120;

/**
 * `sortOrder` is client-editable and is not unique, so ties were resolved by
 * whatever order Postgres felt like returning — two sections both at 0 could
 * swap places between two loads of the same page (audit A5, F16). Creation
 * order is the tie-break the client would expect, and it is stable.
 */
const FAQ_ORDER = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
] as const satisfies { sortOrder?: 'asc'; createdAt?: 'asc' }[];

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public page: only what is published, categories and questions alike. */
  async findPublished(): Promise<FaqCategoryDto[]> {
    const categories = await this.prisma.faqCategory.findMany({
      where: { active: true },
      orderBy: FAQ_ORDER,
      include: {
        items: { where: { active: true }, orderBy: FAQ_ORDER },
      },
    });
    // A section whose questions are all hidden would render as a bare heading
    // and a dead entry in the category nav.
    return categories.filter((c) => c.items.length > 0).map(toFaqCategoryDto);
  }

  /** Back office: everything, including what is currently hidden. */
  async findAll(): Promise<FaqCategoryDto[]> {
    const categories = await this.prisma.faqCategory.findMany({
      orderBy: FAQ_ORDER,
      include: { items: { orderBy: FAQ_ORDER } },
    });
    return categories.map(toFaqCategoryDto);
  }

  async createCategory(dto: CreateFaqCategoryDto): Promise<FaqCategoryDto> {
    const slug = await this.uniqueSlug(
      slugify(dto.titleRo, SECTION_SLUG_FALLBACK).slice(0, MAX_SLUG_LENGTH),
    );
    const sortOrder = dto.sortOrder ?? (await this.nextCategoryOrder());

    // `uniqueSlug` reads and this writes, so two sections created with the
    // same heading at the same moment both pass the check and the second one
    // reaches Postgres' unique index. That used to be a 500 (audit A5, F9).
    const created = await writeOrTranslate(() =>
      this.prisma.faqCategory.create({
        data: {
          slug,
          titleRo: dto.titleRo,
          titleEn: dto.titleEn,
          titleRu: dto.titleRu ?? null,
          sortOrder,
          active: dto.active ?? true,
        },
        include: { items: true },
      }),
    );
    return toFaqCategoryDto(created);
  }

  async updateCategory(
    id: string,
    dto: UpdateFaqCategoryDto,
  ): Promise<FaqCategoryDto> {
    await this.categoryOrThrow(id);
    // `slug` is intentionally not derived again from a renamed title: the
    // anchor is a public URL and outlives the wording of the heading.
    const updated = await writeOrTranslate(() =>
      this.prisma.faqCategory.update({
        where: { id },
        data: {
          titleRo: dto.titleRo,
          titleEn: dto.titleEn,
          titleRu: dto.titleRu,
          sortOrder: dto.sortOrder,
          active: dto.active,
        },
        include: { items: { orderBy: FAQ_ORDER } },
      }),
    );
    return toFaqCategoryDto(updated);
  }

  /** Deleting a section takes its questions with it (cascade in the schema). */
  async removeCategory(id: string): Promise<void> {
    await this.categoryOrThrow(id);
    await writeOrTranslate(() =>
      this.prisma.faqCategory.delete({ where: { id } }),
    );
  }

  async createItem(dto: CreateFaqItemDto): Promise<FaqItemDto> {
    await this.categoryOrThrow(dto.categoryId);
    const sortOrder =
      dto.sortOrder ?? (await this.nextItemOrder(dto.categoryId));
    const created = await writeOrTranslate(() =>
      this.prisma.faqItem.create({
        data: {
          categoryId: dto.categoryId,
          questionRo: dto.questionRo,
          questionEn: dto.questionEn,
          questionRu: dto.questionRu ?? null,
          answerRo: dto.answerRo,
          answerEn: dto.answerEn,
          answerRu: dto.answerRu ?? null,
          sortOrder,
          active: dto.active ?? true,
        },
      }),
    );
    return toFaqItemDto(created);
  }

  async updateItem(id: string, dto: UpdateFaqItemDto): Promise<FaqItemDto> {
    await this.itemOrThrow(id);
    if (dto.categoryId) await this.categoryOrThrow(dto.categoryId);
    const updated = await writeOrTranslate(() =>
      this.prisma.faqItem.update({ where: { id }, data: dto }),
    );
    return toFaqItemDto(updated);
  }

  async removeItem(id: string): Promise<void> {
    await this.itemOrThrow(id);
    await writeOrTranslate(() => this.prisma.faqItem.delete({ where: { id } }));
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
