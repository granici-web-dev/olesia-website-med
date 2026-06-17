import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { api, loc } from '@/lib/api';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import { Reveal } from '@/components/ui/Reveal';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Single-service landing for the Pediatric consultation (group A · 50 min ·
   video). Books the same Calendly event as the `pediatric` service. Content is
   bilingual (RO default · EN) and lives here so the page renders fully even if
   the API is unreachable; the API supplies only the Calendly scheduling URL.
   Visual language mirrors the homepage and the Services page.
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
      ? 'Online pediatric consultations | Dr. Olesea Jalba'
      : 'Consultații pediatrice online | Dr. Olesea Jalba',
    description: en
      ? 'Video pediatric consultation with a pediatrician: symptoms, digestion, the often-ill child, allergies, growth. Book online.'
      : 'Consultație pediatrică video cu un medic pediatru: simptome, digestie, copilul frecvent bolnav, alergii, creștere. Programează online.',
  };
}

type Bi = { ro: string; en: string };

const HELP: { label: Bi; text: Bi }[] = [
  {
    label: { ro: 'Simptome acute', en: 'Acute symptoms' },
    text: {
      ro: 'Febră, tuse, dureri, erupții — ce să faci și când să te îngrijorezi.',
      en: 'Fever, cough, pain, rashes — what to do and when to worry.',
    },
  },
  {
    label: { ro: 'Probleme digestive', en: 'Digestive issues' },
    text: {
      ro: 'Dureri abdominale, colici, constipație, diaree.',
      en: 'Abdominal pain, colic, constipation, diarrhea.',
    },
  },
  {
    label: { ro: 'Copilul care se îmbolnăvește des', en: 'The often-ill child' },
    text: {
      ro: 'Infecții respiratorii repetate și imunitate.',
      en: 'Repeated respiratory infections and immunity.',
    },
  },
  {
    label: { ro: 'Alergii', en: 'Allergies' },
    text: {
      ro: 'Erupții, rinită alergică, reacții alimentare.',
      en: 'Rashes, allergic rhinitis, food reactions.',
    },
  },
  {
    label: { ro: 'Creștere și dezvoltare', en: 'Growth and development' },
    text: {
      ro: 'Evaluarea progresului copilului.',
      en: "Assessing your child's progress.",
    },
  },
  {
    label: { ro: 'Alimentație și apetit', en: 'Feeding and appetite' },
    text: {
      ro: 'Dificultăți de hrănire, refuzul mâncării.',
      en: 'Feeding difficulties, food refusal.',
    },
  },
  {
    label: { ro: 'A doua opinie', en: 'A second opinion' },
    text: {
      ro: 'Verificarea unui diagnostic sau a unui tratament.',
      en: 'Reviewing a diagnosis or a treatment.',
    },
  },
];

const STEPS: { title: Bi; text: Bi }[] = [
  {
    title: { ro: 'Programare', en: 'Booking' },
    text: {
      ro: 'Alegi o oră potrivită și completezi un scurt formular despre copil.',
      en: 'Pick a suitable time and fill in a short form about your child.',
    },
  },
  {
    title: { ro: 'Apel video', en: 'Video call' },
    text: {
      ro: 'Te conectezi la apelul video de 50 de minute.',
      en: 'Join the 50-minute video call.',
    },
  },
  {
    title: { ro: 'Consultația', en: 'The consultation' },
    text: {
      ro: 'Discutăm împreună simptomele, istoricul și documentele pregătite.',
      en: 'Together we go through symptoms, history, and the documents you prepared.',
    },
  },
  {
    title: { ro: 'Rezumat scris', en: 'Written summary' },
    text: {
      ro: 'Primești o evaluare clară și un rezumat scris cu recomandări.',
      en: 'You get a clear assessment and a written summary with recommendations.',
    },
  },
];

const FOCUS: Bi[] = [
  { ro: 'Nutriție și dificultăți de hrănire', en: 'Nutrition and feeding difficulties' },
  { ro: 'Probleme digestive', en: 'Digestive issues' },
  { ro: 'Copilul frecvent bolnav', en: 'The often-ill child' },
  { ro: 'Alergologie', en: 'Allergology' },
];

