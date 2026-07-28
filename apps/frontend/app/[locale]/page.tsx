import { getLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Services } from '@/components/sections/Services';
import { Testimonials } from '@/components/sections/Testimonials';
import { About } from '@/components/sections/About';
import { api } from '@/lib/api';

export default async function HomePage() {
  const [locale, testimonials] = await Promise.all([
    getLocale(),
    api.testimonials(),
  ]);

  return (
    <main>
      <Hero />
      <HowItWorks />
      <Services />
      <Testimonials locale={locale} items={testimonials} />
      <About />
    </main>
  );
}
