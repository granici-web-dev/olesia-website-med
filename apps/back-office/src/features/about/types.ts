import type {
  AboutStat,
  AboutCredential,
  AboutTestimonial,
  AboutFaqItem,
} from '@olesia/shared';

/**
 * "About us" — a singleton page with bilingual title + markdown content,
 * an image gallery, and structured blocks (stats, credentials, testimonials,
 * FAQ) that drive the public page. Mirrors `AboutPageDto` in `packages/shared`.
 */

export type {
  AboutStat,
  AboutCredential,
  AboutTestimonial,
  AboutFaqItem,
} from '@olesia/shared';

export interface AboutPage {
  id: string;
  titleRo: string;
  titleEn: string;
  contentRo: string; // markdown
  contentEn: string; // markdown
  images: string[]; // URLs / data URLs
  stats: AboutStat[];
  credentials: AboutCredential[];
  testimonials: AboutTestimonial[];
  faq: AboutFaqItem[];
  updatedAt: string;
}

export type AboutInput = Pick<
  AboutPage,
  | 'titleRo'
  | 'titleEn'
  | 'contentRo'
  | 'contentEn'
  | 'images'
  | 'stats'
  | 'credentials'
  | 'testimonials'
  | 'faq'
>;
