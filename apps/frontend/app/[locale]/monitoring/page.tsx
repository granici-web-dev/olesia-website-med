import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { loc } from '@/lib/api';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import { Reveal } from '@/components/ui/Reveal';
import { btnDark, underlineLg, creamPill, creamUnderline } from '@/components/ui/cta';
import { siteMediaAsset } from '@/lib/site-media';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Single-service landing for monitoring & subscriptions (group B · portal).
   Brief §3: 4 subscription types (Pediatrie / Nutriție copii / Nutriție adulți /
   Complex) over 1/2/3/6 months, all "on request" — the doctor contacts the
   client and sets the duration and price directly. No calendar/video booking —
   the CTA opens the lead form (`monitoring`). Trilingual (RO default · EN · RU);
   content is local.
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
      ? 'Наблюдение и абонементы | Dr. Olesea Jalba'
      : en
        ? 'Monitoring & subscriptions | Dr. Olesea Jalba'
        : 'Monitorizare și abonamente | Dr. Olesea Jalba',
    description: ru
      ? '4 типа абонемента (педиатрия, питание детей, питание взрослых, комплекс) на 1, 2, 3 или 6 месяцев: периодическое наблюдение, корректировка плана и прямая связь с врачом. Длительность и цену врач согласует индивидуально.'
      : en
        ? '4 subscription types (Pediatrics, Child nutrition, Adult nutrition, Complex) over 1, 2, 3, or 6 months: periodic monitoring, plan adjustments, and direct communication with the doctor. Duration and price are set individually.'
        : '4 tipuri de abonament (Pediatrie, Nutriție copii, Nutriție adulți, Complex) pe 1, 2, 3 sau 6 luni: monitorizare periodică, ajustarea planului și comunicare directă cu medicul. Durata și prețul se stabilesc individual.',
  };
}

type Bi = { ro: string; en: string; ru: string };

const CHOOSE_WHEN: Bi[] = [
  { ro: 'Vrei sprijin constant, nu o vizită singulară.', en: 'You want steady support, not a one-off visit.', ru: 'Вам нужна постоянная поддержка, а не разовый визит.' },
  { ro: 'Lucrezi la un obiectiv de durată — alimentație, creștere, un plan.', en: 'You’re working toward a longer goal — diet, growth, a plan.', ru: 'Вы движетесь к долгосрочной цели — питание, рост, план.' },
  { ro: 'Ai nevoie de ajustări pe parcurs, pe măsură ce lucrurile se schimbă.', en: 'You need adjustments along the way, as things change.', ru: 'Вам нужно корректировать план по ходу, когда меняется ситуация.' },
  { ro: 'Vrei să poți întreba medicul între consultații.', en: 'You want to be able to ask the doctor between consultations.', ru: 'Вы хотите спрашивать врача между консультациями.' },
];

const INCLUDES: Bi[] = [
  { ro: 'Monitorizare periodică (greutate, creștere, alimentație, analize)', en: 'Periodic monitoring (weight, growth, diet, lab results)', ru: 'Периодическое наблюдение (вес, рост, питание, анализы)' },
  { ro: 'Ajustarea planului medical sau alimentar pe parcurs', en: 'Adjusting the medical or nutrition plan over time', ru: 'Корректировка медицинского или пищевого плана' },
  { ro: 'Comunicare directă cu medicul (email/WhatsApp)', en: 'Direct communication with the doctor (email/WhatsApp)', ru: 'Прямая связь с врачом (email/WhatsApp)' },
  { ro: 'Prioritate la programarea consultațiilor', en: 'Priority when booking consultations', ru: 'Приоритет при записи на консультации' },
];

/* The 4 subscription types (brief §3). Shown as text; a single lead form
   collects the request — the doctor then sets duration (1/2/3/6 months) and
   price directly with the client. */
