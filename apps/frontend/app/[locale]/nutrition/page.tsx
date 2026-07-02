import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { calendlyUrlFor } from '@/lib/calendly';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import { Reveal } from '@/components/ui/Reveal';
import { btnDark, underlineLg, creamPill, creamUnderline } from '@/components/ui/cta';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Single-service landing for the Nutrition consultation (group A · 60 min ·
   video). One service, two audience-specific Calendly events — children and
   adults — surfaced as two booking buttons (see CALENDLY_FALLBACK_URLS).
   Content is bilingual (RO default · EN) and lives here so the page renders
   fully even if the API is unreachable.
   Two audiences: children (feeding) and adults (personal plan). Visual language
   mirrors the homepage, the Services page, and the Pediatrics landing.
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
      ? 'Онлайн-консультации по питанию | Dr. Olesea Jalba'
      : en
        ? 'Online nutrition consultations | Dr. Olesea Jalba'
        : 'Consultații de nutriție online | Dr. Olesea Jalba',
    description: ru
      ? 'Онлайн видеоконсультация нутрициолога для детей и взрослых: трудности с кормлением, введение прикорма, индивидуальный план питания. Запишитесь онлайн.'
      : en
        ? 'Online video nutrition consultation for children and adults: feeding difficulties, starting solids, a personalized nutrition plan. Book online.'
        : 'Consultație de nutriție video pentru copii și adulți: dificultăți de hrănire, diversificare, plan alimentar personalizat. Programează online.',
  };
}

type Bi = { ro: string; en: string; ru: string };

const HELP_CHILDREN: Bi[] = [
  { ro: 'Dificultăți de hrănire și refuzul mâncării', en: 'Feeding difficulties and food refusal', ru: 'Трудности с кормлением и отказ от еды' },
  { ro: 'Refuzul alimentației, inclusiv refuzul biberonului', en: 'Food refusal, including bottle aversion', ru: 'Отказ от еды, в том числе отказ от бутылочки' },
  { ro: 'Introducerea diversificării (trecerea la alimente solide)', en: 'Starting solids (the move to solid foods)', ru: 'Введение прикорма (переход к твёрдой пище)' },
  { ro: 'Copilul mofturos la mâncare', en: 'The picky eater', ru: 'Привередливый в еде ребёнок' },
  { ro: 'Alimentația pentru o creștere sănătoasă', en: 'Eating for healthy growth', ru: 'Питание для здорового роста' },
];

const HELP_ADULTS: Bi[] = [
  { ro: 'Plan alimentar personalizat', en: 'A personalized nutrition plan', ru: 'Индивидуальный план питания' },
  { ro: 'Greutate și obiceiuri alimentare sănătoase', en: 'Weight and healthy eating habits', ru: 'Вес и здоровые пищевые привычки' },
  { ro: 'Alimentație echilibrată, bazată pe dovezi', en: 'Balanced, evidence-based eating', ru: 'Сбалансированное питание, основанное на доказательствах' },
];

const STEPS: { title: Bi; text: Bi }[] = [
  {
    title: { ro: 'Programare', en: 'Booking', ru: 'Запись' },
    text: {
      ro: 'Programezi o oră și completezi un scurt formular despre alimentația actuală.',
      en: 'Book a time and fill in a short form about current eating.',
      ru: 'Выбираете удобное время и заполняете короткую анкету о питании.',
    },
  },
  {
    title: { ro: 'Apel video', en: 'Video call', ru: 'Видеозвонок' },
    text: {
      ro: 'Te conectezi la apelul video de 60 de minute pe Google Meet — primești linkul în e-mailul de confirmare (la cerere, și WhatsApp, Viber sau Instagram).',
      en: 'Join the 60-minute video call on Google Meet — you get the link in the confirmation email (WhatsApp, Viber, or Instagram on request).',
      ru: 'Подключаетесь к 60-минутному видеозвонку в Google Meet — ссылка приходит в письме-подтверждении (по запросу — WhatsApp, Viber или Instagram).',
    },
  },
  {
    title: { ro: 'Analiză', en: 'Review', ru: 'Анализ' },
    text: {
      ro: 'Analizăm împreună obiceiurile alimentare și dificultățile întâmpinate.',
      en: 'Together we review eating habits and the difficulties you face.',
      ru: 'Вместе разбираем пищевые привычки и возникшие трудности.',
    },
  },
  {
    title: { ro: 'Plan personalizat', en: 'Personalized plan', ru: 'Индивидуальный план' },
    text: {
      ro: 'Primești un plan personalizat și recomandări scrise.',
      en: 'You get a personalized plan and written recommendations.',
      ru: 'Получаете индивидуальный план и письменные рекомендации.',
    },
  },
];

