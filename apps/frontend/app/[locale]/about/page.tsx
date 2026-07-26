import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';
import { Certificates } from '@/components/sections/Certificates';
import { btnDark, creamPill } from '@/components/ui/cta';

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
  const ru = locale === 'ru';
  return {
    title: ru
      ? 'Обо мне — Dr. Olesea Jalba, врач-педиатр и нутрициолог'
      : en
        ? 'About Dr. Olesea Jalba — pediatrician and nutrition specialist'
        : 'Despre Dr. Olesea Jalba — medic pediatru și nutriționist',
    description: ru
      ? 'Врач-педиатр с магистратурой по питанию человека и опытом в детской гастроэнтерологии. Консультирую на румынском, русском и английском.'
      : en
        ? 'Pediatrician with a master’s in human nutrition and experience in pediatric gastroenterology. Consultations in Romanian, Russian, and English.'
        : 'Medic pediatru cu master în nutriție umană și experiență în gastroenterologie pediatrică. Consultații în română, rusă și engleză.',
  };
}

type Bi = { ro: string; en: string; ru: string };
type BiList = { ro: string[]; en: string[]; ru: string[] };

const FOCUS: Bi[] = [
  { ro: 'Probleme digestive la copii — un domeniu cu care lucrez încă de la începutul carierei.', en: 'Digestive issues in children — an area I’ve worked in since the start of my career.', ru: 'Проблемы пищеварения у детей — направление, с которым я работаю с самого начала карьеры.' },
  { ro: 'Nutriția și dificultățile de hrănire — inclusiv refuzul mâncării și diversificarea.', en: 'Nutrition and feeding difficulties — including food refusal and starting solids.', ru: 'Питание и трудности с кормлением — отказ от еды, введение прикорма.' },
  { ro: 'Copilul care se îmbolnăvește des.', en: 'The often-ill child.', ru: 'Часто болеющий ребёнок.' },
  { ro: 'Alergologie pediatrică.', en: 'Pediatric allergology.', ru: 'Детская аллергология.' },
  { ro: 'Creșterea și dezvoltarea copilului.', en: 'Child growth and development.', ru: 'Рост и развитие ребёнка.' },
];

