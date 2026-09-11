import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Services } from '@/components/sections/Services';
import { Testimonials } from '@/components/sections/Testimonials';
import { About } from '@/components/sections/About';
import { JsonLd } from '@/components/ui/JsonLd';
import { ApiUnavailableError, api } from '@/lib/api';
import { pageMetadata } from '@/lib/page-metadata';
import { siteMediaAsset } from '@/lib/site-media';
import { physicianJsonLd } from '@/lib/structured-data';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  return pageMetadata({
    locale,
    path: '',
    title: ru
      ? 'Dr. Olesea Jalba — Педиатрия и нутрициология'
      : en
        ? 'Dr. Olesea Jalba — Pediatrics & Nutrition'
        : 'Dr. Olesea Jalba — Pediatrie & Nutriție',
    description: ru
      ? 'Онлайн-консультации педиатра и нутрициолога. Видеозвонок, письменный план, долгосрочное наблюдение.'
      : en
        ? 'Online pediatrics and nutrition consultations. Video call, written plan, long-term follow-up.'
        : 'Consultații pediatrice și de nutriție online. Apel video, plan scris, urmărire pe termen lung.',
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [testimonials, contacts, portrait, hours] = await Promise.all([
    api.testimonials(),
    api.contacts(),
    siteMediaAsset('portrait_about'),
    // The schedule is a required singleton, so an outage throws where every
    // other read here returns an empty answer. A missing `openingHoursSpecification`
    // is not worth failing the home page over.
    api.workingHours().catch((e: unknown) => {
      if (e instanceof ApiUnavailableError) return null;
      throw e;
    }),
  ]);

  return (
    <main>
      <JsonLd
        data={physicianJsonLd({
          locale,
          path: '',
          contacts,
          hours,
          imageUrl: portrait.url,
        })}
      />
      <Hero />
      <HowItWorks />
      <Services />
      <Testimonials locale={locale} items={testimonials} />
      <About />
    </main>
  );
}
