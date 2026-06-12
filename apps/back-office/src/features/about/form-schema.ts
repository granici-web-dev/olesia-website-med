import { z } from 'zod';

import { ro } from '@/i18n/ro';
import type { AboutPage } from './types';

const a = ro.about;

const statSchema = z.object({
  value: z.string(),
  labelRo: z.string(),
  labelEn: z.string(),
});

const credentialSchema = z.object({
  ro: z.string(),
  en: z.string(),
});

const testimonialSchema = z.object({
  quoteRo: z.string(),
  quoteEn: z.string(),
  author: z.string(),
  roleRo: z.string(),
  roleEn: z.string(),
});

const faqSchema = z.object({
  qRo: z.string(),
  qEn: z.string(),
  aRo: z.string(),
  aEn: z.string(),
});

export const aboutFormSchema = z.object({
  titleRo: z.string().trim().min(1, a.missingTitle),
  titleEn: z.string(),
  contentRo: z.string(),
  contentEn: z.string(),
  images: z.array(z.string()),
  stats: z.array(statSchema),
  credentials: z.array(credentialSchema),
  testimonials: z.array(testimonialSchema),
  faq: z.array(faqSchema),
});

export type AboutFormValues = z.infer<typeof aboutFormSchema>;

export function fromAbout(p: AboutPage): AboutFormValues {
  return {
    titleRo: p.titleRo,
    titleEn: p.titleEn,
    contentRo: p.contentRo,
    contentEn: p.contentEn,
    images: p.images,
    stats: p.stats,
    credentials: p.credentials,
    testimonials: p.testimonials,
    faq: p.faq,
  };
}
