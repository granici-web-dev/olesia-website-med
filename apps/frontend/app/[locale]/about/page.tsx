import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   About — the site's trust anchor (every landing links here via "Vezi profilul
   complet"). Built from CV facts, but curated and human, not a CV dump.
   Bilingual (RO default · EN); content is local. First-person voice.
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
      ? 'About Dr. Olesea Jalba — pediatrician and nutrition specialist'
      : 'Despre Dr. Olesea Jalba — medic pediatru și nutriționist',
    description: en
      ? 'Pediatrician with a master’s in human nutrition and experience in pediatric gastroenterology. Consultations in Romanian, Russian, and English.'
      : 'Medic pediatru cu master în nutriție umană și experiență în gastroenterologie pediatrică. Consultații în română, rusă și engleză.',
  };
}

type Bi = { ro: string; en: string };
type BiList = { ro: string[]; en: string[] };

const FOCUS: Bi[] = [
  { ro: 'Probleme digestive la copii — un domeniu cu care lucrez încă de la începutul carierei.', en: 'Digestive issues in children — an area I’ve worked in since the start of my career.' },
  { ro: 'Nutriția și dificultățile de hrănire — inclusiv refuzul mâncării și diversificarea.', en: 'Nutrition and feeding difficulties — including food refusal and starting solids.' },
  { ro: 'Copilul care se îmbolnăvește des.', en: 'The often-ill child.' },
  { ro: 'Alergologie pediatrică.', en: 'Pediatric allergology.' },
  { ro: 'Creșterea și dezvoltarea copilului.', en: 'Child growth and development.' },
];

const ADVANTAGES: { key: 'whole' | 'one' | 'evidence'; title: Bi; text: Bi }[] = [
  {
    key: 'whole',
    title: { ro: 'O privire de ansamblu', en: 'A whole-picture view' },
    text: {
      ro: 'Sănătatea și alimentația, evaluate împreună — nu pe bucăți.',
      en: 'Health and nutrition, assessed together — not in pieces.',
    },
  },
  {
    key: 'one',
    title: { ro: 'Un singur specialist', en: 'One specialist' },
    text: {
      ro: 'Nu mai mergi de la un medic la altul pentru sănătate și nutriție.',
      en: 'No going from one doctor to another for health and nutrition.',
    },
  },
  {
    key: 'evidence',
    title: { ro: 'Plan pe bază de dovezi', en: 'An evidence-based plan' },
    text: {
      ro: 'Recomandări fundamentate pe pregătire pediatrică și nutrițională.',
      en: 'Recommendations grounded in pediatric and nutrition training.',
    },
  },
];

/** Line icons for the advantages band (sage-soft on olive). */
function AdvIcon({ k }: { k: 'whole' | 'one' | 'evidence' }) {
  const p = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'size-5',
    'aria-hidden': true,
  };
  if (k === 'whole')
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  if (k === 'one')
    return (
      <svg {...p}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      </svg>
    );
  return (
    <svg {...p}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M9.5 13l2 2 3.5-4" />
    </svg>
  );
}

interface CvEntry {
  label: Bi;
  body?: Bi[];
  items?: BiList;
}

