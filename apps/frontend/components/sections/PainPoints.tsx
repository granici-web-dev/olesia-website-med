import { Reveal } from '@/components/ui/Reveal';

/** "Cu ce te ajut" — recognizable parenting concerns. Olive band, mirroring
 *  the homepage "Patru pași" (HowItWorks) section. */
export function PainPoints({ locale }: { locale: string }) {
  const t = (ro: string, en: string, ru: string) =>
    locale === 'ru' ? ru : locale === 'en' ? en : ro;
  const items = [
    {
      ro: 'Somn fragmentat',
      en: 'Fragmented sleep',
      ru: 'Прерывистый сон',
      dRo: 'Treziri dese, adormire grea, rutine care nu funcționează.',
      dEn: 'Frequent waking, hard bedtimes, routines that don’t work.',
      dRu: 'Частые пробуждения, трудное засыпание, ритуалы, которые не работают.',
    },
    {
      ro: 'Alimentație & apetit',
      en: 'Eating & appetite',
      ru: 'Питание и аппетит',
      dRo: 'Refuzul legumelor, diversificare, mese tensionate.',
      dEn: 'Veggie refusal, weaning, stressful meals.',
      dRu: 'Отказ от овощей, введение прикорма, напряжение за столом.',
    },
    {
      ro: 'Creștere & dezvoltare',
      en: 'Growth & development',
      ru: 'Рост и развитие',
      dRo: 'Întrebări despre etape, greutate, imunitate.',
      dEn: 'Questions about milestones, weight, immunity.',
      dRu: 'Вопросы об этапах развития, весе и иммунитете.',
    },
    {
      ro: 'Liniștea părintelui',
      en: 'Parent’s peace of mind',
      ru: 'Спокойствие родителей',
      dRo: 'Informație clară, fără presiune și fără mituri.',
      dEn: 'Clear guidance, without pressure or myths.',
      dRu: 'Понятные рекомендации, без давления и мифов.',
    },
  ];
  return (
    <section className="bg-sage-deep text-cream">
      <div className="shell py-20 md:py-28">
        <header className="mb-14 md:mb-16">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
            {t('Susținere', 'Support', 'Поддержка')}
          </p>
          <h2 className="serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.0] tracking-[-0.02em] text-cream text-balance">
            {t('Cu ce te ajut', 'How I can help', 'Чем я помогаю')}
          </h2>
        </header>

        <div className="relative grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line behind the badges — only across the single 4-up row. */}
          <div
            className="pointer-events-none absolute inset-x-0 top-9 hidden h-px bg-[rgba(245,241,234,0.25)] lg:block"
            aria-hidden
          />
          {items.map((it, i) => (
            <Reveal key={i} as="div" className="relative" delay={i * 80}>
              <div className="relative z-10 mb-7 grid size-[72px] place-items-center rounded-full border-[6px] border-[var(--sage-deep)] bg-sage serif text-[2rem] italic leading-none text-cream">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="serif text-[1.7rem] leading-snug text-cream">
                {t(it.ro, it.en, it.ru)}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-cream/75 text-pretty">
                {t(it.dRo, it.dEn, it.dRu)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
