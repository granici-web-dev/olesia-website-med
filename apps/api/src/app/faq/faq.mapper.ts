import type { FaqCategoryDto, FaqItemDto } from '@olesia/shared';
import type { FaqCategory, FaqItem } from '../../generated/prisma/client';

export function toFaqItemDto(i: FaqItem): FaqItemDto {
  return {
    id: i.id,
    categoryId: i.categoryId,
    questionRo: i.questionRo,
    questionEn: i.questionEn,
    questionRu: i.questionRu,
    answerRo: i.answerRo,
    answerEn: i.answerEn,
    answerRu: i.answerRu,
    sortOrder: i.sortOrder,
    active: i.active,
  };
}

export function toFaqCategoryDto(
  c: FaqCategory & { items: FaqItem[] },
): FaqCategoryDto {
  return {
    id: c.id,
    slug: c.slug,
    titleRo: c.titleRo,
    titleEn: c.titleEn,
    titleRu: c.titleRu,
    sortOrder: c.sortOrder,
    active: c.active,
    items: c.items.map(toFaqItemDto),
  };
}
