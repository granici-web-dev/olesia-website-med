import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { api, loc } from '@/lib/api';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { calendlyUrlFor } from '@/lib/calendly';
import { Reveal } from '@/components/ui/Reveal';
import { btnDark, underlineLg, creamPill, creamUnderline } from '@/components/ui/cta';
import { siteMediaAsset } from '@/lib/site-media';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Single-service landing for the Integrative consultation (group A · 90 min ·
   video · with monitoring). Books the same Calendly event as the `integrative`
   service. The page's job is to justify the 90 min + monitoring against the
   single consultations, so the core is "when to choose this" + "how it differs"
   — and the pediatrician × nutrition duo as the reason it works. Bilingual
   (RO default · EN); content is local, the API supplies only the Calendly URL.
   ────────────────────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  return {
    title: ru
      ? 'Интегративная консультация и наблюдение | Dr. Olesea Jalba'
      : en
        ? 'Integrative consultation & monitoring | Dr. Olesea Jalba'
        : 'Consultație integrativă și monitorizare | Dr. Olesea Jalba',
    description: ru
      ? 'Углублённая видеоконсультация (90 мин), объединяющая педиатрию и нутрициологию, с персональным планом и наблюдением. Для сложных ситуаций.'
      : en
        ? 'In-depth video consultation (90 min) combining pediatrics and nutrition, with a personalized plan and monitoring. For complex situations.'
        : 'Consultație video aprofundată (90 min) care îmbină pediatria și nutriția, cu plan personalizat și monitorizare. Pentru situații complexe.',
  };
}

type Bi = { ro: string; en: string; ru: string };

const CHOOSE_WHEN: Bi[] = [
  { ro: 'Situația este complexă sau durează de mai mult timp.', en: 'The situation is complex or has been going on for a while.', ru: 'Ситуация сложная или тянется уже давно.' },
  { ro: 'Ai mai multe preocupări deodată — sănătate și alimentație împreună.', en: 'You have several concerns at once — health and nutrition together.', ru: 'Сразу несколько вопросов — и здоровье, и питание.' },
  { ro: 'Vrei o evaluare aprofundată, cu mai mult timp de discuție.', en: 'You want an in-depth assessment, with more time to talk.', ru: 'Нужна углублённая оценка и время, чтобы всё обсудить.' },
  { ro: 'Ai nevoie nu doar de un sfat unic, ci de urmărire în timp.', en: 'You need not just one-off advice, but follow-up over time.', ru: 'Нужен не разовый совет, а наблюдение со временем.' },
];

const INCLUDES: Bi[] = [
  { ro: 'Apel video aprofundat de 90 de minute', en: '90-minute in-depth video call', ru: 'Углублённый видеозвонок на 90 минут' },
  { ro: 'Evaluare combinată: pediatrică și nutrițională', en: 'Combined assessment: pediatric and nutrition', ru: 'Комплексная оценка: педиатрия и питание' },
  { ro: 'Un plan de acțiune personalizat', en: 'A personalized action plan', ru: 'Персональный план действий' },
  { ro: 'Îndrumare inițială de monitorizare și urmărire', en: 'Initial monitoring and follow-up guidance', ru: 'Первые рекомендации по наблюдению' },
];