const CV: CvEntry[] = [
  {
    label: { ro: 'Experiență', en: 'Experience' },
    body: [
      {
        ro: 'Lucrez ca medic pediatru la Spitalul Clinic Municipal de Copii „Valentin Ignatenco” și la clinica Harper Medklinic din Chișinău.',
        en: 'I work as a pediatrician at the “Valentin Ignatenco” Municipal Children’s Clinical Hospital and at the Harper Medklinic clinic in Chișinău.',
      },
      {
        ro: 'Înainte de a deveni medic, am lucrat opt ani ca asistentă medicală în secția de gastroenterologie a Institutului Mamei și Copilului — de aici vine și interesul meu pentru sănătatea digestivă a copiilor.',
        en: 'Before becoming a doctor, I worked for eight years as a nurse in the gastroenterology department of the Mother and Child Institute — that’s where my interest in children’s digestive health comes from.',
      },
    ],
  },
  {
    label: { ro: 'Studii', en: 'Education' },
    items: {
      ro: [
        'Master în Sănătate Publică – Nutriție Umană, USMF „Nicolae Testemițanu” (2025)',
        'Rezidențiat în Pediatrie, USMF „Nicolae Testemițanu” (2018)',
        'Studii superioare în Medicină Generală, USMF „Nicolae Testemițanu” (2014)',
      ],
      en: [
        'MSc in Public Health – Human Nutrition, USMF “Nicolae Testemițanu” (2025)',
        'Residency in Pediatrics, USMF “Nicolae Testemițanu” (2018)',
        'Degree in General Medicine, USMF “Nicolae Testemițanu” (2014)',
      ],
    },
  },
  {
    label: { ro: 'Formare continuă', en: 'Continuing education' },
    body: [
      {
        ro: 'Particip constant la congrese și cursuri de specialitate, în Moldova și peste hotare. Printre cele mai recente:',
        en: 'I regularly take part in congresses and specialty courses, in Moldova and abroad. Among the most recent:',
      },
    ],
    items: {
      ro: [
        'Programe dedicate dificultăților de hrănire la copii (2026)',
        'Congresul de Gastroenterologie, Hepatologie și Nutriție Pediatrică, Sibiu (2025)',
        'Cursuri de urgențe pediatrice ale Organizației Mondiale a Sănătății',
      ],
      en: [
        'Programs on feeding difficulties in children (2026)',
        'Congress of Pediatric Gastroenterology, Hepatology and Nutrition, Sibiu (2025)',
        'WHO pediatric emergency courses',
      ],
    },
  },
  {
    label: { ro: 'Activitate științifică', en: 'Research' },
    body: [
      {
        ro: 'Cercetarea mea s-a concentrat pe afecțiunile digestive la copii, inclusiv bolile inflamatorii intestinale. Am publicat articole despre diareea și constipația la copii și despre rinita alergică la copii.',
        en: 'My research focused on digestive conditions in children, including inflammatory bowel disease. I’ve published articles on diarrhea and constipation in children and on allergic rhinitis in children.',
      },
    ],
  },
  {
    label: { ro: 'Limbi', en: 'Languages' },
    body: [
      {
        ro: 'Consultațiile pot avea loc în română, rusă și engleză.',
        en: 'Consultations can take place in Romanian, Russian, and English.',
      },
    ],
  },
  {
    label: { ro: 'Membru și acreditare', en: 'Membership & accreditation' },
    body: [
      {
        ro: 'Membră a Societății Române de Pediatrie. Categorie de calificare confirmată de Ministerul Sănătății al Republicii Moldova.',
        en: 'Member of the Romanian Society of Pediatrics. Qualification category confirmed by the Ministry of Health of the Republic of Moldova.',
      },
    ],
  },
];

/* Shared class strings (mirror the other landings). */
const btnDark =
  'inline-flex cursor-pointer items-center bg-ink px-[22px] py-[14px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';
const creamPill =
  'inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-soft)]';