const ADVANTAGES: { key: 'whole' | 'one' | 'evidence'; title: Bi; text: Bi }[] = [
  {
    key: 'whole',
    title: { ro: 'O privire de ansamblu', en: 'A whole-picture view', ru: 'Взгляд на всю картину' },
    text: {
      ro: 'Sănătatea și alimentația, evaluate împreună — nu pe bucăți.',
      en: 'Health and nutrition, assessed together — not in pieces.',
      ru: 'Оцениваю здоровье и питание вместе, а не по частям.',
    },
  },
  {
    key: 'one',
    title: { ro: 'Un singur specialist', en: 'One specialist', ru: 'Один специалист' },
    text: {
      ro: 'Nu mai mergi de la un medic la altul pentru sănătate și nutriție.',
      en: 'No going from one doctor to another for health and nutrition.',
      ru: 'Не нужно ходить от врача к врачу ради здоровья и питания.',
    },
  },
  {
    key: 'evidence',
    title: { ro: 'Plan pe bază de dovezi', en: 'An evidence-based plan', ru: 'Доказательный подход' },
    text: {
      ro: 'Recomandări fundamentate pe pregătire pediatrică și nutrițională.',
      en: 'Recommendations grounded in pediatric and nutrition training.',
      ru: 'Рекомендации опираются на педиатрическую и нутрициологическую подготовку.',
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
    label: { ro: 'Experiență', en: 'Experience', ru: 'Опыт' },
    body: [
      {
        ro: 'Lucrez ca medic pediatru la Spitalul Clinic Municipal de Copii „Valentin Ignatenco” și la clinica Harper Medklinic din Chișinău.',
        en: 'I work as a pediatrician at the “Valentin Ignatenco” Municipal Children’s Clinical Hospital and at the Harper Medklinic clinic in Chișinău.',
        ru: 'Работаю врачом-педиатром в Муниципальной клинической детской больнице имени Валентина Игнатенко и в клинике Harper Medklinic в Кишинёве.',
      },
      {
        ro: 'Înainte de a deveni medic, am lucrat opt ani ca asistentă medicală în secția de gastroenterologie a Institutului Mamei și Copilului — de aici vine și interesul meu pentru sănătatea digestivă a copiilor.',
        en: 'Before becoming a doctor, I worked for eight years as a nurse in the gastroenterology department of the Mother and Child Institute — that’s where my interest in children’s digestive health comes from.',
        ru: 'До того как стать врачом, я восемь лет работала медсестрой в отделении гастроэнтерологии Института матери и ребёнка — отсюда и мой интерес к детскому пищеварению.',
      },
    ],
  },
  {
    label: { ro: 'Studii', en: 'Education', ru: 'Образование' },
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
      ru: [
        'Магистратура по общественному здоровью – питание человека, USMF «Nicolae Testemițanu» (2025)',
        'Ординатура по педиатрии, USMF «Nicolae Testemițanu» (2018)',
        'Диплом по общей медицине, USMF «Nicolae Testemițanu» (2014)',
      ],
    },
  },
  {
    label: { ro: 'Formare continuă', en: 'Continuing education', ru: 'Непрерывное образование' },
    body: [
      {
        ro: 'Particip constant la congrese și cursuri de specialitate, în Moldova și peste hotare. Printre cele mai recente:',
        en: 'I regularly take part in congresses and specialty courses, in Moldova and abroad. Among the most recent:',
        ru: 'Постоянно участвую в конгрессах и профильных курсах — в Молдове и за рубежом. Из недавнего:',
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
      ru: [
        'Программы по трудностям с кормлением у детей (2026)',
        'Конгресс по детской гастроэнтерологии, гепатологии и питанию, Сибиу (2025)',
        'Курсы ВОЗ по неотложной педиатрической помощи',
      ],
    },
  },
  {
    label: { ro: 'Activitate științifică', en: 'Research', ru: 'Научная деятельность' },
    body: [
      {
        ro: 'Cercetarea mea s-a concentrat pe afecțiunile digestive la copii, inclusiv bolile inflamatorii intestinale. Am publicat articole despre diareea și constipația la copii și despre rinita alergică la copii.',
        en: 'My research focused on digestive conditions in children, including inflammatory bowel disease. I’ve published articles on diarrhea and constipation in children and on allergic rhinitis in children.',
        ru: 'Я исследовала заболевания пищеварения у детей, в том числе воспалительные заболевания кишечника. Опубликовала статьи о диарее и запорах, а также об аллергическом рините у детей.',
      },
    ],
  },
  {
    label: { ro: 'Limbi', en: 'Languages', ru: 'Языки' },
    body: [
      {
        ro: 'Consultațiile pot avea loc în română, rusă și engleză.',
        en: 'Consultations can take place in Romanian, Russian, and English.',
        ru: 'Консультирую на румынском, русском и английском.',
      },
    ],
  },
  {
    label: { ro: 'Membru și acreditare', en: 'Membership & accreditation', ru: 'Членство и аккредитация' },
    body: [
      {
        ro: 'Membră a Societății Române de Pediatrie. Categorie de calificare confirmată de Ministerul Sănătății al Republicii Moldova.',
        en: 'Member of the Romanian Society of Pediatrics. Qualification category confirmed by the Ministry of Health of the Republic of Moldova.',
        ru: 'Член Румынского общества педиатрии. Квалификационная категория подтверждена Министерством здравоохранения Республики Молдова.',
      },
    ],
  },
];

/* Q17 content (brief §7) — exact client text (RO), with EN/RU translations. */
const WHY_INTRO: Bi = {
  ro: 'Nu doar diplome și experiență.',
  en: 'Not just diplomas and experience.',
  ru: 'Не только дипломы и опыт.',
};
const WHY: Bi[] = [
  {
    ro: 'Peste 18 ani dedicați domeniului medical — de la activitatea clinică și formarea continuă, până la practica de pediatru și specialist în nutriție umană.',
    en: 'Over 18 years devoted to medicine — from clinical work and continuing education to practising as a pediatrician and human-nutrition specialist.',
    ru: 'Более 18 лет в медицине — от клинической работы и непрерывного обучения до практики педиатра и специалиста по питанию человека.',
  },
  {
    ro: 'Master în Nutriție Umană.',
    en: 'A Master’s in Human Nutrition.',
    ru: 'Магистратура по питанию человека.',
  },
  {
    ro: 'Abordare integrată Pediatrie + Nutriție.',
    en: 'An integrated Pediatrics + Nutrition approach.',
    ru: 'Интегрированный подход: педиатрия + нутрициология.',
  },
  {
    ro: 'Recomandări bazate pe dovezi științifice actuale.',
    en: 'Recommendations grounded in current scientific evidence.',
    ru: 'Рекомендации на основе актуальных научных данных.',
  },
  {
    ro: 'Planuri individualizate, nu recomandări standard.',
    en: 'Individualized plans, not standard advice.',
    ru: 'Индивидуальные планы, а не шаблонные рекомендации.',
  },
  {
    ro: 'Accent pe prevenție și educația familiei.',
    en: 'A focus on prevention and family education.',
    ru: 'Акцент на профилактике и обучении семьи.',
  },
  {
    ro: 'Monitorizare și suport pe termen lung.',
    en: 'Long-term monitoring and support.',
    ru: 'Долгосрочное наблюдение и поддержка.',
  },
];
const VALUES: Bi = {
  ro: 'Valorile care îmi ghidează activitatea sunt profesionalismul, empatia, individualizarea recomandărilor, comunicarea deschisă și educația medicală bazată pe dovezi științifice.',
  en: 'The values that guide my work are professionalism, empathy, individualized recommendations, open communication, and evidence-based medical education.',
  ru: 'Ценности, которыми я руководствуюсь, — профессионализм, эмпатия, индивидуальный подход, открытое общение и доказательная медицина.',
};
const QUOTE_PHILOSOPHY: Bi = {
  ro: 'Cred într-o abordare integrată a sănătății copilului, în care pediatria, nutriția și colaborarea cu familia se completează reciproc pentru a susține creșterea, dezvoltarea și starea de bine pe termen lung. Fiecare copil este unic, iar recomandările medicale și nutriționale trebuie adaptate nevoilor și particularităților sale individuale.',
  en: 'I believe in an integrated approach to a child’s health, where pediatrics, nutrition, and working with the family complement one another to support growth, development, and long-term well-being. Every child is unique, and medical and nutritional advice must be adapted to their individual needs.',
  ru: 'Я верю в интегрированный подход к здоровью ребёнка, где педиатрия, нутрициология и работа с семьёй дополняют друг друга, поддерживая рост, развитие и благополучие в долгосрочной перспективе. Каждый ребёнок уникален, и рекомендации должны учитывать его индивидуальные особенности.',
};
const QUOTE_MISSION: Bi = {
  ro: 'Misiunea mea este să ofer familiilor recomandări medicale și nutriționale individualizate, bazate pe dovezi științifice actuale, într-un limbaj clar, practic și ușor de aplicat în viața de zi cu zi.',
  en: 'My mission is to give families individualized medical and nutritional advice, grounded in current scientific evidence, in clear, practical language that’s easy to apply in everyday life.',
  ru: 'Моя миссия — давать семьям индивидуальные медицинские и нутрициологические рекомендации на основе актуальных научных данных, понятным и практичным языком, который легко применять каждый день.',
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  return (
    <main className="bg-cream text-ink">
      {/* 1 · Hero — name + title + tagline + photo */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell grid items-start gap-12 py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-20 md:py-28">
          <div className="md:sticky md:top-[133px] md:self-start">
            <p className="mb-7 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
              <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
              {ru ? 'Обо мне' : en ? 'About' : 'Despre'}
            </p>
            <h1 className="serif text-[clamp(2.8rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.015em] text-balance">
              Dr. Olesea <span className="serif-it text-sage">Jalba</span>
            </h1>
            <p className="mono mt-5 text-[12px] uppercase tracking-[0.12em] text-ink-soft">
              {ru ? 'Врач-педиатр · Магистр питания человека' : en ? 'Pediatrician · MSc in Human Nutrition' : 'Medic pediatru · Master în Nutriție Umană'}
            </p>
            <p className="mt-7 max-w-[42ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
              {ru
                ? 'Я смотрю на здоровье ребёнка в целом — медицинскую часть и питание вместе.'
                : en
                  ? 'I look at a child’s health as a whole — the medical side and nutrition, together.'
                  : 'Privesc sănătatea copilului în ansamblu — partea medicală și alimentația, împreună.'}
            </p>
            <div className="mt-9">
              <Link href="/services" className={btnDark}>
                {ru ? 'Посмотреть услуги' : en ? 'See the services' : 'Vezi serviciile'}
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[440px] md:max-w-none">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e9e1d0]">
              <Image
                src="/assets/olesea-about.webp"
                alt={
                  ru
                    ? 'Dr. Olesea Jalba, врач-педиатр и специалист по питанию'
                    : en
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
              <span>{ru ? 'Онлайн · Где угодно' : en ? 'Online · Anywhere' : 'Online · Oriunde'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Short story (first person) */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16 lg:gap-24">
          <div>
            <p className="eyebrow mb-4">{ru ? 'Кратко' : en ? 'In short' : 'Pe scurt'}</p>
            <h2 className="serif text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.12] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Педиатр и <span className="serif-it text-sage">нутрициолог</span>, в одном
                  человеке
                </>
              ) : en ? (
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
              {ru
                ? 'Я врач-педиатр с магистратурой по питанию человека; мой опыт начинался в детской гастроэнтерологии. Это сочетание помогает мне видеть здоровье ребёнка целиком — не только сегодняшний симптом, но и то, как он растёт и питается изо дня в день.'
                : en
                  ? 'I’m a pediatrician with a master’s in human nutrition and experience that began in pediatric gastroenterology. This combination lets me see a child’s health as a whole — not just today’s symptom, but how they eat and develop over time.'
                  : 'Sunt medic pediatru, cu un master în nutriție umană și o experiență care a început în gastroenterologia pediatrică. Această combinație îmi permite să privesc sănătatea copilului în ansamblu — nu doar simptomul de azi, ci și felul în care se hrănește și se dezvoltă în timp.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {[
                { ro: 'Medic pediatru', en: 'Pediatrician', ru: 'Врач-педиатр' },
                { ro: 'Master în nutriție umană', en: 'MSc Human Nutrition', ru: 'Магистр питания человека' },
                { ro: 'Gastroenterologie pediatrică', en: 'Pediatric gastroenterology', ru: 'Детская гастроэнтерология' },
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

      {/* 2.5 · Philosophy — integrated-approach pull-quote (brief §7.7) */}
      <section className="border-y border-[var(--rule)] bg-paper">
        <div className="shell py-20 md:py-28">
          <figure className="mx-auto max-w-[60ch] text-center">
            <p className="eyebrow mb-8">{ru ? 'Подход' : en ? 'Approach' : 'Abordare'}</p>
            <blockquote className="serif-it text-[clamp(1.5rem,3.2vw,2.4rem)] leading-[1.3] tracking-[-0.01em] text-ink text-balance">
              „{lc(QUOTE_PHILOSOPHY)}”
            </blockquote>
          </figure>
        </div>
      </section>

      {/* 3 · What it means for you — advantages of the duo (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-28">
          <p className="mb-12 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)] md:mb-16">
            {ru ? 'Что это значит для вас' : en ? 'What it means for you' : 'Ce înseamnă asta pentru tine'}
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

      {/* 3.5 · De ce să lucrezi cu mine (brief §7.1) */}
      <section className="shell py-20 md:py-28">
        <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Почему я' : en ? 'Why me' : 'De ce eu'}</p>
            <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Почему стоит <span className="serif-it text-sage">работать со мной</span>
                </>
              ) : en ? (
                <>
                  Why work <span className="serif-it text-sage">with me</span>
                </>
              ) : (
                <>
                  De ce să lucrezi <span className="serif-it text-sage">cu mine</span>
                </>
              )}
            </h2>
          </div>
          <p className="max-w-[320px] text-sm leading-[1.7] text-ink-soft">{lc(WHY_INTRO)}</p>
        </div>
        <ul className="mt-10 grid gap-x-12 border-t border-[var(--rule)] pt-8 sm:grid-cols-2">
          {WHY.map((r, i) => (
            <Reveal
              as="li"
              key={r.en}
              delay={(i % 2) * 70}
              className="grid grid-cols-[auto_1fr] gap-x-4 border-b border-[var(--rule)] py-5"
            >
              <span className="serif text-[1.1rem] italic leading-none text-sage-text lining-nums tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[1.05rem] leading-relaxed text-ink text-pretty">{lc(r)}</span>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* 4 · Focus areas */}
      <section className="shell py-20 md:py-28">
        <header className="max-w-[40rem]">
          <p className="eyebrow mb-3">{ru ? 'С чем я работаю' : en ? 'What I work with' : 'Domenii de focus'}</p>
          <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-balance">
            {ru ? (
              <>
                Направления <span className="serif-it text-sage">работы</span>
              </>
            ) : en ? (
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
            <p className="eyebrow mb-3">{ru ? 'Путь' : en ? 'The record' : 'Parcurs'}</p>
            <h2 className="serif text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Опыт и <span className="serif-it text-sage">аккредитация</span>
                </>
              ) : en ? (
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
                      {(ru ? entry.items.ru : en ? entry.items.en : entry.items.ro).map((item) => (
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

      {/* 5.4 · Certificates — visual proof for the "Formare continuă" record */}
      <Certificates locale={locale} />

      {/* 5.45 · Media teaser — the full list lives on /media (brief §7.4) */}
      <section className="border-t border-[var(--rule)]">
        <div className="shell flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
          <div>
            <p className="eyebrow mb-3">{ru ? 'СМИ' : en ? 'In the media' : 'Apariții media'}</p>
            <p className="serif max-w-[34ch] text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.15] tracking-[-0.01em] text-balance">
              {ru
                ? 'Гостья программ Moldova 1, TVR Moldova и Canal 2'
                : en
                  ? 'A guest on Moldova 1, TVR Moldova and Canal 2'
                  : 'Invitată la Moldova 1, TVR Moldova și Canal 2'}
            </p>
          </div>
          <Link
            href="/media"
            className="inline-flex shrink-0 items-center gap-2 border-b border-ink pb-0.5 text-[0.95rem] text-ink transition-colors hover:border-sage hover:text-sage"
          >
            {ru ? 'Смотреть выпуски' : en ? 'See the appearances' : 'Vezi aparițiile'}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* 5.5 · Valori profesionale + mission (brief §7.3 / §7.7) */}
      <section className="shell border-t border-[var(--rule)] py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16 lg:gap-24">
          <div>
            <p className="eyebrow mb-4">{ru ? 'Ценности' : en ? 'Values' : 'Valori'}</p>
            <h2 className="serif text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.12] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Что мной <span className="serif-it text-sage">движет</span>
                </>
              ) : en ? (
                <>
                  What <span className="serif-it text-sage">guides me</span>
                </>
              ) : (
                <>
                  Ce mă <span className="serif-it text-sage">ghidează</span>
                </>
              )}
            </h2>
          </div>
          <div>
            <p className="max-w-[58ch] text-[1.15rem] leading-[1.75] text-ink-soft text-pretty">
              {lc(VALUES)}
            </p>
            <blockquote className="serif-it mt-10 border-t border-[var(--rule)] pt-8 text-[clamp(1.3rem,2.4vw,1.8rem)] leading-[1.4] text-ink text-pretty">
              „{lc(QUOTE_MISSION)}”
            </blockquote>
          </div>
        </div>
      </section>

      {/* 6 · Final CTA (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell flex flex-col gap-8 py-20 md:flex-row md:items-end md:justify-between md:py-24">
          <div className="max-w-[34ch]">
            <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
              {ru ? (
                <>
                  Записаться на <span className="serif-it text-[var(--sage-soft)]">консультацию</span>
                </>
              ) : en ? (
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
              {ru ? 'Посмотреть услуги' : en ? 'See the services' : 'Vezi serviciile'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