const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { ro: 'Pot primi o rețetă în urma consultației?', en: 'Can I get a prescription after the consultation?' },
    a: {
      ro: 'În funcție de situație și de reglementările în vigoare. Dacă o rețetă nu poate fi emisă online sau e nevoie de o examinare fizică, îți explicăm clar și te îndrumăm.',
      en: 'It depends on the situation and current regulations. If a prescription can’t be issued online or a physical exam is needed, we’ll explain clearly and guide you.',
    },
  },
  {
    q: { ro: 'În ce limbi pot discuta cu medicul?', en: 'Which languages can I speak with the doctor?' },
    a: { ro: 'Română, rusă și engleză.', en: 'Romanian, Russian, and English.' },
  },
  {
    q: { ro: 'Trebuie să fie copilul prezent la apel?', en: 'Does my child need to be on the call?' },
    a: {
      ro: 'De obicei da — ajută medicul să observe copilul. Te anunțăm dacă într-un caz anume nu este necesar.',
      en: 'Usually yes — it helps the doctor observe your child. We’ll let you know if it isn’t needed in a particular case.',
    },
  },
  {
    q: { ro: 'Cum se face plata?', en: 'How do I pay?' },
    a: {
      ro: 'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după confirmarea programării.',
      en: 'By bank transfer (no online payment for now). You’ll get the details once your booking is confirmed.',
    },
  },
  {
    q: { ro: 'Pot reprograma sau anula?', en: 'Can I reschedule or cancel?' },
    a: {
      ro: 'Da, din linkul de confirmare, cu cel puțin 24 de ore înainte.',
      en: 'Yes, from your confirmation link at least 24 hours ahead.',
    },
  },
  {
    q: { ro: 'Ce documente să pregătesc?', en: 'What documents should I prepare?' },
    a: {
      ro: 'Analize recente, rezultate anterioare și lista medicamentelor administrate.',
      en: 'Recent lab work, previous results, and a list of any medication given.',
    },
  },
];

/* Shared class strings (mirror the homepage / Services page). */
const btnDark =
  'inline-flex cursor-pointer items-center bg-ink px-[22px] py-[14px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';
const underlineLg =
  'inline-block cursor-pointer border-b border-ink pb-1 text-sm text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';
const creamPill =
  'inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-soft)]';
const creamUnderline =
  'inline-block cursor-pointer border-b border-[var(--sage-soft)] pb-0.5 text-sm text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage-soft)]';

