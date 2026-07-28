import type {
  AboutStat,
  AboutCredential,
} from '@olesia/shared';

/**
 * "About us" — a singleton page with bilingual title + markdown content,
 * an image gallery, and structured blocks (stats, credentials)
 * that drive the public page. Mirrors `AboutPageDto` in `packages/shared`.
 * FAQ and testimonials live in their own modules — see `features/faq` and
 * `features/testimonials`.
 */

export type {
  AboutStat,
  AboutCredential,
} from '@olesia/shared';

export interface AboutPage {
  id: string;
  titleRo: string;
  titleEn: string;
  /** RU may be empty — the page saves half-translated; the site falls back to RO. */
  titleRu: string;
  contentRo: string; // markdown
  contentEn: string; // markdown
  contentRu: string; // markdown
  images: string[]; // URLs / data URLs
  stats: AboutStat[];
  credentials: AboutCredential[];
  updatedAt: string;
}

export type AboutInput = Pick<
  AboutPage,
  | 'titleRo'
  | 'titleEn'
  | 'titleRu'
  | 'contentRo'
  | 'contentEn'
  | 'contentRu'
  | 'images'
  | 'stats'
  | 'credentials'
>;
