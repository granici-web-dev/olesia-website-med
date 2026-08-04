/**
 * Public-site API client. Reads from the live NestJS API's public GET
 * endpoints (no auth). Server-component fetch with ISR revalidation.
 */

const API_URL = process.env.API_URL ?? 'http://localhost:3333/api';

export type ServiceGroup = 'A_booking' | 'B_portal';

export interface ServiceDto {
  id: string;
  code: string;
  group: ServiceGroup;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  descriptionRo: string;
  descriptionEn: string;
  descriptionRu: string | null;
  durationMin: number | null;
  price: number;
  priceLabelRo: string | null;
  priceLabelEn: string | null;
  priceLabelRu: string | null;
  calendlyEventTypeUri: string | null;
  calendlySchedulingUrl: string | null;
  sortOrder: number;
  active: boolean;
}

export interface ContactDto {
  id: string;
  type: 'phone' | 'email' | 'address' | 'social' | 'other';
  labelRo: string;
  labelEn: string;
  labelRu: string | null;
  value: string;
  sortOrder: number;
  active: boolean;
}

// The About blocks live in JSON columns, so their RU keys are optional: rows
// written before the Russian locale existed simply do not carry them.
export interface AboutStat {
  value: string;
  labelRo: string;
  labelEn: string;
  labelRu?: string;
}
export interface AboutCredential {
  ro: string;
  en: string;
  ru?: string;
}
export interface AboutPageDto {
  id: string;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  contentRo: string;
  contentEn: string;
  contentRu: string | null;
  images: string[] | null;
  stats: AboutStat[];
  credentials: AboutCredential[];
  updatedAt: string;
}

/**
 * A parent review. `author` is null for an unsigned one — the site renders a
 * localized neutral label instead, so no review is ever attributed to a name
 * that was not given.
 */
export interface TestimonialDto {
  id: string;
  quoteRo: string;
  quoteEn: string;
  quoteRu: string | null;
  author: string | null;
  roleRo: string | null;
  roleEn: string | null;
  roleRu: string | null;
  source: string | null;
  sortOrder: number;
  active: boolean;
}

/** One replaced site-media file. Absent keys keep the committed asset. */
export interface SiteMediaDto {
  key: string;
  url: string;
  width: number | null;
  height: number | null;
  fileName: string | null;
  updatedAt: string;
}

export interface MaterialCategoryDto {
  id: string;
  slug: string;
  nameRo: string;
  nameEn: string;
  nameRu: string | null;
  sortOrder: number;
}

/**
 * A downloadable library material. `fileUrl` is null while the PDF is still
 * missing — the storefront shows "în curând" rather than a dead download.
 */
export interface MaterialDto {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  /** Keys from the shared child-age taxonomy; empty means "all ages". */
  ageKeys: string[];
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  descriptionRo: string;
  descriptionEn: string;
  descriptionRu: string | null;
  pageCount: number | null;
  /** Language the file itself is written in, e.g. "RO". */
  fileLang: string | null;
  access: 'free' | 'paid';
  /** Whole EUR, paid materials only. */
  price: number | null;
  flags: ('recommended' | 'popular' | 'new')[];
  fileUrl: string | null;
  fileName: string | null;
  sortOrder: number;
  active: boolean;
}

export type MediaKind = 'tv' | 'radio' | 'conference' | 'press';
export type MediaEmbedProvider = 'youtube' | 'facebook';

/**
 * A TV/radio/conference appearance shown on /media. The recording is always
 * embedded from its original publication (`embedRef` is a YouTube video id or
 * a Facebook permalink); the thumbnail is hosted by us, so the page paints
 * without contacting a third party before the visitor consents.
 */
export interface MediaAppearanceDto {
  id: string;
  kind: MediaKind;
  outlet: string;
  show: string | null;
  /** ISO date, or null when the broadcaster never published one. */
  date: string | null;
  duration: string | null;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  summaryRo: string;
  summaryEn: string;
  summaryRu: string | null;
  url: string;
  embedProvider: MediaEmbedProvider;
  embedRef: string;
  thumbUrl: string;
  thumbWidth: number;
  thumbHeight: number;
  sortOrder: number;
  active: boolean;
}

/** One question on the /faq page. RU is nullable; readers fall back to RO. */
export interface FaqItemDto {
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

/** A section of the FAQ page; `slug` is its anchor (`/faq#programare`). */
export interface FaqCategoryDto {
  id: string;
  slug: string;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  sortOrder: number;
  active: boolean;
  items: FaqItemDto[];
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export interface PostCategory {
  id: string;
  slug: string;
  nameRo: string;
  nameEn: string;
  nameRu: string | null;
}

export interface PostDto {
  id: string;
  slug: string;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  excerptRo: string | null;
  excerptEn: string | null;
  excerptRu: string | null;
  contentRo: string;
  contentEn: string;
  contentRu: string | null;
  coverImageUrl: string | null;
  /** Child-age taxonomy keys (`lib/age-taxonomy.ts`); empty = every age. */
  ageKeys: string[];
  publishedAt: string | null;
  categories: PostCategory[];
}

export const api = {
  services: () => getJson<ServiceDto[]>('/services', []),
  contacts: () => getJson<ContactDto[]>('/contacts', []),
  about: () => getJson<AboutPageDto | null>('/about', null),
  faq: () => getJson<FaqCategoryDto[]>('/faq', []),
  testimonials: () => getJson<TestimonialDto[]>('/testimonials', []),
  mediaAppearances: () =>
    getJson<MediaAppearanceDto[]>('/media-appearances', []),
  materials: () => getJson<MaterialDto[]>('/materials', []),
  siteMedia: () => getJson<SiteMediaDto[]>('/site-media', []),
  materialCategories: () =>
    getJson<MaterialCategoryDto[]>('/materials/categories', []),
  posts: () => getJson<PostDto[]>('/blog/published', []),
  post: (slug: string) =>
    getJson<PostDto | null>(`/blog/published/${slug}`, null),
};

/** Short category tag for a service (shown above its title in service rows). */
export function serviceTag(locale: string, s: ServiceDto): string {
  const l = (ro: string, en: string) => (locale === 'en' ? en : ro);
  switch (s.code) {
    case 'pediatric':
      return l('Pediatrie', 'Pediatrics');
    case 'nutrition':
      return l('Nutriție', 'Nutrition');
    case 'integrative':
      return l('Integrativ & monitorizare', 'Integrative & monitoring');
    case 'monitoring':
      return l('Acompaniere', 'Support');
    case 'quick_question':
      return l('Întrebare EXPRESS', 'Express question');
    default:
      return s.group === 'A_booking'
        ? l('Consultație video', 'Video consultation')
        : l('Acompaniere', 'Support');
  }
}

/**
 * Pick the locale variant of a `*Ro` / `*En` / `*Ru` triple.
 *
 * Romanian is the fallback, and an empty string counts as missing just like
 * `null`: the back office writes `''` for a field the doctor left blank, and a
 * blank heading on the public page would be worse than a Romanian one.
 */
export function loc(
  locale: string,
  ro: string,
  en?: string | null,
  ru?: string | null,
): string {
  const pick = locale === 'ru' ? ru : locale === 'en' ? en : ro;
  return pick?.trim() ? pick : ro;
}
