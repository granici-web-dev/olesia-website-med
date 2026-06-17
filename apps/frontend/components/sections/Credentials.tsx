import type { AboutStat } from '@/lib/api';
import { Reveal } from '@/components/ui/Reveal';

/** Trust strip: experience stats. Olive band (like the homepage). Editable
 *  from the back office. */
export function Credentials({
  locale,
  stats,
}: {
  locale: string;
  stats: AboutStat[];
}) {
  const t = (ro: string, en: string) => (locale === 'en' ? en : ro);
  if (stats.length === 0) return null;

  return (
    <section className="bg-sage-deep text-cream">
      <div className="shell py-16 md:py-20">
        <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={i} as="div" delay={i * 70}>
              <div className="serif text-[clamp(2.2rem,4vw,3.2rem)] leading-none text-[var(--gold)]">
                {s.value}
              </div>
              <div className="mt-2 text-[0.9rem] text-cream/70">
                {t(s.labelRo, s.labelEn)}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