const STEPS: { title: Bi; text: Bi }[] = [
  {
    title: { ro: 'Programare', en: 'Booking', ru: 'Запись' },
    text: {
      ro: 'Programezi o oră și completezi un formular detaliat despre copil (sau despre tine) — istoric, simptome, alimentație.',
      en: 'Book a time and fill in a detailed form about your child (or yourself) — history, symptoms, diet.',
      ru: 'Выбираете время и заполняете подробную анкету о ребёнке (или о себе) — анамнез, симптомы, питание.',
    },
  },
  {
    title: { ro: 'Apel video', en: 'Video call', ru: 'Видеозвонок' },
    text: {
      ro: 'Te conectezi la apelul video de 90 de minute pe Google Meet, unde analizăm situația în ansamblu — primești linkul în e-mailul de confirmare (la cerere, și WhatsApp, Viber sau Instagram).',
      en: 'Join the 90-minute video call on Google Meet, where we look at the whole picture — you get the link in the confirmation email (WhatsApp, Viber, or Instagram on request).',
      ru: 'Подключаетесь к 90-минутному видеозвонку в Google Meet, где мы разбираем ситуацию в целом — ссылка приходит в письме-подтверждении (по запросу — WhatsApp, Viber или Instagram).',
    },
  },
  {
    title: { ro: 'Plan de acțiune', en: 'Action plan', ru: 'План действий' },
    text: {
      ro: 'Primești un plan de acțiune și recomandări scrise.',
      en: 'You get an action plan and written recommendations.',
      ru: 'Вы получаете план действий и письменные рекомендации.',
    },
  },
  {
    title: { ro: 'Urmărire', en: 'Follow-up', ru: 'Наблюдение' },
    text: {
      ro: 'Urmărim împreună progresul și ajustăm planul la nevoie.',
      en: 'Together we track progress and adjust the plan as needed.',
      ru: 'Вместе отслеживаем прогресс и корректируем план при необходимости.',
    },
  },
];

const COMPARE: { title: Bi; duration: Bi; text: Bi; current?: boolean }[] = [
  {
    title: { ro: 'Consultație pediatrică', en: 'Pediatric consultation', ru: 'Педиатрическая консультация' },
    duration: { ro: '30 min', en: '30 min', ru: '30 мин' },
    text: { ro: 'O problemă de sănătate, evaluare focusată.', en: 'One health issue, a focused assessment.', ru: 'Одна проблема со здоровьем, точечная оценка.' },
  },
  {
    title: { ro: 'Consultație de nutriție', en: 'Nutrition consultation', ru: 'Консультация по питанию' },
    duration: { ro: '60 min', en: '60 min', ru: '60 мин' },
    text: { ro: 'Alimentație și hrănire.', en: 'Feeding and nutrition.', ru: 'Питание и кормление.' },
  },
  {
    title: { ro: 'Consultație integrativă', en: 'Integrative consultation', ru: 'Интегративная консультация' },
    duration: { ro: '90 min', en: '90 min', ru: '90 мин' },
    text: {
      ro: 'Situații complexe care îmbină sănătatea și nutriția, cu mai mult timp și cu monitorizare.',
      en: 'Complex situations combining health and nutrition, with more time and monitoring.',
      ru: 'Сложные ситуации, где здоровье и питание вместе, — больше времени и наблюдение.',
    },
    current: true,
  },
];

