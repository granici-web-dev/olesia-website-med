import { z } from 'zod';

import { ro } from '@/i18n/ro';
import type { AboutPage } from './types';

const a = ro.about;

// RU is optional in every block: these live in JSON columns that predate the
// Russian locale, and the public page falls back to RO for whatever is empty.
const statSchema = z.object({
  value: z.string(),
  labelRo: z.string(),
  labelEn: z.string(),
  labelRu: z.string().optional(),
});

const credentialSchema = z.object({
  ro: z.string(),
  en: z.string(),
  ru: z.string().optional(),
});

const testimonialSchema = z.object({
  quoteRo: z.string(),
  quoteEn: z.string(),
  quoteRu: z.string().optional(),
  author: z.string(),
  roleRo: z.string(),
  roleEn: z.string(),
  roleRu: z.string().optional(),
});

export const aboutFormSchema = z.object({
  titleRo: z.string().trim().min(1, a.missingTitle),
  titleEn: z.string(),
  titleRu: z.string(),
  contentRo: z.string(),
  contentEn: z.string(),
  contentRu: z.string(),
  images: z.array(z.string()),
  stats: z.array(statSchema),
  credentials: z.array(credentialSchema),
  testimonials: z.array(testimonialSchema),
});

export type AboutFormValues = z.infer<typeof aboutFormSchema>;

export function fromAbout(p: AboutPage): AboutFormValues {
  return {
    titleRo: p.titleRo,
    titleEn: p.titleEn,
    titleRu: p.titleRu,
    contentRo: p.contentRo,
    contentEn: p.contentEn,
    contentRu: p.contentRu,
    images: p.images,
    stats: p.stats,
    credentials: p.credentials,
    testimonials: p.testimonials,
  };
}
