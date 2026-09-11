import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { Reveal } from '@/components/ui/Reveal';
import { creamPill } from '@/components/ui/cta';
import { api } from '@/lib/api';
import { FREE_CONSULT_CALENDLY_URL } from '@/lib/calendly';
import { formatServiceDuration } from '@/lib/service-price';

/**
 * Free orientation call — helps the visitor pick the right service.
 *
 * How long it lasts is the catalog's to say. The heading read "30 free
 * minutes" while `free_consult.durationMin` was the client's to change
 * (audit A7, F2); with no catalog answer the heading drops the number rather
 * than guessing it.
 */
export async function FreeConsult({ locale }: { locale: string }) {
  const t = (ro: string, en: string, ru: string) =>
    locale === 'ru' ? ru : locale === 'en' ? en : ro;
  const duration = formatServiceDuration(
    locale,
    (await api.services()).find((s) => s.code === 'free_consult')?.durationMin ??
      null,
  );
  return (
    <section className="bg-sage-deep text-cream">
      <div className="shell flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <Reveal as="div" className="max-w-[44ch]">
          <p className="eyebrow !text-[var(--sage-soft)]">
            {t('Primul pas', 'First step', 'Первый шаг')}
          </p>
          <h2 className="serif mt-3 text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] tracking-[-0.01em]">
            {duration
              ? t(
                  `${duration} gratuite`,
                  `${duration} free`,
                  `${duration} бесплатно`,
                )
              : t('Discuție gratuită', 'A free call', 'Бесплатный разговор')}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--sage-soft)] text-pretty">
            {t(
              'Nu ești sigură ce consultație ți se potrivește? Hai să vorbim scurt — te ajut să alegi serviciul potrivit, fără obligații.',
              'Not sure which consultation fits? Let’s have a short call — I’ll help you choose the right service, no strings attached.',
              'Не знаете, какая консультация вам подходит? Давайте коротко поговорим — помогу выбрать нужную услугу, без обязательств.',
            )}
          </p>
        </Reveal>
        <Reveal as="div" className="flex shrink-0 flex-wrap items-center gap-4" delay={120}>
          <CalendlyButton
            url={FREE_CONSULT_CALENDLY_URL}
            reason={t('Consultație gratuită', 'Free consultation', 'Бесплатная консультация')}
            label={t('Programează discuția', 'Book the call', 'Записаться на разговор')}
            withArrow={false}
            className={creamPill}
          />
        </Reveal>
      </div>
    </section>
  );
}
