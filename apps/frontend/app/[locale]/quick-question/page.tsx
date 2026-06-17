import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import { Reveal } from '@/components/ui/Reveal';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Single-service landing for the Quick question (group B · portal). No
   calendar/video booking — the CTA opens the lead form (`quick_question`). The
   page's job: a specific, non-urgent question → a written answer in 48h, with a
   clear "not for emergencies" boundary. Bilingual (RO default · EN); local copy.
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
      ? 'Quick question — answer in 48h | Dr. Olesea Jalba'
      : 'Întrebare rapidă — răspuns în 48h | Dr. Olesea Jalba',
    description: en
      ? 'Have one specific, non-urgent question? Get a written, documented answer from a pediatrician within 48 hours. Photos and documents welcome.'
      : 'Ai o întrebare punctuală, non-urgentă? Primești un răspuns scris și documentat de la un medic pediatru în 48 de ore. Poți atașa poze și documente.',
  };
}

type Bi = { ro: string; en: string };

const STEPS: { title: Bi; text: Bi }[] = [
  {
    title: { ro: 'Trimiți întrebarea', en: 'Send your question' },
    text: {
      ro: 'Completezi un formular scurt — adaugă poze sau documente, dacă e cazul.',
      en: 'Fill in a short form — add photos or documents if needed.',
    },
  },
  {
    title: { ro: 'Medicul analizează', en: 'The doctor reviews' },
    text: {
      ro: 'Medicul citește întrebarea și contextul și pregătește un răspuns documentat.',
      en: 'The doctor reads your question and context and prepares a documented answer.',
    },
  },
  {
    title: { ro: 'Răspuns în 48h', en: 'Answer in 48h' },
    text: {
      ro: 'Primești răspunsul scris în 48 de ore, cu o rundă de clarificări.',
      en: 'You get the written answer within 48 hours, with one round of clarification.',
    },
  },
];

const GET: Bi[] = [
  { ro: 'Trimiți întrebarea (cu poze sau documente, dacă e cazul)', en: 'Submit your question (with photos or documents if needed)' },
  { ro: 'Un răspuns scris și documentat în 48 de ore', en: 'A written, documented answer within 48 hours' },
  { ro: 'O rundă de clarificări', en: 'One round of clarification' },
];