const TYPES: { name: Bi; note: Bi }[] = [
  {
    name: { ro: 'Abonament Pediatrie', en: 'Pediatrics subscription', ru: 'Абонемент «Педиатрия»' },
    note: { ro: 'Sănătatea și dezvoltarea copilului', en: 'Child health and development', ru: 'Здоровье и развитие ребёнка' },
  },
  {
    name: { ro: 'Abonament Nutriție copii', en: 'Child nutrition subscription', ru: 'Абонемент «Питание детей»' },
    note: { ro: 'Alimentație și creștere pentru copii', en: 'Feeding and growth for children', ru: 'Питание и рост для детей' },
  },
  {
    name: { ro: 'Abonament Nutriție adulți', en: 'Adult nutrition subscription', ru: 'Абонемент «Питание взрослых»' },
    note: { ro: 'Obiective de nutriție pentru adulți', en: 'Nutrition goals for adults', ru: 'Цели по питанию для взрослых' },
  },
  {
    name: { ro: 'Abonament Complex (Pediatrie + Nutriție)', en: 'Complex subscription (Pediatrics + Nutrition)', ru: 'Комплексный абонемент (педиатрия + питание)' },
    note: { ro: 'Abordare integrată, sănătate și alimentație împreună', en: 'Integrated approach — health and nutrition together', ru: 'Комплексный подход: здоровье и питание вместе' },
  },
];

/* Durations offered (brief §3). Price is set per case with the doctor. */
const DURATIONS: Bi[] = [
  { ro: '1 lună', en: '1 month', ru: '1 месяц' },
  { ro: '2 luni', en: '2 months', ru: '2 месяца' },
  { ro: '3 luni', en: '3 months', ru: '3 месяца' },
  { ro: '6 luni', en: '6 months', ru: '6 месяцев' },
];

const STEPS: { title: Bi; text: Bi }[] = [
  {
    title: { ro: 'Solicitare', en: 'Request', ru: 'Заявка' },
    text: {
      ro: 'Alegi tipul de abonament și ne spui pe scurt despre situație și obiective.',
      en: 'Choose the subscription type and tell us briefly about the situation and goals.',
      ru: 'Вы выбираете тип абонемента и кратко рассказываете о ситуации и целях.',
    },
  },
  {
    title: { ro: 'Te contactăm', en: 'We get in touch', ru: 'Мы связываемся' },
    text: {
      ro: 'Medicul te contactează și stabiliți împreună durata (1/2/3/6 luni) și prețul.',
      en: 'The doctor gets in touch and together you set the duration (1/2/3/6 months) and the price.',
      ru: 'Врач связывается с вами, и вы вместе определяете длительность (1/2/3/6 мес) и цену.',
    },
  },
  {
    title: { ro: 'Formular și plan', en: 'Form and plan', ru: 'Форма и план' },
    text: {
      ro: 'Completezi formularul medical și nutrițional, apoi primești planul de pornire.',
      en: 'You fill in the medical and nutrition form, then receive the starting plan.',
      ru: 'Вы заполняете медицинскую и нутрициологическую форму и получаете стартовый план.',
    },
  },
  {
    title: { ro: 'Monitorizare', en: 'Monitoring', ru: 'Наблюдение' },
    text: {
      ro: 'Te urmăresc pe durata abonamentului — verificări periodice, ajustări și mesagerie.',
      en: 'I follow you for the length of the subscription — periodic check-ins, adjustments, and messaging.',
      ru: 'Я сопровождаю вас на протяжении абонемента — периодические проверки, корректировки и переписка.',
    },
  },
];

