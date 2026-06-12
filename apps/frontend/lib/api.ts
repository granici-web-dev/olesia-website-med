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
  descriptionRo: string;
  descriptionEn: string;
  durationMin: number | null;
  price: number;
  priceLabelRo: string | null;
  priceLabelEn: string | null;
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
  value: string;
  sortOrder: number;
  active: boolean;
}

export interface AboutStat {
  value: string;
  labelRo: string;
  labelEn: string;
}
export interface AboutCredential {
  ro: string;
  en: string;
}
export interface AboutTestimonial {
  quoteRo: string;
  quoteEn: string;
  author: string;
  roleRo: string;
  roleEn: string;
}
export interface AboutFaqItem {
  qRo: string;
  qEn: string;
  aRo: string;
  aEn: string;
}

export interface AboutPageDto {
  id: string;
  titleRo: string;
  titleEn: string;
  contentRo: string;
  contentEn: string;
  images: string[] | null;
  stats: AboutStat[];
  credentials: AboutCredential[];
  testimonials: AboutTestimonial[];
  faq: AboutFaqItem[];
  updatedAt: string;
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
}

export interface PostDto {
  id: string;
  slug: string;
  titleRo: string;
  titleEn: string;
  excerptRo: string | null;
  excerptEn: string | null;
  contentRo: string;
  contentEn: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  categories: PostCategory[];
}

export const api = {
  services: () => getJson<ServiceDto[]>('/services', []),
  contacts: () => getJson<ContactDto[]>('/contacts', []),
  about: () => getJson<AboutPageDto | null>('/about', null),
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
      return l('Întrebare rapidă', 'Quick question');
    default:
      return s.group === 'A_booking'
        ? l('Consultație video', 'Video consultation')
        : l('Acompaniere', 'Support');
  }
}

/** Pick the locale variant of a bilingual `*Ro` / `*En` pair. */
export function loc<T>(locale: string, ro: T, en: T): T {
  return locale === 'en' ? en : ro;
}
