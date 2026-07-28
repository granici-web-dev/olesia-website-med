/**
 * FAQ sections and questions behind the public /faq page.
 *
 * Mirrors `FaqCategoryDto` / `FaqItemDto` in `packages/shared`. RU is nullable
 * everywhere: the site falls back to Romanian, so a section may ship
 * half-translated rather than blocking the save.
 */

export interface FaqItem {
  id: string;
  categoryId: string;
  questionRo: string;
  questionEn: string;
  questionRu: string | null;
  answerRo: string;
  answerEn: string;
  answerRu: string | null;
  sortOrder: number;
  active: boolean;
}

export interface FaqCategory {
  id: string;
  /** Anchor on the public page (`/faq#programare`). Assigned by the server. */
  slug: string;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  sortOrder: number;
  active: boolean;
  items: FaqItem[];
}

/** Create/update payload for a section — `slug` and `id` stay server-owned. */
export interface FaqCategoryInput {
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  active: boolean;
}

/** Create/update payload for a question. */
export interface FaqItemInput {
  categoryId: string;
  questionRo: string;
  questionEn: string;
  questionRu: string | null;
  answerRo: string;
  answerEn: string;
  answerRu: string | null;
  active: boolean;
}