export default async function PediatricsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const lc = (b: Bi) => (en ? b.en : b.ro);

  // Calendly URL for the pediatric service (group A). API supplies only this.
  const pediatricUrl =
    (await api.services()).find((s) => s.code === 'pediatric')?.calendlySchedulingUrl ?? null;

  const bookLabel = en ? 'Book a consultation' : 'Programează o consultație';
  const bookReason = en ? 'Pediatric consultation' : 'Consultație pediatrică';

  const BookPrimary = ({ className, label }: { className: string; label: string }) =>
    pediatricUrl ? (
      <CalendlyButton url={pediatricUrl} reason={bookReason} label={label} withArrow={false} className={className} />
    ) : (
      <Link href="/contact" className={className}>
        {label}
      </Link>
    );

  return (
    <main className="bg-cream text-ink">
      {/* 1 · Hero — editorial split: statement left, description right (no photo) */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {en ? 'Pediatrics · Video consultation' : 'Pediatrie · Consultație video'}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.04] tracking-[-0.015em] text-balance">
                {en ? (
                  <>
                    Online <span className="serif-it text-sage">pediatric</span> consultations
                  </>
                ) : (
                  <>
                    Consultații <span className="serif-it text-sage">pediatrice</span> online
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[32ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {en ? "For your child's health, from home." : 'Pentru sănătatea copilului tău, de acasă.'}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <BookPrimary className={btnDark} label={bookLabel} />
                <Link href="/pricing" className={underlineLg}>
                  {en ? 'See pricing' : 'Vezi tarifele'} →
                </Link>
              </div>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                {en ? 'Video call · 50 min' : 'Apel video · 50 min'}
              </p>
              <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {en
                  ? 'Talk to a pediatrician about symptoms, digestion, allergies, growth and development — with no waiting room.'
                  : 'Discută cu un medic pediatru despre simptome, digestie, alergii, creștere și dezvoltare — fără sală de așteptare.'}
              </p>
              <p className="mono mt-8 border-t border-[var(--rule)] pt-6 text-[11px] uppercase tracking-[0.1em] leading-relaxed text-ink-soft">
                {en
                  ? 'Pediatrician · hospital and outpatient experience · member of the Society of Pediatrics'
                  : 'Medic pediatru · experiență în spital și ambulatoriu · membră a Societății de Pediatrie'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · What it helps with (core + SEO) */}
      <section className="shell py-20 md:py-28">
        <header className="max-w-[46rem]">
          <p className="eyebrow mb-3">{en ? 'Reasons to book' : 'Motive să programezi'}</p>
          <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-pretty">
            {en ? (
              <>
                What a pediatric consultation <span className="serif-it text-sage">helps with</span>
              </>
            ) : (
              <>
                Cu ce te poate <span className="serif-it text-sage">ajuta</span> o consultație
                pediatrică
              </>
            )}
          </h2>
        </header>
        <div className="mt-12 grid gap-x-12 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {HELP.map((it, i) => (
            <Reveal
              key={it.label.en}
              delay={(i % 3) * 70}
              className="border-t border-[var(--rule)] pt-6"
            >
              <h3 className="serif text-[1.4rem] leading-snug tracking-[-0.01em]">{lc(it.label)}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
                {lc(it.text)}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3 · How the consultation works (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-28">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
            {en ? 'Step by step' : 'Pas cu pas'}
          </p>
          <h2 className="serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.0] tracking-[-0.02em] text-cream text-balance">
            {en ? (
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
        <div className="md:sticky md:top-28 md:self-start">
          <p className="eyebrow mb-4">{en ? 'About the doctor' : 'Despre medic'}</p>
          <h2 className="serif text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.06] tracking-[-0.02em] text-balance">
            {en ? (
              <>
                Who you’ll <span className="serif-it text-sage">see</span>
              </>
            ) : (
              <>
                Cine te <span className="serif-it text-sage">consultă</span>
              </>
            )}
          </h2>
          <p className="mt-6 max-w-[56ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {en
              ? 'Dr. Olesea Jalba is a pediatrician with additional training in child nutrition and pediatric gastroenterology. She has worked in both hospital and outpatient settings and regularly takes part in specialty conferences and courses.'
              : 'Dr. Olesea Jalba este medic pediatru, cu pregătire suplimentară în nutriția copilului și gastroenterologie pediatrică. A lucrat în spital și în ambulatoriu și participă constant la conferințe și cursuri de specialitate.'}
          </p>
          <p className="eyebrow mt-9 mb-3">{en ? 'Focus areas' : 'Domenii de focus'}</p>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {FOCUS.map((f) => (
              <li
                key={f.en}
                className="grid grid-cols-[1.1em_1fr] gap-x-2 text-[0.95rem] leading-relaxed text-ink"
              >
                <span aria-hidden="true" className="text-sage">
                  —
                </span>
                <span className="text-pretty">{lc(f)}</span>
              </li>
            ))}
          </ul>
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

      {/* 5 · Age range + what it doesn't replace (calm band) */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-2 md:gap-20 md:py-20">
          <div>
            <p className="eyebrow mb-3">{en ? 'Ages' : 'Vârste'}</p>
            <p className="serif text-[clamp(1.5rem,2.6vw,2.2rem)] leading-snug tracking-[-0.01em] text-balance">
              {en ? 'From newborns to teenagers.' : 'De la nou-născuți până la adolescenți.'}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">{en ? 'Important' : 'Important'}</p>
            <p className="max-w-[56ch] leading-relaxed text-ink-soft text-pretty">
              {en ? (
                <>
                  An online consultation isn’t meant for medical emergencies. If your child’s
                  condition is serious or worsening fast, call{' '}
                  <span className="font-medium text-ink">112</span> or go to the nearest emergency
                  service. Some situations may need a physical exam or further tests — we’ll tell you
                  clearly and guide you.
                </>
              ) : (
                <>
                  Consultația video nu este destinată urgențelor medicale. Dacă starea copilului este
                  gravă sau se agravează rapid, sună la{' '}
                  <span className="font-medium text-ink">112</span> sau mergi la cel mai apropiat
                  serviciu de urgență. Unele situații pot necesita o examinare fizică sau
                  investigații suplimentare — în acest caz îți spunem clar și te îndrumăm.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 6 · FAQ — centered */}
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

      {/* 7 · Final CTA + cross-links (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {en ? (
                  <>
                    Book a pediatric <span className="serif-it text-[var(--sage-soft)]">consultation</span>
                  </>
                ) : (
                  <>
                    Programează o consultație <span className="serif-it text-[var(--sage-soft)]">pediatrică</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <BookPrimary
                  className={creamPill}
                  label={en ? 'Book a time (50 min, video)' : 'Programează o oră (50 min, video)'}
                />
                <span className="text-sm text-[var(--sage-soft)]">
                  {en ? 'Have just one question? ' : 'Ai o singură întrebare? '}
                  <BookGroupBButton
                    service="quick_question"
                    label={en ? 'Ask the doctor (48h reply) →' : 'Întreabă medicul (răspuns în 48h) →'}
                    className={creamUnderline}
                  />
                </span>
              </div>
            </div>

            <div className="shrink-0 border-t border-[rgba(245,241,234,0.18)] pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
                {en ? 'Other services' : 'Alte servicii'}
              </p>
              <ul className="grid gap-3 text-[1.05rem]">
                <li>
                  <Link href="/services#nutrition" className={creamUnderline}>
                    {en ? 'Feeding problems? → Nutrition consultation' : 'Probleme de alimentație? → Consultație de nutriție'}
                  </Link>
                </li>
                <li>
                  <Link href="/integrative" className={creamUnderline}>
                    {en
                      ? 'Complex case or need monitoring? → Integrative consultation'
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
