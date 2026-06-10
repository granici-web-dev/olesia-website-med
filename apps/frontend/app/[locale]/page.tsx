import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Services } from '@/components/sections/Services';
import { About } from '@/components/sections/About';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Services />
      <About />
    </main>
  );
}