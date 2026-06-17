import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { loc } from '@/lib/api';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import { Reveal } from '@/components/ui/Reveal';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Single-service landing for 3-month monitoring (group B · portal). No
   calendar/video booking — the CTA opens the lead form (`monitoring`). The
   page's job is to frame this as continuous support over time, distinct from a
   one-off consultation. Bilingual (RO default · EN); content is local.
   ────────────────────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  return {
    title: en
      ? '3-month monitoring | Dr. Olesea Jalba'
      : 'Monitorizare 3 luni | Dr. Olesea Jalba',
    description: en
      ? 'Continuous support over three months: periodic check-ins, plan adjustments, and priority messaging with a pediatrician and nutrition specialist.'
      : 'Acompaniere continuă timp de trei luni: verificări periodice, ajustări ale planului și mesagerie prioritară cu un medic pediatru și nutriționist.',
  };
}

type Bi = { ro: string; en: string };

const CHOOSE_WHEN: Bi[] = [
  { ro: 'Vrei sprijin constant, nu o vizită singulară.', en: 'You want steady support, not a one-off visit.' },
  { ro: 'Lucrezi la un obiectiv de durată — alimentație, creștere, un plan.', en: 'You’re working toward a longer goal — diet, growth, a plan.' },
  { ro: 'Ai nevoie de ajustări pe parcurs, pe măsură ce lucrurile se schimbă.', en: 'You need adjustments along the way, as things change.' },
  { ro: 'Vrei să poți întreba medicul între consultații.', en: 'You want to be able to ask the doctor between consultations.' },
];

const INCLUDES: Bi[] = [
  { ro: 'Monitorizarea cazului timp de 3 luni', en: 'Case monitoring for 3 months' },
  { ro: 'Verificări periodice', en: 'Periodic check-ins' },
  { ro: 'Ajustarea planului pe parcurs', en: 'Plan adjustments along the way' },
  { ro: 'Mesagerie prioritară cu medicul', en: 'Priority messaging with the doctor' },
];

const STEPS: { title: Bi; text: Bi }[] = [
  {
    title: { ro: 'Solicitare', en: 'Request' },
    text: {
      ro: 'Soliciți un loc și ne spui pe scurt despre situație și obiective.',
      en: 'Request a spot and tell us briefly about the situation and goals.',
    },
  },
  {
    title: { ro: 'Plan de pornire', en: 'Starting plan' },
    text: {
      ro: 'Stabilim împreună planul de pornire și pașii pentru următoarele luni.',
      en: 'Together we set the starting plan and the steps for the coming months.',
    },
  },
  {
    title: { ro: 'Urmărire 3 luni', en: '3-month follow-up' },
    text: {
      ro: 'Te urmăresc timp de trei luni — verificări periodice și mesagerie.',
      en: 'I follow you for three months — periodic check-ins and messaging.',
    },
  },
  {
    title: { ro: 'Ajustări', en: 'Adjustments' },
    text: {
      ro: 'Ajustăm planul pe parcurs, pe măsură ce lucrurile se schimbă.',
      en: 'We adjust the plan along the way, as things change.',
    },
  },
];

const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { ro: 'Ce include monitorizarea de 3 luni?', en: 'What does 3-month monitoring include?' },
    a: {
      ro: 'Urmărirea cazului timp de trei luni, verificări periodice, ajustarea planului pe parcurs și mesagerie prioritară pentru întrebări între consultații.',
      en: 'Case follow-up over three months, periodic check-ins, plan adjustments along the way, and priority messaging for questions between consultations.',
    },
  },
  {
    q: { ro: 'Cât de des comunicăm?', en: 'How often do we talk?' },
    a: {
      ro: 'Prin verificări periodice și mesagerie pentru întrebări între consultații — în ritmul potrivit situației tale.',
      en: 'Through periodic check-ins and messaging for questions between consultations — at the pace your situation needs.',
    },
  },
  {
    q: { ro: 'Este pentru copii sau și pentru adulți?', en: 'Is it for children or adults too?' },
    a: { ro: 'Pentru copii și adulți.', en: 'For children and adults.' },
  },
  {
    q: { ro: 'Pot continua după 3 luni?', en: 'Can I continue after 3 months?' },
    a: {
      ro: 'Da, poți continua programul dacă vrei sprijin în continuare.',
      en: 'Yes — you can continue the program if you want ongoing support.',
    },
  },
  {
    q: { ro: 'Cum se face plata?', en: 'How do I pay?' },
    a: {
      ro: 'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după ce te contactăm.',
      en: 'By bank transfer (no online payment for now). You’ll get the details after we contact you.',
    },
  },
];

/* Shared class strings (mirror the other service landings). */
const btnDark =
  'inline-flex cursor-pointer items-center bg-ink px-[22px] py-[14px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';
const underlineLg =
  'inline-block cursor-pointer border-b border-ink pb-1 text-sm text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';
const creamPill =
  'inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-soft)]';
const creamUnderline =
  'inline-block cursor-pointer border-b border-[var(--sage-soft)] pb-0.5 text-sm text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage-soft)]';

