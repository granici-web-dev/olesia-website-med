import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { FREE_CONSULT_CALENDLY_URL } from '@/lib/calendly';

/** Free 45-min orientation call — helps the visitor pick the right service. */
export function FreeConsult({ locale }: { locale: string }) {
  const t = (ro: string, en: string) => (locale === 'en' ? en : ro);
  return (
    <section className="bg-sage-deep text-cream">
      <div className="shell flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <div className="max-w-[44ch]">
          <p className="eyebrow !text-[var(--sage-soft)]">
            {t('Primul pas', 'First step')}
          </p>
          <h2 className="serif mt-3 text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] tracking-[-0.01em]">
            {t('45 minute gratuite', '45 free minutes')}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--sage-soft)] text-pretty">
            {t(
              'Nu ești sigură ce consultație ți se potrivește? Hai să vorbim scurt — te ajut să alegi serviciul potrivit, fără obligații.',
              'Not sure which consultation fits? Let’s have a short call — I’ll help you choose the right service, no strings attached.',
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <CalendlyButton
            url={FREE_CONSULT_CALENDLY_URL}
            reason={t('Consultație gratuită', 'Free consultation')}
            label={t('Programează discuția', 'Book the call')}
            withArrow={false}
            className="inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5"
          />
          <a
            href="https://wa.me/37360123456"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-[var(--sage-soft)] px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-[rgba(255,255,255,0.08)]"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