const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { ro: 'Cât de repede primesc răspunsul?', en: 'How fast do I get the answer?' },
    a: { ro: 'În maximum 48 de ore de la trimiterea întrebării.', en: 'Within 48 hours of sending your question.' },
  },
  {
    q: { ro: 'Pot atașa poze sau documente?', en: 'Can I attach photos or documents?' },
    a: {
      ro: 'Da, le poți adăuga la întrebare — ajută medicul să înțeleagă mai bine contextul.',
      en: 'Yes — add them to your question; they help the doctor understand the context.',
    },
  },
  {
    q: { ro: 'Pot pune întrebări suplimentare?', en: 'Can I ask follow-up questions?' },
    a: { ro: 'Da, este inclusă o rundă de clarificări.', en: 'Yes — one round of clarification is included.' },
  },
  {
    q: { ro: 'Este pentru urgențe?', en: 'Is it for emergencies?' },
    a: {
      ro: 'Nu. Întrebarea rapidă este pentru situații non-urgente. Dacă situația e urgentă, sună la 112.',
      en: 'No. Quick question is for non-urgent situations. If it’s urgent, call 112.',
    },
  },
  {
    q: { ro: 'În ce limbi pot scrie?', en: 'Which languages can I write in?' },
    a: { ro: 'Română, rusă și engleză.', en: 'Romanian, Russian, and English.' },
  },
  {
    q: { ro: 'Cum se face plata?', en: 'How do I pay?' },
    a: {
      ro: 'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după trimiterea întrebării.',
      en: 'By bank transfer (no online payment for now). You’ll get the details after sending your question.',
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

export default async function QuickQuestionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const lc = (b: Bi) => (en ? b.en : b.ro);

  return (
    <main className="bg-cream text-ink">
      {/* 1 · Hero — editorial split: statement left, description right (no photo) */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {en ? 'Quick question · Online portal' : 'Întrebare rapidă · Portal online'}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[16ch] text-[clamp(2.4rem,5.4vw,4.8rem)] leading-[1.05] tracking-[-0.015em] text-balance">
                {en ? (
                  <>
                    One question, an <span className="serif-it text-sage">answer</span> in 48 hours
                  </>
                ) : (
                  <>
                    O întrebare, un <span className="serif-it text-sage">răspuns</span> în 48 de ore
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[36ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {en
                  ? 'For a specific question, without a full consultation.'
                  : 'Pentru o întrebare punctuală, fără o consultație completă.'}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <BookGroupBButton
                  service="quick_question"
                  label={en ? 'Ask your question' : 'Trimite întrebarea'}
                  className={btnDark}
                />
                <Link href="/pricing" className={underlineLg}>
                  {en ? 'See pricing' : 'Vezi tarifele'} →
                </Link>
              </div>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                {en ? 'Online portal · 48h reply' : 'Portal online · răspuns în 48h'}
              </p>
              <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {en
                  ? 'Send your question (with photos or documents if needed) and get a written, documented answer from the doctor.'
                  : 'Trimite întrebarea ta (cu poze sau documente, dacă e cazul) și primești un răspuns scris și documentat de la medic.'}
              </p>
              <p className="mono mt-8 border-t border-[var(--rule)] pt-6 text-[11px] uppercase tracking-[0.1em] leading-relaxed text-ink-soft">
                {en
                  ? 'A written answer from a pediatrician with a Master’s in Human Nutrition'
                  : 'Răspuns scris de un medic pediatru cu master în nutriție umană'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · How it works (olive band, 3 steps) */}
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
                Cum <span className="serif-it text-[var(--sage-soft)]">funcționează</span>
              </>
            )}
          </h2>

          <div className="relative mt-14 grid gap-x-8 gap-y-12 md:mt-16 md:grid-cols-3">
            <span
              className="pointer-events-none absolute inset-x-0 top-8 hidden h-px bg-[rgba(245,241,234,0.2)] md:block"
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

      {/* 3 · What you get + who it's for */}
      <section className="shell grid gap-12 py-20 md:grid-cols-[1.1fr_0.9fr] md:gap-20 md:py-28">
        <div>
          <p className="eyebrow mb-3">{en ? 'What you get' : 'Ce primești'}</p>
          <h2 className="serif text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-balance">
            {en ? (
              <>
                A clear, written <span className="serif-it text-sage">answer</span>
              </>
            ) : (
              <>
                Un răspuns clar, în <span className="serif-it text-sage">scris</span>
              </>
            )}
          </h2>
          <ul className="mt-8 grid gap-4">
            {GET.map((it) => (
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
        <div className="md:pt-12">
          <p className="eyebrow mb-3">{en ? 'Best for' : 'Pentru ce e potrivită'}</p>
          <p className="max-w-[42ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {en
              ? 'A specific, non-urgent question that doesn’t need a full video consultation — when you want a documented answer in writing.'
              : 'O întrebare punctuală, non-urgentă, care nu necesită o consultație video completă — când vrei un răspuns documentat, în scris.'}
          </p>
        </div>
      </section>

      {/* 4 · Not for emergencies (calm safety band) */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-2 md:gap-20 md:py-20">
          <div>
            <p className="eyebrow mb-3">{en ? 'Payment' : 'Plată'}</p>
            <p className="max-w-[48ch] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'By bank transfer (no online payment for now). You’ll get the details after sending your question.'
                : 'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după trimiterea întrebării.'}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">{en ? 'Important' : 'Important'}</p>
            <p className="max-w-[56ch] leading-relaxed text-ink-soft text-pretty">
              {en ? (
                <>
                  Quick question isn’t for emergencies. If the situation is urgent or worsening
                  fast, call <span className="font-medium text-ink">112</span> or go to the nearest
                  emergency service.
                </>
              ) : (
                <>
                  Întrebarea rapidă nu este pentru urgențe. Dacă situația e urgentă sau se agravează
                  rapid, sună la <span className="font-medium text-ink">112</span> sau mergi la cel
                  mai apropiat serviciu de urgență.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 5 · FAQ — centered */}
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

      {/* 6 · Final CTA + cross-links (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {en ? (
                  <>
                    Ask your <span className="serif-it text-[var(--sage-soft)]">question</span>
                  </>
                ) : (
                  <>
                    Trimite <span className="serif-it text-[var(--sage-soft)]">întrebarea</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <BookGroupBButton
                  service="quick_question"
                  label={en ? 'Ask your question' : 'Trimite întrebarea'}
                  className={creamPill}
                />
                <span className="text-sm text-[var(--sage-soft)]">
                  {en ? 'Need more than a question? ' : 'Ai nevoie de mai mult? '}
                  <Link href="/services" className={creamUnderline}>
                    {en ? 'See the consultations →' : 'Vezi consultațiile →'}
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
                  <Link href="/pediatrics" className={creamUnderline}>
                    {en ? 'Child’s health concern? → Pediatric consultation' : 'Probleme de sănătate ale copilului? → Consultație pediatrică'}
                  </Link>
                </li>
                <li>
                  <Link href="/nutrition" className={creamUnderline}>
                    {en ? 'Feeding or diet? → Nutrition consultation' : 'Alimentație sau dietă? → Consultație de nutriție'}
                  </Link>
                </li>
                <li>
                  <Link href="/integrative" className={creamUnderline}>
                    {en ? 'A complex case? → Integrative consultation' : 'Un caz complex? → Consultație integrativă'}
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