const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { ro: 'Ce include monitorizarea?', en: 'What does the monitoring include?', ru: 'Что включает наблюдение?' },
    a: {
      ro: 'O îndrumare inițială de urmărire după consultație — verificăm progresul și ajustăm planul. Pentru urmărire continuă pe mai multe luni există abonamentele de monitorizare (1–6 luni).',
      en: 'Initial follow-up guidance after the consultation — we check progress and adjust the plan. For continuous, multi-month follow-up there are the monitoring subscriptions (1–6 months).',
      ru: 'Первые рекомендации по наблюдению сразу после консультации — проверяем, как идут дела, и корректируем план. Если наблюдать нужно несколько месяцев подряд, для этого есть абонементы наблюдения (1–6 месяцев).',
    },
  },
  {
    q: { ro: 'Cât durează urmărirea după consultație?', en: 'How long does follow-up last?', ru: 'Сколько длится наблюдение после консультации?' },
    a: {
      ro: 'Urmărirea inițială este inclusă imediat după consultație; pentru o perioadă mai lungă, vezi Monitorizare și abonamente.',
      en: 'Initial follow-up is included right after the consultation; for a longer period, see Monitoring & subscriptions.',
      ru: 'Первое наблюдение входит в консультацию сразу после неё; если нужно дольше — смотрите «Наблюдение и абонементы».',
    },
  },
  {
    q: { ro: 'Este pentru copii sau și pentru adulți?', en: 'Is it for children or adults too?', ru: 'Это для детей или для взрослых тоже?' },
    a: { ro: 'Pentru copii și adulți.', en: 'For children and adults.', ru: 'Для детей и взрослых.' },
  },
  {
    q: { ro: 'În ce limbi pot discuta?', en: 'Which languages can I speak in?', ru: 'На каких языках можно общаться?' },
    a: { ro: 'Română, rusă și engleză.', en: 'Romanian, Russian, and English.', ru: 'На румынском, русском и английском.' },
  },
  {
    q: { ro: 'Cum se face plata?', en: 'How do I pay?', ru: 'Как происходит оплата?' },
    a: {
      ro: 'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după confirmarea programării.',
      en: 'By bank transfer (no online payment for now). You’ll get the details once your booking is confirmed.',
      ru: 'Банковским переводом (пока без онлайн-оплаты). Реквизиты вы получите после подтверждения записи.',
    },
  },
  {
    q: { ro: 'Pot reprograma sau anula?', en: 'Can I reschedule or cancel?', ru: 'Можно ли перенести или отменить?' },
    a: {
      ro: 'Da, din linkul de confirmare, cu cel puțin 24 de ore înainte.',
      en: 'Yes, from your confirmation link at least 24 hours ahead.',
      ru: 'Да, по ссылке из подтверждения, не менее чем за 24 часа.',
    },
  },
];