const creamUnderline =
  'inline-block cursor-pointer border-b border-[var(--sage-soft)] pb-0.5 text-sm text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage-soft)]';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const lc = (b: Bi) => (en ? b.en : b.ro);

  return (
    <main className="bg-cream text-ink">
      {/* 1 · Hero — name + title + tagline + photo */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell grid items-start gap-12 py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-20 md:py-28">
          <div className="md:sticky md:top-28 md:self-start">
            <p className="mb-7 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
              <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
              {en ? 'About' : 'Despre'}
            </p>
            <h1 className="serif text-[clamp(2.8rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.015em] text-balance">
              Dr. Olesea <span className="serif-it text-sage">Jalba</span>
            </h1>
            <p className="mono mt-5 text-[12px] uppercase tracking-[0.12em] text-ink-soft">
              {en ? 'Pediatrician · MSc in Human Nutrition' : 'Medic pediatru · Master în Nutriție Umană'}
            </p>
            <p className="mt-7 max-w-[42ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
              {en
                ? 'I look at a child’s health as a whole — the medical side and nutrition, together.'
                : 'Privesc sănătatea copilului în ansamblu — partea medicală și alimentația, împreună.'}
            </p>
            <div className="mt-9">
              <Link href="/services" className={btnDark}>
                {en ? 'See the services' : 'Vezi serviciile'}
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[440px] md:max-w-none">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e9e1d0]">
              <Image
                src="/assets/olesea-portrait.webp"
                alt={
                  en
                    ? 'Dr. Olesea Jalba, pediatrician and nutrition specialist'
                    : 'Dr. Olesea Jalba, medic pediatru și specialist în nutriție'
                }
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 48vw"
              />
            </div>
            <div className="mono mt-4 flex justify-between text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              <span>Dr. Olesea Jalba</span>
              <span>{en ? 'Online · Anywhere' : 'Online · Oriunde'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Short story (first person) */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16 lg:gap-24">
          <div>
            <p className="eyebrow mb-4">{en ? 'In short' : 'Pe scurt'}</p>
            <h2 className="serif text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.12] tracking-[-0.02em] text-balance">
              {en ? (
                <>
                  Pediatrician and <span className="serif-it text-sage">nutritionist</span>, in one
                  person
                </>
              ) : (
                <>
                  Pediatru și <span className="serif-it text-sage">nutriționist</span>, într-o
                  persoană
                </>
              )}
            </h2>
          </div>
          <div>
            <p className="max-w-[58ch] text-[1.15rem] leading-[1.75] text-ink-soft text-pretty">
              {en
                ? 'I’m a pediatrician with a master’s in human nutrition and experience that began in pediatric gastroenterology. This combination lets me see a child’s health as a whole — not just today’s symptom, but how they eat and develop over time.'
                : 'Sunt medic pediatru, cu un master în nutriție umană și o experiență care a început în gastroenterologia pediatrică. Această combinație îmi permite să privesc sănătatea copilului în ansamblu — nu doar simptomul de azi, ci și felul în care se hrănește și se dezvoltă în timp.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {[
                { ro: 'Medic pediatru', en: 'Pediatrician' },
                { ro: 'Master în nutriție umană', en: 'MSc Human Nutrition' },
                { ro: 'Gastroenterologie pediatrică', en: 'Pediatric gastroenterology' },
              ].map((f) => (
                <span
                  key={f.en}
                  className="mono rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.1em] text-ink-soft"
                >
                  {lc(f)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 · What it means for you — advantages of the duo (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-28">
          <p className="mb-12 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)] md:mb-16">
            {en ? 'What it means for you' : 'Ce înseamnă asta pentru tine'}
          </p>
          <div className="grid gap-x-12 gap-y-12 md:grid-cols-3">
            {ADVANTAGES.map((a, i) => (
              <Reveal key={a.key} delay={i * 80}>
                <span
                  className="grid size-12 place-items-center rounded-full border border-[rgba(245,241,234,0.25)] text-[var(--sage-soft)]"
                  aria-hidden="true"
                >
                  <AdvIcon k={a.key} />
                </span>
                <h3 className="serif mt-6 text-[1.6rem] leading-snug text-cream">{lc(a.title)}</h3>
                <p className="mt-2 max-w-[34ch] text-[0.95rem] leading-relaxed text-cream/80 text-pretty">
                  {lc(a.text)}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · Focus areas */}
      <section className="shell py-20 md:py-28">
        <header className="max-w-[40rem]">
          <p className="eyebrow mb-3">{en ? 'What I work with' : 'Domenii de focus'}</p>
          <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-balance">
            {en ? (
              <>
                Areas of <span className="serif-it text-sage">focus</span>
              </>
            ) : (
              <>
                Domenii de <span className="serif-it text-sage">focus</span>
              </>
            )}
          </h2>
        </header>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FOCUS.map((it, i) => (
            <Reveal
              key={it.en}
              delay={(i % 3) * 70}
              className="flex flex-col border border-[var(--rule)] bg-paper p-7 transition-colors hover:border-sage"
            >
              <span
                aria-hidden="true"
                className="serif text-[1.9rem] italic leading-none text-sage lining-nums"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-ink text-pretty">{lc(it)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5 · Curriculum — experience, education, CME, research, languages, membership */}
      <section className="bg-paper">
        <div className="shell py-20 md:py-28">
          <header className="mx-auto mb-12 max-w-[820px] text-center md:mb-16">
            <p className="eyebrow mb-3">{en ? 'The record' : 'Parcurs'}</p>
            <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-balance">
              {en ? (
                <>
                  Background & <span className="serif-it text-sage">credentials</span>
                </>
              ) : (
                <>
                  Experiență și <span className="serif-it text-sage">acreditare</span>
                </>
              )}
            </h2>
          </header>

          <div className="mx-auto max-w-[880px] border-t border-[var(--rule)]">
            {CV.map((entry) => (
              <Reveal
                key={entry.label.en}
                className="grid gap-x-12 gap-y-4 border-b border-[var(--rule)] py-8 md:grid-cols-[200px_1fr] md:py-10"
              >
                <h3 className="eyebrow pt-1 text-sage-text">{lc(entry.label)}</h3>
                <div className="max-w-[58ch]">
                  {entry.body?.map((p, i) => (
                    <p
                      key={i}
                      className="text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty [&:not(:first-child)]:mt-3"
                    >
                      {lc(p)}
                    </p>
                  ))}
                  {entry.items && (
                    <ul className={`grid gap-2.5 ${entry.body ? 'mt-4' : ''}`}>
                      {(en ? entry.items.en : entry.items.ro).map((item) => (
                        <li
                          key={item}
                          className="grid grid-cols-[1.1em_1fr] gap-x-2.5 text-[1.0625rem] leading-relaxed text-ink"
                        >
                          <span aria-hidden="true" className="text-sage-text">
                            —
                          </span>
                          <span className="text-pretty">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · Final CTA (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell flex flex-col gap-8 py-20 md:flex-row md:items-end md:justify-between md:py-24">
          <div className="max-w-[34ch]">
            <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
              {en ? (
                <>
                  Book a <span className="serif-it text-[var(--sage-soft)]">consultation</span>
                </>
              ) : (
                <>
                  Programează o <span className="serif-it text-[var(--sage-soft)]">consultație</span>
                </>
              )}
            </h2>
          </div>
          <div>
            <Link href="/services" className={creamPill}>
              {en ? 'See the services' : 'Vezi serviciile'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