const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { ro: 'Ce tipuri de abonament există?', en: 'What subscription types are there?', ru: 'Какие бывают типы абонемента?' },
    a: {
      ro: 'Patru: Pediatrie, Nutriție copii, Nutriție adulți și Complex (Pediatrie + Nutriție). Alegi tipul potrivit când soliciți abonamentul.',
      en: 'Four: Pediatrics, Child nutrition, Adult nutrition, and Complex (Pediatrics + Nutrition). You choose the right one when you request the subscription.',
      ru: 'Четыре: педиатрия, питание детей, питание взрослых и комплекс (педиатрия + питание). Нужный тип вы выбираете при оформлении заявки.',
    },
  },
  {
    q: { ro: 'Ce durată pot alege?', en: 'What durations can I choose?', ru: 'Какую длительность можно выбрать?' },
    a: {
      ro: 'Abonamentul poate fi pe 1, 2, 3 sau 6 luni. Durata potrivită o stabilim împreună, în funcție de obiective.',
      en: 'The subscription can be 1, 2, 3, or 6 months. We set the right length together, based on your goals.',
      ru: 'Абонемент может быть на 1, 2, 3 или 6 месяцев. Подходящую длительность определяем вместе, исходя из целей.',
    },
  },
  {
    q: { ro: 'Cât costă?', en: 'How much does it cost?', ru: 'Сколько это стоит?' },
    a: {
      ro: 'Prețul se stabilește individual, în funcție de tipul de abonament și de durată. După ce lași o solicitare, medicul te contactează și stabiliți împreună durata și prețul.',
      en: 'The price is set individually, based on the subscription type and duration. After you leave a request, the doctor contacts you and you set the duration and price together.',
      ru: 'Цена определяется индивидуально — в зависимости от типа абонемента и длительности. После заявки врач связывается с вами, и вы вместе согласуете срок и цену.',
    },
  },
  {
    q: { ro: 'Este pentru copii sau și pentru adulți?', en: 'Is it for children or adults too?', ru: 'Это для детей или также для взрослых?' },
    a: { ro: 'Pentru copii și adulți.', en: 'For children and adults.', ru: 'Для детей и взрослых.' },
  },
  {
    q: { ro: 'Cum se face plata?', en: 'How do I pay?', ru: 'Как происходит оплата?' },
    a: {
      ro: 'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după ce te contactăm.',
      en: 'By bank transfer (no online payment for now). You’ll get the details after we contact you.',
      ru: 'Банковским переводом (онлайн-оплаты пока нет). Реквизиты пришлём, когда свяжемся с вами.',
    },
  },
];