export default async function IntegrativePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const portrait = await siteMediaAsset('portrait_integrative');
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  const integrativeUrl = calendlyUrlFor(
    'integrative',
    (await api.services()).find((s) => s.code === 'integrative')?.calendlySchedulingUrl,
  );

  const bookReason = ru ? 'Интегративная консультация' : en ? 'Integrative consultation' : 'Consultație integrativă';

  const BookPrimary = ({ className, label }: { className: string; label: string }) =>
    integrativeUrl ? (
      <CalendlyButton url={integrativeUrl} reason={bookReason} label={label} withArrow={false} className={className} />
    ) : (
      <Link href="/contact" className={className}>
        {label}
      </Link>
    );

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Услуги' : en ? 'Services' : 'Servicii', href: '/services' },
          { label: ru ? 'Интегративная консультация' : en ? 'Integrative consultation' : 'Consultație integrativă' },
        ]}
      />
      {/* 1 · Hero — editorial split: statement left, description right (no photo) */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Интегративная · Видеоконсультация' : en ? 'Integrative · Video consultation' : 'Integrativă · Consultație video'}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[16ch] text-[clamp(2.4rem,5.4vw,4.8rem)] leading-[1.05] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    <span className="serif-it text-sage">Интегративная</span> консультация и наблюдение
                  </>
                ) : en ? (
                  <>
                    <span className="serif-it text-sage">Integrative</span> consultation & monitoring
                  </>
                ) : (
                  <>
                    Consultație <span className="serif-it text-sage">integrativă</span> și monitorizare
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[36ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {ru
                  ? 'Для сложных ситуаций — здоровье и питание вместе.'
                  : en
                    ? 'For complex situations — health and nutrition together.'
                    : 'Pentru situații complexe — sănătate și nutriție împreună.'}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <BookPrimary
                  className={btnDark}
                  label={ru ? 'Записаться на консультацию' : en ? 'Book a consultation' : 'Programează o consultație'}
                />
                <Link href="/pricing" className={underlineLg}>
                  {ru ? 'Смотреть цены' : en ? 'See pricing' : 'Vezi tarifele'} →
                </Link>
              </div>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                {ru ? 'Видеозвонок · 90 мин · с наблюдением' : en ? 'Video call · 90 min · with monitoring' : 'Apel video · 90 min · cu monitorizare'}
              </p>
              <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {ru
                  ? 'Углублённая оценка, где соединяются педиатрия и нутрициология, с планом, за которым мы следим дальше.'
                  : en
                    ? 'An in-depth assessment that combines pediatric and nutrition expertise, with a plan to follow over time.'
                    : 'O evaluare aprofundată care îmbină expertiza pediatrică și nutrițională, cu un plan de urmărit în timp.'}
              </p>
              <p className="mono mt-8 border-t border-[var(--rule)] pt-6 text-[11px] uppercase tracking-[0.1em] leading-relaxed text-ink-soft">
                {ru
                  ? 'Врач-педиатр с магистратурой по нутрициологии человека — взгляд на здоровье и питание в целом'
                  : en
                    ? 'Pediatrician with a Master’s in Human Nutrition — a whole-picture view of health and diet'
                    : 'Medic pediatru cu master în nutriție umană — o privire de ansamblu asupra sănătății și alimentației'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · When to choose this (differentiation core) */}
      <section className="shell py-20 md:py-28">
        <header className="max-w-[40rem]">
          <p className="eyebrow mb-3">{ru ? 'Подходит ли вам?' : en ? 'Is it for you?' : 'Ți se potrivește?'}</p>
          <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-pretty">
            {ru ? (
              <>
                Когда <span className="serif-it text-sage">выбрать</span> эту консультацию
              </>
            ) : en ? (
              <>
                When to <span className="serif-it text-sage">choose</span> this consultation
              </>
            ) : (
              <>
                Când să <span className="serif-it text-sage">alegi</span> această consultație
              </>
            )}
          </h2>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">
            {ru ? 'Выбирайте интегративную консультацию, если:' : en ? 'Choose the integrative consultation if:' : 'Alege consultația integrativă dacă:'}
          </p>
        </header>
        <div className="mt-10 grid gap-x-16 gap-y-9 sm:grid-cols-2">
          {CHOOSE_WHEN.map((it, i) => (
            <Reveal
              key={it.en}
              delay={(i % 2) * 70}
              className="grid grid-cols-[1.6em_1fr] gap-x-3 border-t border-[var(--rule)] pt-6"
            >
              <span aria-hidden="true" className="serif text-[1.4rem] italic leading-none text-sage">
                {i + 1}
              </span>
              <p className="text-[1.15rem] leading-relaxed text-ink text-pretty">{lc(it)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3 · What's included (paper band) */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-[1fr_1.3fr] md:gap-20 md:py-24">
          <div>
            <p className="eyebrow mb-3">{ru ? 'В пакете' : en ? 'In the package' : 'În pachet'}</p>
            <h2 className="serif text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Что <span className="serif-it text-sage">входит</span>
                </>
              ) : en ? (
                <>
                  What’s <span className="serif-it text-sage">included</span>
                </>
              ) : (
                <>
                  Ce <span className="serif-it text-sage">include</span>
                </>
              )}
            </h2>
          </div>
          <ul className="grid gap-4">
            {INCLUDES.map((it) => (
              <li
                key={it.en}
                className="grid grid-cols-[1.2em_1fr] gap-x-3 border-t border-[var(--rule)] pt-4 text-[1.15rem] leading-relaxed text-ink"
              >
                <span aria-hidden="true" className="text-sage-text">
                  —
                </span>
                <span className="text-pretty">{lc(it)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 · How it works (olive band, 4 steps incl. follow-up) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-28">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
            {ru ? 'Шаг за шагом' : en ? 'Step by step' : 'Pas cu pas'}
          </p>
          <h2 className="serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.0] tracking-[-0.02em] text-cream text-balance">
            {ru ? (
              <>
                Как это <span className="serif-it text-[var(--sage-soft)]">проходит</span>
              </>
            ) : en ? (
              <>
                How it <span className="serif-it text-[var(--sage-soft)]">works</span>
              </>
            ) : (
              <>
                Cum <span className="serif-it text-[var(--sage-soft)]">decurge</span>
              </>
            )}
          </h2>

          <div className="relative mt-14 grid gap-x-8 gap-y-12 md:mt-16 md:grid-cols-2 lg:grid-cols-4">
            <span
              className="pointer-events-none absolute inset-x-0 top-8 hidden h-px bg-[rgba(245,241,234,0.2)] lg:block"
              aria-hidden="true"
            />
            {STEPS.map((step, i) => (
              <Reveal key={step.title.en} delay={i * 80} className="relative">
                <span
                  aria-hidden="true"
                  className="relative z-10 mb-7 grid size-16 place-items-center rounded-full border-[5px] border-[var(--sage-deep)] bg-sage text-cream"
                >
                  <span className="serif block translate-y-[0.05em] text-[1.6rem] italic leading-none lining-nums tabular-nums">
                    {i + 1}
                  </span>
                </span>
                <h3 className="serif text-[1.6rem] leading-snug text-cream">{lc(step.title)}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/80 text-pretty">
                  {lc(step.text)}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · How it differs (3-way mini comparison) */}
      <section className="shell py-20 md:py-28">
        <div className="mb-12 md:mb-16 max-w-[40rem]">
          <p className="eyebrow mb-3">{ru ? 'Кратко' : en ? 'Side by side' : 'Pe scurt'}</p>
          <h2 className="serif text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.03] tracking-[-0.02em] text-pretty">
            {ru ? (
              <>
                Чем она <span className="serif-it text-sage">отличается</span> от остальных
              </>
            ) : en ? (
              <>
                How it <span className="serif-it text-sage">differs</span> from the others
              </>
            ) : (
              <>
                Prin ce <span className="serif-it text-sage">diferă</span> de celelalte consultații
              </>
            )}
          </h2>
        </div>
        <div className="grid border-t border-[var(--rule)] lg:grid-cols-3 lg:divide-x lg:divide-[var(--rule)]">
          {COMPARE.map((c) => (
            <div
              key={c.title.en}
              className="flex flex-col border-b border-[var(--rule)] py-7 lg:border-b-0 lg:px-8 lg:pb-6 lg:pt-9 lg:first:pl-0 lg:last:pr-0"
            >
              {c.current ? (
                <span className="mono mb-3 self-start rounded-full bg-sage px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-cream">
                  {ru ? 'Эта' : en ? 'This one' : 'Aceasta'}
                </span>
              ) : (
                <span className="mono mb-3 text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {lc(c.duration)}
                </span>
              )}
              <h3
                className={`serif text-[clamp(1.4rem,1.9vw,1.85rem)] leading-tight tracking-[-0.01em] ${
                  c.current ? 'text-sage' : 'text-ink'
                }`}
              >
                {lc(c.title)}
              </h3>
              {c.current && (
                <span className="mono mt-2 text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {lc(c.duration)}
                </span>
              )}
              <p className="mt-3 max-w-[34ch] text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
                {lc(c.text)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 · About the doctor — content left, portrait right */}
      <section className="shell grid items-start gap-12 border-b border-[var(--rule)] py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-20 md:py-28">
        <div className="md:sticky md:top-[133px] md:self-start">
          <p className="eyebrow mb-4">{ru ? 'О враче' : en ? 'About the doctor' : 'Despre medic'}</p>
          <h2 className="serif text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.06] tracking-[-0.02em] text-balance">
            {ru ? (
              <>
                Почему это <span className="serif-it text-sage">работает</span>
              </>
            ) : en ? (
              <>
                Why it <span className="serif-it text-sage">works</span>
              </>
            ) : (
              <>
                De ce <span className="serif-it text-sage">funcționează</span>
              </>
            )}
          </h2>
          <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {ru
              ? 'Dr. Olesea Jalba — врач-педиатр с магистратурой по общественному здоровью и нутрициологии человека. Именно это сочетание двух специальностей и делает возможной интегративную консультацию: ребёнка (или взрослого) здесь видят целиком, а не по частям.'
              : en
                ? 'Dr. Olesea Jalba is a pediatrician with a Master’s in Public Health – Human Nutrition. It’s exactly this dual expertise that makes an integrative consultation possible — an assessment that sees the child (or adult) as a whole, not in pieces.'
                : 'Dr. Olesea Jalba este medic pediatru cu master în Sănătate Publică – Nutriție Umană. Tocmai această dublă expertiză face posibilă o consultație integrativă — o evaluare care privește copilul (sau adultul) ca pe un întreg, nu pe bucăți.'}
          </p>
          <p className="eyebrow mt-9 mb-3">{ru ? 'Двойная экспертиза' : en ? 'Dual expertise' : 'Dublă expertiză'}</p>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {[
              { ro: 'Medic pediatru', en: 'Pediatrician', ru: 'Врач-педиатр' },
              { ro: 'Master în Nutriție Umană (USMF)', en: 'MSc in Human Nutrition (USMF)', ru: 'Магистр нутрициологии человека (USMF)' },
            ].map((f) => (
              <li
                key={f.en}
                className="grid grid-cols-[1.1em_1fr] gap-x-2 text-[0.95rem] leading-relaxed text-ink"
              >
                <span aria-hidden="true" className="text-sage-text">
                  —
                </span>
                <span className="text-pretty">{lc(f)}</span>
              </li>
            ))}
          </ul>
          <Link href="/about" className={`mt-9 ${underlineLg}`}>
            {ru ? 'Полный профиль' : en ? 'See full profile' : 'Vezi profilul complet'} →
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[420px] md:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e9e1d0]">
            <Image
              src={portrait.url}
              alt={
                ru
                  ? 'Dr. Olesea Jalba, врач-педиатр и специалист по питанию'
                  : en
                    ? 'Dr. Olesea Jalba, pediatrician and nutrition specialist'
                    : 'Dr. Olesea Jalba, medic pediatru și specialist în nutriție'
              }
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      {/* 7 · Need longer support? + what it doesn't replace (paper band) */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-2 md:gap-20 md:py-20">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Нужна поддержка дольше?' : en ? 'Longer support?' : 'Sprijin mai lung?'}</p>
            <h3 className="serif text-[clamp(1.5rem,2.6vw,2.2rem)] leading-snug tracking-[-0.01em] text-balance">
              {ru ? 'Нужна поддержка на несколько месяцев?' : en ? 'Need support over several months?' : 'Ai nevoie de sprijin pe termen mai lung?'}
            </h3>
            <p className="mt-4 max-w-[48ch] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Если нужно наблюдение несколько месяцев подряд, посмотрите наблюдение и абонементы (1–6 месяцев).'
                : en
                  ? 'If you want continuous follow-up over several months, see monitoring & subscriptions (1–6 months).'
                  : 'Dacă vrei urmărire continuă timp de mai multe luni, vezi monitorizare și abonamente (1–6 luni).'}
            </p>
            <Link href="/monitoring" className={`mt-6 ${underlineLg}`}>
              {ru ? 'Наблюдение и абонементы' : en ? 'Monitoring & subscriptions' : 'Monitorizare și abonamente'} →
            </Link>
          </div>
          <div>
            <p className="eyebrow mb-3">{ru ? 'Важно' : en ? 'Important' : 'Important'}</p>
            <p className="max-w-[56ch] leading-relaxed text-ink-soft text-pretty">
              {ru ? (
                <>
                  Интегративная онлайн-консультация — не для экстренных случаев. Если состояние
                  тяжёлое или быстро ухудшается, звоните{' '}
                  <span className="font-medium text-ink">112</span> или поезжайте в ближайшее
                  отделение неотложной помощи. Иногда нужен очный осмотр или обследования — об этом
                  мы скажем вам прямо.
                </>
              ) : en ? (
                <>
                  An online integrative consultation isn’t for medical emergencies. If the
                  condition is serious or worsening fast, call{' '}
                  <span className="font-medium text-ink">112</span> or go to the nearest emergency
                  service. Some situations may need a physical exam or tests — we’ll tell you
                  clearly.
                </>
              ) : (
                <>
                  Consultația integrativă online nu este pentru urgențe medicale. Dacă starea este
                  gravă sau se agravează rapid, sună la{' '}
                  <span className="font-medium text-ink">112</span> sau mergi la cel mai apropiat
                  serviciu de urgență. Unele situații pot necesita o examinare fizică sau
                  investigații — îți vom spune clar.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 8 · FAQ — centered */}
      <section className="shell py-20 md:py-28">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="eyebrow mb-3">{ru ? 'Полезно знать' : en ? 'Good to know' : 'Bine de știut'}</p>
          <h2 className="serif text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.0] tracking-[-0.02em] text-balance">
            {ru ? (
              <>
                Частые <span className="serif-it text-sage">вопросы</span>
              </>
            ) : en ? (
              <>
                Frequently <span className="serif-it text-sage">asked</span>
              </>
            ) : (
              <>
                Întrebări <span className="serif-it text-sage">frecvente</span>
              </>
            )}
          </h2>
        </div>
        <div className="mx-auto mt-12 max-w-[760px]">
          {FAQ.map((it) => (
            <details key={it.q.en} className="group border-t border-[var(--rule)] last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage [&::-webkit-details-marker]:hidden">
                <span className="serif text-[clamp(1.2rem,2vw,1.6rem)] leading-snug text-ink">
                  {lc(it.q)}
                </span>
                <span
                  className="mono shrink-0 text-2xl text-sage transition-transform duration-300 group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[66ch] pb-7 leading-relaxed text-ink-soft text-pretty">
                {lc(it.a)}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 9 · Final CTA + cross-links (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Записаться на интегративную <span className="serif-it text-[var(--sage-soft)]">консультацию</span>
                  </>
                ) : en ? (
                  <>
                    Book an integrative <span className="serif-it text-[var(--sage-soft)]">consultation</span>
                  </>
                ) : (
                  <>
                    Programează o consultație <span className="serif-it text-[var(--sage-soft)]">integrativă</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <BookPrimary
                  className={creamPill}
                  label={ru ? 'Записаться (90 мин, видео)' : en ? 'Book a time (90 min, video)' : 'Programează o oră (90 min, video)'}
                />
                <span className="text-sm text-[var(--sage-soft)]">
                  {ru ? 'Не уверены, что подходит? ' : en ? 'Not sure what fits? ' : 'Nu ești sigur ce ți se potrivește? '}
                  <Link href="/services" className={creamUnderline}>
                    {ru ? 'Все услуги →' : en ? 'See all services →' : 'Vezi toate serviciile →'}
                  </Link>
                </span>
              </div>
            </div>

            <div className="shrink-0 border-t border-[rgba(245,241,234,0.18)] pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
                {ru ? 'Другие услуги' : en ? 'Other services' : 'Alte servicii'}
              </p>
              <ul className="grid gap-3 text-[1.05rem]">
                <li>
                  <Link href="/pediatrics" className={creamUnderline}>
                    {ru ? 'Только проблема со здоровьем? → Педиатрическая консультация' : en ? 'Just a health issue? → Pediatric consultation' : 'Doar o problemă de sănătate? → Consultație pediatrică'}
                  </Link>
                </li>
                <li>
                  <Link href="/nutrition" className={creamUnderline}>
                    {ru ? 'Только питание? → Консультация по питанию' : en ? 'Just nutrition? → Nutrition consultation' : 'Doar alimentație? → Consultație de nutriție'}
                  </Link>
                </li>
                <li>
                  <Link href="/monitoring" className={creamUnderline}>
                    {ru ? 'Поддержка на месяцы? → Наблюдение и абонементы' : en ? 'Support over months? → Monitoring & subscriptions' : 'Sprijin pe mai multe luni? → Monitorizare și abonamente'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