export default async function MonitoringPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const lc = (b: Bi) => (en ? b.en : b.ro);

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: en ? 'Home' : 'Acasă', href: '/' },
          { label: en ? 'Services' : 'Servicii', href: '/services' },
          { label: en ? '3-month monitoring' : 'Monitorizare 3 luni' },
        ]}
      />
      {/* 1 · Hero — editorial split: statement left, description right (no photo) */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {en ? 'Support · Online portal' : 'Acompaniere · Portal online'}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.04] tracking-[-0.015em] text-balance">
                {en ? (
                  <>
                    <span className="serif-it text-sage">3-month</span> monitoring
                  </>
                ) : (
                  <>
                    Monitorizare <span className="serif-it text-sage">3 luni</span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[34ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {en
                  ? 'Continuous guidance, between consultations.'
                  : 'Acompaniere continuă, între consultații.'}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <BookGroupBButton
                  service="monitoring"
                  label={en ? 'Request a place' : 'Solicită un loc'}
                  className={btnDark}
                />
                <Link href="/pricing" className={underlineLg}>
                  {en ? 'See pricing' : 'Vezi tarifele'} →
                </Link>
              </div>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                {en ? 'Online portal · 3 months' : 'Portal online · 3 luni'}
              </p>
              <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {en
                  ? 'I follow your progress for three months — periodic check-ins, plan adjustments, and direct messaging for questions between consultations.'
                  : 'Îți urmăresc progresul timp de trei luni — verificări periodice, ajustări ale planului și mesagerie directă pentru întrebări între consultații.'}
              </p>
              <p className="mono mt-8 border-t border-[var(--rule)] pt-6 text-[11px] uppercase tracking-[0.1em] leading-relaxed text-ink-soft">
                {en
                  ? 'Pediatrician with a Master’s in Human Nutrition — steady support, not just one-off advice'
                  : 'Medic pediatru cu master în nutriție umană — sprijin constant, nu doar un sfat unic'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · When to choose it */}
      <section className="shell py-20 md:py-28">
        <header className="max-w-[40rem]">
          <p className="eyebrow mb-3">{en ? 'Is it for you?' : 'Ți se potrivește?'}</p>
          <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-pretty">
            {en ? (
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
            <p className="eyebrow mb-3">{en ? 'In the program' : 'În program'}</p>
            <h2 className="serif text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-balance">
              {en ? (
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
            {en ? 'Step by step' : 'Pas cu pas'}
          </p>
          <h2 className="serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.0] tracking-[-0.02em] text-cream text-balance">
            {en ? (
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
          <p className="eyebrow mb-4">{en ? 'About the doctor' : 'Despre medic'}</p>
          <h2 className="serif text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.06] tracking-[-0.02em] text-balance">
            {en ? (
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
            {en
              ? 'Dr. Olesea Jalba is a pediatrician with a Master’s in Public Health – Human Nutrition. Over three months she follows your case as a whole — health and nutrition together — and adjusts the plan as your situation evolves.'
              : 'Dr. Olesea Jalba este medic pediatru cu master în Sănătate Publică – Nutriție Umană. Timp de trei luni îți urmărește cazul în ansamblu — sănătate și alimentație împreună — și ajustează planul pe măsură ce situația evoluează.'}
          </p>
          <Link href="/about" className={`mt-9 ${underlineLg}`}>
            {en ? 'See full profile' : 'Vezi profilul complet'} →
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[420px] md:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e9e1d0]">
            <Image
              src="/assets/olesea-portrait.webp"
              alt={
                en
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
            <p className="eyebrow mb-3">{en ? 'Payment' : 'Plată'}</p>
            <p className="max-w-[48ch] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'By bank transfer (no online payment for now). After you request a place, we contact you to agree on the next steps and send the payment details.'
                : 'Prin transfer bancar (deocamdată fără plată online). După ce soliciți un loc, te contactăm pentru a stabili pașii următori și îți trimitem detaliile de plată.'}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">{en ? 'Important' : 'Important'}</p>
            <p className="max-w-[56ch] leading-relaxed text-ink-soft text-pretty">
              {en ? (
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
          <p className="eyebrow mb-3">{en ? 'Good to know' : 'Bine de știut'}</p>
          <h2 className="serif text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.0] tracking-[-0.02em] text-balance">
            {en ? (
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
                {en ? (
                  <>
                    Request a place in <span className="serif-it text-[var(--sage-soft)]">monitoring</span>
                  </>
                ) : (
                  <>
                    Solicită un loc în <span className="serif-it text-[var(--sage-soft)]">monitorizare</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <BookGroupBButton
                  service="monitoring"
                  label={en ? 'Request a place' : 'Solicită un loc'}
                  className={creamPill}
                />
                <span className="text-sm text-[var(--sage-soft)]">
                  {en ? 'Not sure what fits? ' : 'Nu ești sigur ce ți se potrivește? '}
                  <Link href="/services" className={creamUnderline}>
                    {en ? 'See all services →' : 'Vezi toate serviciile →'}
                  </Link>
                </span>
              </div>
            </div>

            <div className="shrink-0 border-t border-[rgba(245,241,234,0.18)] pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
                {en ? 'Other services' : 'Alte servicii'}
              </p>
              <ul className="grid gap-3 text-[1.05rem]">
                <li>
                  <Link href="/integrative" className={creamUnderline}>
                    {en ? 'A one-off deep assessment? → Integrative consultation' : 'O evaluare aprofundată unică? → Consultație integrativă'}
                  </Link>
                </li>
                <li>
                  <Link href="/pediatrics" className={creamUnderline}>
                    {en ? 'Just a health issue? → Pediatric consultation' : 'Doar o problemă de sănătate? → Consultație pediatrică'}
                  </Link>
                </li>
                <li>
                  <Link href="/nutrition" className={creamUnderline}>
                    {en ? 'Just nutrition? → Nutrition consultation' : 'Doar alimentație? → Consultație de nutriție'}
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