export default async function MonitoringPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const portrait = await siteMediaAsset('portrait_monitoring');
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Услуги' : en ? 'Services' : 'Servicii', href: '/services' },
          { label: ru ? 'Наблюдение и абонементы' : en ? 'Monitoring & subscriptions' : 'Monitorizare și abonamente' },
        ]}
      />
      {/* 1 · Hero — editorial split: statement left, description right (no photo) */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Абонементы · Онлайн-портал' : en ? 'Subscriptions · Online portal' : 'Abonamente · Portal online'}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.04] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    Наблюдение и <span className="serif-it text-sage">абонементы</span>
                  </>
                ) : en ? (
                  <>
                    Monitoring &amp; <span className="serif-it text-sage">subscriptions</span>
                  </>
                ) : (
                  <>
                    Monitorizare și <span className="serif-it text-sage">abonamente</span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[34ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {ru
                  ? 'Постоянное сопровождение между консультациями — на 1, 2, 3 или 6 месяцев.'
                  : en
                    ? 'Continuous guidance between consultations — over 1, 2, 3, or 6 months.'
                    : 'Acompaniere continuă între consultații — pe 1, 2, 3 sau 6 luni.'}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <BookGroupBButton
                  service="monitoring"
                  label={ru ? 'Оставить заявку' : en ? 'Request a subscription' : 'Solicită un abonament'}
                  className={btnDark}
                />
                <Link href="/pricing" className={underlineLg}>
                  {ru ? 'Смотреть тарифы' : en ? 'See pricing' : 'Vezi tarifele'} →
                </Link>
              </div>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                {ru ? 'Онлайн-портал · 1–6 месяцев' : en ? 'Online portal · 1–6 months' : 'Portal online · 1–6 luni'}
              </p>
              <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {ru
                  ? 'Четыре типа абонемента — педиатрия, питание детей, питание взрослых или комплекс. Я слежу за вашим прогрессом: периодические проверки, корректировки плана и прямая переписка между консультациями. Длительность и цену согласуем индивидуально.'
                  : en
                    ? 'Four subscription types — pediatrics, child nutrition, adult nutrition, or complex. I follow your progress: periodic check-ins, plan adjustments, and direct messaging between consultations. Duration and price are set individually.'
                    : 'Patru tipuri de abonament — pediatrie, nutriție copii, nutriție adulți sau complex. Îți urmăresc progresul: verificări periodice, ajustări ale planului și mesagerie directă între consultații. Durata și prețul le stabilim individual.'}
              </p>
              <p className="mono mt-8 border-t border-[var(--rule)] pt-6 text-[11px] uppercase tracking-[0.1em] leading-relaxed text-ink-soft">
                {ru
                  ? 'Врач-педиатр с магистратурой по питанию человека — постоянная поддержка, а не просто разовый совет'
                  : en
                    ? 'Pediatrician with a Master’s in Human Nutrition — steady support, not just one-off advice'
                    : 'Medic pediatru cu master în nutriție umană — sprijin constant, nu doar un sfat unic'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1b · Subscription types + durations (brief §3) */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-[1fr_1.3fr] md:gap-20 md:py-24">
          <div className="md:sticky md:top-[133px] md:self-start">
            <p className="eyebrow mb-3">{ru ? 'Абонементы' : en ? 'Subscriptions' : 'Abonamente'}</p>
            <h2 className="serif text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Четыре <span className="serif-it text-sage">типа</span>
                </>
              ) : en ? (
                <>
                  Four <span className="serif-it text-sage">types</span>
                </>
              ) : (
                <>
                  Patru <span className="serif-it text-sage">tipuri</span>
                </>
              )}
            </h2>
            <p className="mt-5 max-w-[42ch] text-[1.0125rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Длительность — 1, 2, 3 или 6 месяцев. Цена — по запросу: после заявки врач связывается с вами и вместе с вами назначает срок и цену.'
                : en
                  ? 'Duration — 1, 2, 3, or 6 months. Price — on request: after your request, the doctor contacts you and sets the length and price together with you.'
                  : 'Durată — 1, 2, 3 sau 6 luni. Preț — la cerere: după solicitare, medicul te contactează și stabiliți împreună durata și prețul.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <span
                  key={d.en}
                  className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-ink-soft"
                >
                  {lc(d)}
                </span>
              ))}
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {TYPES.map((it) => (
              <li
                key={it.name.en}
                className="border-t border-[var(--rule)] pt-5"
              >
                <h3 className="serif text-[1.35rem] leading-snug text-ink text-pretty">
                  {lc(it.name)}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
                  {lc(it.note)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2 · When to choose it */}
      <section className="shell py-20 md:py-28">
        <header className="max-w-[40rem]">
          <p className="eyebrow mb-3">{ru ? 'Вам это подходит?' : en ? 'Is it for you?' : 'Ți se potrivește?'}</p>
          <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-pretty">
            {ru ? (
              <>
                Кому это <span className="serif-it text-sage">подходит</span>
              </>
            ) : en ? (
              <>
                Who it’s <span className="serif-it text-sage">for</span>
              </>
            ) : (
              <>
                Pentru cine e <span className="serif-it text-sage">potrivită</span>
              </>
            )}
          </h2>
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
            <p className="eyebrow mb-3">{ru ? 'В программе' : en ? 'In the program' : 'În program'}</p>
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

      {/* 4 · How it works (olive band) */}
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

      {/* 5 · About the doctor — content left, portrait right */}
      <section className="shell grid items-start gap-12 border-b border-[var(--rule)] py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-20 md:py-28">
        <div className="md:sticky md:top-[133px] md:self-start">
          <p className="eyebrow mb-4">{ru ? 'О враче' : en ? 'About the doctor' : 'Despre medic'}</p>
          <h2 className="serif text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.06] tracking-[-0.02em] text-balance">
            {ru ? (
              <>
                Кто вас <span className="serif-it text-sage">сопровождает</span>
              </>
            ) : en ? (
              <>
                Who you’ll <span className="serif-it text-sage">work with</span>
              </>
            ) : (
              <>
                Cine te <span className="serif-it text-sage">însoțește</span>
              </>
            )}
          </h2>
          <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {ru
              ? 'Dr. Olesea Jalba — врач-педиатр с магистратурой по специальности «Общественное здоровье – Питание человека». На протяжении абонемента она ведёт вас целостно — здоровье и питание вместе — и корректирует план по мере того, как меняется ваша ситуация.'
              : en
                ? 'Dr. Olesea Jalba is a pediatrician with a Master’s in Public Health – Human Nutrition. Throughout the subscription she follows your case as a whole — health and nutrition together — and adjusts the plan as your situation evolves.'
                : 'Dr. Olesea Jalba este medic pediatru cu master în Sănătate Publică – Nutriție Umană. Pe durata abonamentului îți urmărește cazul în ansamblu — sănătate și alimentație împreună — și ajustează planul pe măsură ce situația evoluează.'}
          </p>
          <Link href="/about" className={`mt-9 ${underlineLg}`}>
            {ru ? 'Смотреть полный профиль' : en ? 'See full profile' : 'Vezi profilul complet'} →
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

      {/* 6 · Payment + what it doesn't replace (paper band) */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-2 md:gap-20 md:py-20">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Оплата' : en ? 'Payment' : 'Plată'}</p>
            <p className="max-w-[48ch] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Банковским переводом (онлайн-оплаты пока нет). Когда вы оставите заявку, мы свяжемся с вами, согласуем следующие шаги и пришлём реквизиты для оплаты.'
                : en
                  ? 'By bank transfer (no online payment for now). After you request a place, we contact you to agree on the next steps and send the payment details.'
                  : 'Prin transfer bancar (deocamdată fără plată online). După ce soliciți un loc, te contactăm pentru a stabili pașii următori și îți trimitem detaliile de plată.'}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">{ru ? 'Важно' : en ? 'Important' : 'Important'}</p>
            <p className="max-w-[56ch] leading-relaxed text-ink-soft text-pretty">
              {ru ? (
                <>
                  Сопровождение не подходит для неотложных ситуаций и не заменяет
                  лечение диагностированного заболевания. Если ситуация срочная, звоните{' '}
                  <span className="font-medium text-ink">112</span> или обратитесь в ближайшую службу
                  неотложной помощи.
                </>
              ) : en ? (
                <>
                  Monitoring isn’t for medical emergencies and doesn’t replace treatment for a
                  diagnosed condition. If the situation is urgent, call{' '}
                  <span className="font-medium text-ink">112</span> or go to the nearest emergency
                  service.
                </>
              ) : (
                <>
                  Acompanierea nu este pentru urgențe medicale și nu înlocuiește tratamentul unei
                  afecțiuni diagnosticate. Dacă situația e urgentă, sună la{' '}
                  <span className="font-medium text-ink">112</span> sau mergi la cel mai apropiat
                  serviciu de urgență.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 7 · FAQ — centered */}
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

      {/* 8 · Final CTA + cross-links (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Оставить заявку на <span className="serif-it text-[var(--sage-soft)]">абонемент</span>
                  </>
                ) : en ? (
                  <>
                    Request a <span className="serif-it text-[var(--sage-soft)]">subscription</span>
                  </>
                ) : (
                  <>
                    Solicită un <span className="serif-it text-[var(--sage-soft)]">abonament</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <BookGroupBButton
                  service="monitoring"
                  label={ru ? 'Оставить заявку' : en ? 'Request a subscription' : 'Solicită un abonament'}
                  className={creamPill}
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
                  <Link href="/integrative" className={creamUnderline}>
                    {ru ? 'Разовая глубокая оценка? → Интегративная консультация' : en ? 'A one-off deep assessment? → Integrative consultation' : 'O evaluare aprofundată unică? → Consultație integrativă'}
                  </Link>
                </li>
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
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
