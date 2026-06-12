import Link from 'next/link';
import { api, loc, serviceTag, type ServiceDto } from '../../../lib/api';
import { PainPoints } from '@/components/sections/PainPoints';
import { FreeConsult } from '@/components/sections/FreeConsult';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import type { LeadService } from '@/lib/leads';

export const revalidate = 60;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const all = (await api.services()).filter((s) => s.active);
  const booking = all.filter((s) => s.group === 'A_booking');
  const portal = all.filter((s) => s.group === 'B_portal');

  const t = {
    eyebrow: loc(locale, 'Servicii', 'Services'),
    title: loc(
      locale,
      'Consultații pentru sănătatea copilului',
      'Care for your child’s health',
    ),
    intro: loc(
      locale,
      'O abordare integrativă: pediatrie, nutriție și monitorizare, cu timp și atenție pentru fiecare familie.',
      'An integrative approach: pediatrics, nutrition and monitoring, with time and attention for every family.',
    ),
    bookingTitle: loc(locale, 'Consultații video', 'Video consultations'),
    portalTitle: loc(locale, 'Acompaniere & întrebări', 'Support & questions'),
    book: loc(locale, 'Programează', 'Book'),
    learn: loc(locale, 'Află mai mult', 'Learn more'),
    seePricing: loc(locale, 'Vezi tarifele', 'See pricing'),
    min: loc(locale, 'min', 'min'),
  };

  /** A descriptive service row — information first, no price (see /pricing). */
  const row = (s: ServiceDto, cta: string) => (
    <article
      key={s.id}
      className="grid grid-cols-1 gap-5 border-b border-[var(--rule)] py-10 md:grid-cols-[1fr_1.5fr] md:gap-16 md:py-14"
    >
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-sage">
          {serviceTag(locale, s)}
        </div>
        <h3 className="serif mt-3 text-[clamp(1.7rem,2.6vw,2.4rem)] leading-tight tracking-[-0.01em]">
          {loc(locale, s.titleRo, s.titleEn)}
        </h3>
        {s.durationMin ? (
          <p className="mono mt-3 text-xs text-ink-soft">
            {s.durationMin} {t.min}
          </p>
        ) : null}
      </div>
      <div>
        <p className="max-w-[62ch] text-[1.05rem] leading-relaxed text-ink-soft text-pretty">
          {loc(locale, s.descriptionRo, s.descriptionEn)}
        </p>
        {s.group === 'A_booking' && s.calendlySchedulingUrl ? (
          <CalendlyButton
            url={s.calendlySchedulingUrl}
            reason={loc(locale, s.titleRo, s.titleEn)}
            label={cta}
            className="mt-6 inline-block cursor-pointer border-b border-ink pb-0.5 text-sm transition-colors hover:border-sage hover:text-sage"
          />
        ) : s.group === 'B_portal' ? (
          <BookGroupBButton
            service={s.code as LeadService}
            label={`${cta} →`}
            className="mt-6 inline-block cursor-pointer border-b border-ink pb-0.5 text-sm transition-colors hover:border-sage hover:text-sage"
          />
        ) : (
          <Link
            href={`/${locale}/contact`}
            className="mt-6 inline-block border-b border-ink pb-0.5 text-sm transition-colors hover:border-sage hover:text-sage"
          >
            {cta} →
          </Link>
        )}
      </div>
    </article>
  );

  return (
    <main className="bg-cream text-ink">
      {/* Hero */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="serif mt-4 max-w-[14ch] text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.04] tracking-[-0.02em] text-balance">
            {t.title}
          </h1>
          <p className="mt-6 max-w-[52ch] text-[1.05rem] leading-relaxed text-ink-soft text-pretty">
            {t.intro}
          </p>
          <Link
            href={`/${locale}/pricing`}
            className="mt-7 inline-block border-b border-ink pb-0.5 text-sm transition-colors hover:border-sage hover:text-sage"
          >
            {t.seePricing} →
          </Link>
        </div>
      </section>

      <PainPoints locale={locale} />

      {/* Video consultations — described, not priced. */}
      <section className="shell py-16 md:py-24">
        <h2 className="serif text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.01em]">
          {t.bookingTitle}
        </h2>
        <div className="mt-8 border-t border-[var(--rule)]">
          {booking.map((s) => row(s, t.book))}
        </div>
      </section>

      {/* Support & portal services — described, not priced. */}
      {portal.length > 0 && (
        <section className="shell pb-16 md:pb-24">
          <h2 className="serif text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.01em]">
            {t.portalTitle}
          </h2>
          <div className="mt-8 border-t border-[var(--rule)]">
            {portal.map((s) => row(s, t.learn))}
          </div>
        </section>
      )}

      <FreeConsult locale={locale} />
    </main>
  );
}
