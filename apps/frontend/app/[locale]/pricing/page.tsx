import Link from 'next/link';
import { api, loc, serviceTag, type ServiceDto } from '../../../lib/api';
import styles from '../../../components/sections/Services.module.css';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import type { LeadService } from '@/lib/leads';

export const revalidate = 60;

function price(locale: string, s: ServiceDto): string {
  const label = loc(locale, s.priceLabelRo, s.priceLabelEn);
  if (label) return label;
  return `${new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ro-RO').format(s.price)} lei`;
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const services = (await api.services()).filter((s) => s.active);

  const t = {
    eyebrow: loc(locale, 'Tarife', 'Pricing'),
    title: loc(locale, 'Tarife transparente', 'Transparent pricing'),
    intro: loc(
      locale,
      'Fără costuri ascunse. Plata se confirmă manual după programare.',
      'No hidden costs. Payment is confirmed manually after booking.',
    ),
    book: loc(locale, 'Rezervă', 'Book'),
    min: loc(locale, 'min', 'min'),
  };

  return (
    <main className="bg-cream text-ink">
      <section className="shell py-20 md:py-28">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="serif mt-4 text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.04] tracking-[-0.02em] text-balance">
          {t.title}
        </h1>
        <p className="mt-6 max-w-[48ch] text-[1.05rem] leading-relaxed text-ink-soft text-pretty">
          {t.intro}
        </p>

        {/* Editorial service rows — same design as the homepage Services section. */}
        <div className="mt-12 border-b border-[var(--rule)]">
          {services.map((s, i) => (
            <div key={s.id} className={styles.serviceRow}>
              <div className={styles.serviceNum}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div className={styles.serviceTag}>{serviceTag(locale, s)}</div>
                <h2 className={styles.serviceTitle}>
                  {loc(locale, s.titleRo, s.titleEn)}
                </h2>
              </div>
              <p className={styles.serviceDesc}>
                {loc(locale, s.descriptionRo, s.descriptionEn)}
              </p>
              <div className={styles.serviceMeta}>
                <div className={styles.servicePrice}>{price(locale, s)}</div>
                {s.durationMin ? (
                  <div className={styles.serviceDuration}>
                    {s.durationMin} {t.min}
                  </div>
                ) : null}
                {s.group === 'A_booking' && s.calendlySchedulingUrl ? (
                  <CalendlyButton
                    url={s.calendlySchedulingUrl}
                    reason={loc(locale, s.titleRo, s.titleEn)}
                    label={t.book}
                    className={styles.serviceLink}
                  />
                ) : s.group === 'B_portal' ? (
                  <BookGroupBButton
                    service={s.code as LeadService}
                    label={t.book}
                    className={styles.serviceLink}
                  />
                ) : (
                  <Link
                    href={`/${locale}/contact`}
                    className={styles.serviceLink}
                  >
                    {t.book}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
