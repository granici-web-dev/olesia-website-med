import type {
  AboutPageDto,
  AboutStat,
  AboutCredential,
  AboutTestimonial,
  AboutFaqItem,
} from '@olesia/shared';
import type { AboutPage } from '../../generated/prisma/client';

/** Prisma `Json?` columns come back as `unknown`; coerce to a typed array. */
function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function toAboutDto(a: AboutPage): AboutPageDto {
  return {
    id: a.id,
    titleRo: a.titleRo,
    titleEn: a.titleEn,
    contentRo: a.contentRo,
    contentEn: a.contentEn,
    images: (a.images as string[] | null) ?? null,
    stats: asArray<AboutStat>(a.stats),
    credentials: asArray<AboutCredential>(a.credentials),
    testimonials: asArray<AboutTestimonial>(a.testimonials),
    faq: asArray<AboutFaqItem>(a.faq),
    updatedAt: a.updatedAt.toISOString(),
  };
}