const FOCUS: Bi[] = [
  { ro: 'Alimentația copilului', en: 'Child nutrition', ru: 'Питание ребёнка' },
  { ro: 'Dificultăți de hrănire', en: 'Feeding difficulties', ru: 'Трудности с кормлением' },
  { ro: 'Diversificare', en: 'Starting solids', ru: 'Введение прикорма' },
  { ro: 'Plan alimentar pentru adulți', en: 'Adult nutrition plans', ru: 'Планы питания для взрослых' },
];

const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { ro: 'Cum mă pregătesc?', en: 'How do I prepare?', ru: 'Как подготовиться?' },
    a: {
      ro: 'Notează câteva zile ce mănâncă copilul (sau tu) — un mic jurnal alimentar — și adu rezultatele analizelor recente, dacă există.',
      en: 'For a few days, jot down what your child (or you) eat — a small food diary — and bring any recent lab results.',
      ru: 'В течение нескольких дней записывайте, что ест ребёнок (или вы) — небольшой пищевой дневник — и приложите результаты недавних анализов, если они есть.',
    },
  },
  {
    q: { ro: 'În ce limbi pot discuta?', en: 'Which languages can I speak in?', ru: 'На каких языках можно общаться?' },
    a: { ro: 'Română, rusă și engleză.', en: 'Romanian, Russian, and English.', ru: 'На румынском, русском и английском.' },
  },
  {
    q: { ro: 'Primesc un plan scris?', en: 'Do I get a written plan?', ru: 'Будет ли письменный план?' },
    a: {
      ro: 'Da, după consultație primești un plan personalizat și recomandări scrise.',
      en: 'Yes — after the consultation you receive a personalized plan and written recommendations.',
      ru: 'Да — после консультации вы получите индивидуальный план и письменные рекомендации.',
    },
  },
  {
    q: { ro: 'Cum se face plata?', en: 'How do I pay?', ru: 'Как происходит оплата?' },
    a: {
      ro: 'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după confirmarea programării.',
      en: 'By bank transfer (no online payment for now). You’ll get the details once your booking is confirmed.',
      ru: 'Банковским переводом (онлайн-оплаты пока нет). Реквизиты придут после подтверждения записи.',
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

export default async function NutritionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  // One nutrition service, two audience-specific Calendly events (group A):
  // children / adults. Same price and duration; the patient picks the right one.
  const copiiUrl = calendlyUrlFor('nutrition_copii');
  const adultiUrl = calendlyUrlFor('nutrition_adulti');

  const copiiLabel = ru ? 'Записаться · дети' : en ? 'Book · children' : 'Programează · copii';
  const adultiLabel = ru ? 'Записаться · взрослые' : en ? 'Book · adults' : 'Programează · adulți';
  const copiiReason = ru ? 'Консультация по питанию · дети' : en ? 'Nutrition consultation · children' : 'Consultație de nutriție · copii';
  const adultiReason = ru ? 'Консультация по питанию · взрослые' : en ? 'Nutrition consultation · adults' : 'Consultație de nutriție · adulți';

  const BookButtons = ({ className }: { className: string }) => (
    <div className="flex flex-wrap items-center gap-3">
      {copiiUrl ? (
        <CalendlyButton url={copiiUrl} reason={copiiReason} label={copiiLabel} withArrow={false} className={className} />
      ) : (
        <Link href="/contact" className={className}>{copiiLabel}</Link>
      )}
      {adultiUrl ? (
        <CalendlyButton url={adultiUrl} reason={adultiReason} label={adultiLabel} withArrow={false} className={className} />
      ) : (
        <Link href="/contact" className={className}>{adultiLabel}</Link>
      )}
    </div>
  );

  const HelpGroup = ({ title, items }: { title: string; items: Bi[] }) => (
    <Reveal className="border-t border-[var(--rule)] pt-7">
      <h3 className="serif text-[1.7rem] leading-snug tracking-[-0.01em]">{title}</h3>
      <ul className="mt-5 grid gap-3">
        {items.map((it) => (
          <li
            key={it.en}
            className="grid grid-cols-[1.1em_1fr] gap-x-2.5 text-[1.0625rem] leading-relaxed text-ink"
          >
            <span aria-hidden="true" className="text-sage-text">
              —
            </span>
            <span className="text-pretty">{lc(it)}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Услуги' : en ? 'Services' : 'Servicii', href: '/services' },
          { label: ru ? 'Консультация по питанию' : en ? 'Nutrition consultation' : 'Consultație nutrițională' },
        ]}
      />
      {/* 1 · Hero — editorial split: statement left, description right (no photo) */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Питание · Видеоконсультация' : en ? 'Nutrition · Video consultation' : 'Nutriție · Consultație video'}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.04] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    Онлайн-консультации по <span className="serif-it text-sage">питанию</span>
                  </>
                ) : en ? (
                  <>
                    Online <span className="serif-it text-sage">nutrition</span> consultations
                  </>
                ) : (
                  <>
                    Consultații de <span className="serif-it text-sage">nutriție</span> online
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[34ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {ru
                  ? 'Индивидуальный план питания — для детей и взрослых.'
                  : en
                    ? 'A personalized nutrition plan — for children and adults.'
                    : 'Un plan alimentar personalizat — pentru copii și adulți.'}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <BookButtons className={btnDark} />
                <Link href="/pricing" className={underlineLg}>
                  {ru ? 'Посмотреть цены' : en ? 'See pricing' : 'Vezi tarifele'} →
                </Link>
              </div>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                {ru ? 'Видеозвонок · 60 мин' : en ? 'Video call · 60 min' : 'Apel video · 60 min'}
              </p>
              <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {ru
                  ? 'Для детей и взрослых: трудности с кормлением, введение прикорма или план питания, основанный на доказательствах.'
                  : en
                    ? 'For children and adults: feeding difficulties, starting solids, or an evidence-based nutrition plan.'
                    : 'Pentru copii și adulți: dificultăți de hrănire, diversificare sau un plan alimentar bazat pe dovezi.'}
              </p>
              <p className="mono mt-8 border-t border-[var(--rule)] pt-6 text-[11px] uppercase tracking-[0.1em] leading-relaxed text-ink-soft">
                {ru
                  ? 'Педиатр с магистратурой по нутрициологии человека (USMF) — редкое сочетание знаний и опыта'
                  : en
                    ? 'Pediatrician with a Master’s in Human Nutrition (USMF) — a rare combination of expertise'
                    : 'Medic pediatru cu master în nutriție umană (USMF) — o combinație rară de expertiză'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · What it helps with — two audiences (core + SEO) */}
      <section className="shell py-20 md:py-28">
        <header className="max-w-[46rem]">
          <p className="eyebrow mb-3">{ru ? 'Поводы записаться' : en ? 'Reasons to book' : 'Motive să programezi'}</p>
          <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-pretty">
            {ru ? (
              <>
                С чем <span className="serif-it text-sage">помогает</span> консультация по питанию
              </>
            ) : en ? (
              <>
                What a nutrition consultation <span className="serif-it text-sage">helps with</span>
              </>
            ) : (
              <>
                Cu ce te poate <span className="serif-it text-sage">ajuta</span> o consultație de
                nutriție
              </>
            )}
          </h2>
        </header>
        <div className="mt-12 grid gap-x-16 gap-y-12 md:grid-cols-2">
          <HelpGroup title={ru ? 'Для детей' : en ? 'For children' : 'Pentru copii'} items={HELP_CHILDREN} />
          <HelpGroup title={ru ? 'Для взрослых' : en ? 'For adults' : 'Pentru adulți'} items={HELP_ADULTS} />
        </div>
      </section>

      {/* 3 · How the consultation works (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-28">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
            {ru ? 'Шаг за шагом' : en ? 'Step by step' : 'Pas cu pas'}
          </p>
          <h2 className="serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.0] tracking-[-0.02em] text-cream text-balance">
            {ru ? (
              <>
                Как проходит <span className="serif-it text-[var(--sage-soft)]">консультация</span>
              </>
            ) : en ? (
              <>
                How the <span className="serif-it text-[var(--sage-soft)]">consultation</span> works
              </>
            ) : (
              <>
                Cum decurge <span className="serif-it text-[var(--sage-soft)]">consultația</span>
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

      {/* 4 · About the doctor — content left, portrait right */}
      <section className="shell grid items-start gap-12 border-b border-[var(--rule)] py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-20 md:py-28">
        <div className="md:sticky md:top-[133px] md:self-start">
          <p className="eyebrow mb-4">{ru ? 'О враче' : en ? 'About the doctor' : 'Despre medic'}</p>
          <h2 className="serif text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.06] tracking-[-0.02em] text-balance">
            {ru ? (
              <>
                Кто вас <span className="serif-it text-sage">консультирует</span>
              </>
            ) : en ? (
              <>
                Who you’ll <span className="serif-it text-sage">see</span>
              </>
            ) : (
              <>
                Cine te <span className="serif-it text-sage">consultă</span>
              </>
            )}
          </h2>
          <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {ru
              ? 'Dr. Olesea Jalba — педиатр с магистратурой по специальности «Общественное здоровье — Нутрициология человека» (USMF «Nicolae Testemițanu»), с углублённой подготовкой в области питания детей и трудностей с кормлением.'
              : en
                ? 'Dr. Olesea Jalba is a pediatrician with a Master’s in Public Health – Human Nutrition (USMF “Nicolae Testemițanu”), with dedicated training in child nutrition and feeding difficulties.'
                : 'Dr. Olesea Jalba este medic pediatru cu master în Sănătate Publică – Nutriție Umană (USMF „Nicolae Testemițanu”), cu pregătire dedicată în alimentația copilului și dificultățile de hrănire.'}
          </p>
          <p className="mt-4 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {ru
              ? 'Это сочетание — педиатр и специалист по питанию — даёт вам оценку, учитывающую как здоровье, так и питание.'
              : en
                ? 'This combination — pediatrician and nutrition specialist — gives you an assessment that considers both health and diet.'
                : 'Această combinație — medic pediatru și specialist în nutriție — îți oferă o evaluare care ține cont atât de sănătate, cât și de alimentație.'}
          </p>
          <p className="eyebrow mt-9 mb-3">{ru ? 'Направления' : en ? 'Focus areas' : 'Domenii de focus'}</p>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {FOCUS.map((f) => (
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
              src="/assets/olesea-nutrition.webp"
              alt={
                ru
                  ? 'Dr. Olesea Jalba, педиатр и специалист по питанию'
                  : en
                    ? 'Dr. Olesea Jalba, pediatrician and nutrition specialist'
                    : 'Dr. Olesea Jalba, medic pediatru și specialist în nutriție'
              }
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      {/* 5 · Audience + what it doesn't replace (calm band) */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-2 md:gap-20 md:py-20">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Для кого' : en ? 'Who it’s for' : 'Pentru cine'}</p>
            <p className="serif text-[clamp(1.5rem,2.6vw,2.2rem)] leading-snug tracking-[-0.01em] text-balance">
              {ru ? 'Дети (включая грудничков) и взрослые.' : en ? 'Children (including infants) and adults.' : 'Copii (inclusiv sugari) și adulți.'}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">{ru ? 'Важно' : en ? 'Important' : 'Important'}</p>
            <p className="max-w-[56ch] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Консультация по питанию не подходит для неотложных ситуаций и не заменяет лечение установленного заболевания. При расстройствах пищевого поведения или состояниях, которым нужна специализированная помощь, мы подскажем, куда обратиться.'
                : en
                  ? 'A nutrition consultation isn’t for medical emergencies and doesn’t replace treatment for a diagnosed condition. For diagnosed eating disorders or conditions that need specialized care, we’ll point you to the right support.'
                  : 'Consultația de nutriție nu este pentru urgențe medicale și nu înlocuiește tratamentul unei afecțiuni diagnosticate. Pentru tulburări de alimentație diagnosticate sau afecțiuni care necesită îngrijire specializată, îți vom recomanda sprijinul potrivit.'}
            </p>
          </div>
        </div>
      </section>

      {/* 6 · FAQ — centered */}
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

      {/* 7 · Final CTA + cross-links (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Запишитесь на консультацию по <span className="serif-it text-[var(--sage-soft)]">питанию</span>
                  </>
                ) : en ? (
                  <>
                    Book a nutrition <span className="serif-it text-[var(--sage-soft)]">consultation</span>
                  </>
                ) : (
                  <>
                    Programează o consultație de <span className="serif-it text-[var(--sage-soft)]">nutriție</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <BookButtons className={creamPill} />
                <span className="text-sm text-[var(--sage-soft)]">
                  {ru ? 'Всего один вопрос? ' : en ? 'Have just one question? ' : 'Ai o singură întrebare? '}
                  <BookGroupBButton
                    service="quick_question"
                    label={ru ? 'Спросить врача (ответ за ~1 ч)' : en ? 'Ask the doctor (~1h reply)' : 'Întreabă medicul (răspuns în ~1h)'}
                    className={creamUnderline}
                  />
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
                    {ru
                      ? 'Беспокоит здоровье ребёнка? → Педиатрическая консультация'
                      : en
                        ? "Child's health concern? → Pediatric consultation"
                        : 'Probleme de sănătate ale copilului? → Consultație pediatrică'}
                  </Link>
                </li>
                <li>
                  <Link href="/integrative" className={creamUnderline}>
                    {ru
                      ? 'Сложный случай или длительное наблюдение? → Интегративная консультация'
                      : en
                        ? 'Complex case or long-term monitoring? → Integrative consultation'
                        : 'Caz complex sau monitorizare? → Consultație integrativă'}
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
