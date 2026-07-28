import type { FaqCategoryDto, FaqItemDto } from '@olesia/shared';

import { http } from '@/api/http';
import type {
  FaqCategory,
  FaqCategoryInput,
  FaqItem,
  FaqItemInput,
} from '@/features/faq/types';

/**
 * Real `faq` endpoints. The back office reads `/faq/all`, not the public
 * `/faq`: the latter serves the site and hides everything deactivated, which
 * is exactly what has to stay visible (and editable) here.
 */

function toItemView(d: FaqItemDto): FaqItem {
  return {
    id: d.id,
    categoryId: d.categoryId,
    questionRo: d.questionRo,
    questionEn: d.questionEn,
    questionRu: d.questionRu,
    answerRo: d.answerRo,
    answerEn: d.answerEn,
    answerRu: d.answerRu,
    sortOrder: d.sortOrder,
    active: d.active,
  };
}

function toCategoryView(d: FaqCategoryDto): FaqCategory {
  return {
    id: d.id,
    slug: d.slug,
    titleRo: d.titleRo,
    titleEn: d.titleEn,
    titleRu: d.titleRu,
    sortOrder: d.sortOrder,
    active: d.active,
    items: d.items.map(toItemView).sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export async function fetchFaq(): Promise<FaqCategory[]> {
  const list = await http.get<FaqCategoryDto[]>('/faq/all');
  return list.map(toCategoryView).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createFaqCategory(
  input: FaqCategoryInput,
): Promise<FaqCategory> {
  return toCategoryView(
    await http.post<FaqCategoryDto>('/faq/categories', input),
  );
}

export async function updateFaqCategory(
  id: string,
  input: Partial<FaqCategoryInput> & { sortOrder?: number },
): Promise<FaqCategory> {
  return toCategoryView(
    await http.patch<FaqCategoryDto>(`/faq/categories/${id}`, input),
  );
}

export async function deleteFaqCategory(id: string): Promise<void> {
  await http.del<void>(`/faq/categories/${id}`);
}

export async function createFaqItem(input: FaqItemInput): Promise<FaqItem> {
  return toItemView(await http.post<FaqItemDto>('/faq/items', input));
}

export async function updateFaqItem(
  id: string,
  input: Partial<FaqItemInput> & { sortOrder?: number },
): Promise<FaqItem> {
  return toItemView(await http.patch<FaqItemDto>(`/faq/items/${id}`, input));
}

export async function deleteFaqItem(id: string): Promise<void> {
  await http.del<void>(`/faq/items/${id}`);
}
