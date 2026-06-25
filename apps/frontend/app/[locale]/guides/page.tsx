import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import {
  GuideLibrary,
  type GuideItem,
  type GuideTopic,
} from '@/components/sections/GuideLibrary';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Ghiduri descărcabile — a content hub of free, downloadable PDF guides. Top of
   funnel: trust + SEO → a soft hand-off into the services. Free model (no email
   gate): each card downloads a PDF directly. Guides are meant to become CMS
   entities managed in the back office; for now the content lives here as local
   bilingual data so the page renders fully, and the library degrades to an
   empty state when there are none. Visual language mirrors the service pages:
   editorial-split hero, hairline rules, mono micro-labels, big serif with
   italic sage accents. Bilingual (RO default · EN).
   ⚠ The PDF files aren't wired yet — `FILE` paths are placeholders.
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
      ? 'Гайды для скачивания о здоровье и питании ребёнка | Dr. Olesea Jalba'
      : en
      ? 'Downloadable guides on child health & nutrition | Dr. Olesea Jalba'
      : 'Ghiduri descărcabile despre sănătatea și nutriția copilului | Dr. Olesea Jalba',
    description: ru
      ? 'Бесплатные гайды от педиатра: прикорм, привередливый аппетит, часто болеющий ребёнок и другие темы.'
      : en
      ? 'Free, practical guides written by a pediatrician: feeding, picky eating, the frequently ill child, and more.'
      : 'Ghiduri practice gratuite scrise de un medic pediatru: alimentație, dificultăți de hrănire, copilul frecvent bolnav și altele.',
  };
}

type Bi = { ro: string; en: string; ru: string };

const TOPICS: { key: string; ro: string; en: string; ru: string }[] = [
  { key: 'nutritie', ro: 'Nutriție', en: 'Nutrition', ru: 'Питание' },
  { key: 'sanatate', ro: 'Sănătate', en: 'Health', ru: 'Здоровье' },
  { key: 'dezvoltare', ro: 'Dezvoltare', en: 'Development', ru: 'Развитие' },
  { key: 'alergii', ro: 'Alergii', en: 'Allergies', ru: 'Аллергии' },
];

interface GuideContent {
  slug: string;
  topic: string;
  title: Bi;
  description: Bi;
  pages: number;
  featured?: boolean;
}

/* ⚠ Proposed topics from the doctor's expertise — NOT finished guides. PDFs are
   pending; swap in real files (back office, later) and these go live. */
const GUIDES: GuideContent[] = [
  {
    slug: 'diversificarea-alimentatiei',
    topic: 'nutritie',
    title: {
      ro: 'Diversificarea alimentației — primii pași',
      en: 'Starting solids — the first steps',
      ru: 'Введение прикорма — первые шаги',
    },
    description: {
      ro: 'Când și cum începi diversificarea, în siguranță și fără stres.',
      en: 'When and how to start solids, safely and without stress.',
      ru: 'Когда и как начинать прикорм — безопасно и без стресса.',
    },
    pages: 16,
    featured: true,
  },
  {
    slug: 'copilul-mofturos',
    topic: 'nutritie',
    title: {
      ro: 'Copilul mofturos: dificultăți de hrănire',
      en: 'The picky eater: feeding difficulties',
      ru: 'Привередливый ребёнок: трудности с кормлением',
    },
    description: {
      ro: 'Strategii practice pentru mesele dificile și refuzul mâncării.',
      en: 'Practical strategies for hard meals and food refusal.',
      ru: 'Практичные стратегии для сложных приёмов пищи и отказа от еды.',
    },
    pages: 12,
  },
  {
    slug: 'copilul-care-se-imbolnaveste-des',
    topic: 'sanatate',
    title: {
      ro: 'Copilul care se îmbolnăvește des',
      en: 'The child who gets sick often',
      ru: 'Часто болеющий ребёнок',
    },
    description: {
      ro: 'Ce e normal, când să te îngrijorezi și cum susții imunitatea.',
      en: "What's normal, when to worry, and how to support immunity.",
      ru: 'Что нормально, когда стоит беспокоиться и как поддержать иммунитет.',
    },
    pages: 14,
  },
  {
    slug: 'constipatia-si-diareea',
    topic: 'sanatate',
    title: {
      ro: 'Constipația și diareea la copii',
      en: 'Constipation and diarrhea in children',
      ru: 'Запор и диарея у детей',
    },
    description: {
      ro: 'Cauze frecvente, semne de alarmă și ce poți face acasă.',
      en: 'Common causes, warning signs, and what you can do at home.',
      ru: 'Частые причины, тревожные признаки и что можно сделать дома.',
    },
    pages: 10,
  },
  {
    slug: 'alergiile-la-copii',
    topic: 'alergii',
    title: {
      ro: 'Alergiile la copii: ce trebuie să știi',
      en: 'Allergies in children: what to know',
      ru: 'Аллергии у детей: что нужно знать',
    },
    description: {
      ro: 'Recunoașterea alergiilor alimentare și pașii corecți.',
      en: 'Recognizing food allergies and the right steps to take.',
      ru: 'Как распознать пищевую аллергию и какие шаги предпринять.',
    },
    pages: 18,
  },
  {
    slug: 'dezvoltarea-copilului-pe-etape',
    topic: 'dezvoltare',
    title: {
      ro: 'Dezvoltarea copilului pe etape',
      en: 'Child development, stage by stage',
      ru: 'Развитие ребёнка по этапам',
    },
    description: {
      ro: 'Reperele de dezvoltare de la naștere la vârsta preșcolară.',
      en: 'Developmental milestones from birth to preschool age.',
      ru: 'Этапы развития от рождения до дошкольного возраста.',
    },
    pages: 20,
  },
];

const btnDark =
  'inline-flex cursor-pointer items-center bg-ink px-[22px] py-[14px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';
const underlineLg =
  'inline-block cursor-pointer border-b border-ink pb-1 text-sm text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';
const creamPill =
  'inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-soft)]';
const creamUnderline =
  'inline-block cursor-pointer border-b border-[var(--sage-soft)] pb-0.5 text-sm text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage-soft)]';

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  const topicLabel = (key: string) => {
    const t = TOPICS.find((x) => x.key === key);
    return t ? lc(t) : key;
  };
  const meta = (pages: number) => `PDF · ${pages} ${ru ? 'стр.' : en ? 'pages' : 'pagini'} · RO`;
  // ⚠ Placeholder file path — no real PDF exists yet. Swap for the real file
  // (back office, later); set to '' to show the "coming soon" state instead.
  const fileHref = (slug: string) => `/files/guides/${slug}-${locale}.pdf`;

  const items: GuideItem[] = GUIDES.map((g) => ({
    slug: g.slug,
    topicKey: g.topic,
    topicLabel: topicLabel(g.topic),
    title: lc(g.title),
    description: lc(g.description),
    meta: meta(g.pages),
    fileHref: fileHref(g.slug),
  }));

  const topics: GuideTopic[] = TOPICS.map((t) => ({ key: t.key, label: lc(t) }));
  const featured = GUIDES.find((g) => g.featured) ?? GUIDES[0];

  const HOW = [
    {
      title: { ro: 'Alege un ghid', en: 'Pick a guide', ru: 'Выберите гайд' },
      text: { ro: 'Răsfoiește biblioteca și alege tema potrivită.', en: 'Browse the library and choose the topic you need.', ru: 'Полистайте библиотеку и выберите нужную тему.' },
    },
    {
      title: { ro: 'Apasă „Descarcă"', en: 'Tap “Download”', ru: 'Нажмите «Скачать»' },
      text: { ro: 'Fără cont și fără cost — primești fișierul PDF.', en: 'No account, no cost — you get the PDF file.', ru: 'Без аккаунта и бесплатно — сразу получаете PDF-файл.' },
    },
    {
      title: { ro: 'Citește în ritmul tău', en: 'Read at your pace', ru: 'Читайте в своём ритме' },
      text: { ro: 'Salvează-l și revino oricând ai nevoie.', en: 'Save it and come back whenever you need it.', ru: 'Сохраните его и возвращайтесь, когда понадобится.' },
    },
  ];

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Гайды' : en ? 'Guides' : 'Ghiduri' },
        ]}
      />
      {/* 1 · Hero — editorial split: statement left, featured guide right */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Гайды' : en ? 'Guides' : 'Ghiduri'}
          </p>
          <div className="grid items-end gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.03] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    Гайды <span className="serif-it text-sage">для скачивания</span>
                  </>
                ) : en ? (
                  <>
                    Downloadable <span className="serif-it text-sage">guides</span>
                  </>
                ) : (
                  <>
                    Ghiduri <span className="serif-it text-sage">descărcabile</span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[44ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {ru
                  ? 'Практичные материалы о здоровье и питании ребёнка, написанные педиатром. Скачивайте бесплатно.'
                  : en
                  ? 'Practical guides on your child’s health and nutrition, written by a pediatrician. Download them free.'
                  : 'Materiale practice despre sănătatea și alimentația copilului, scrise de un medic pediatru. Descarcă-le gratuit.'}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a href="#library" className={btnDark}>
                  {ru ? 'Смотреть гайды' : en ? 'Browse the guides' : 'Vezi ghidurile'}
                </a>
                <span className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-sage-text">
                  {ru ? 'Бесплатно · Без аккаунта' : en ? 'Free · No account' : 'Gratuit · Fără cont'}
                </span>
              </div>
            </div>

            {/* Featured guide */}
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="eyebrow mb-5">{ru ? 'Рекомендуем' : en ? 'Featured' : 'Recomandat'}</p>
              <article className="flex flex-col border border-[var(--rule)] bg-paper">
                <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-cream-2 text-sage">
                  <span className="mono absolute left-4 top-4 rounded-full border border-[var(--rule)] bg-paper/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-sage-text">
                    {topicLabel(featured.topic)}
                  </span>
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden="true">
                    <path d="M6 3.5h7L18 8v12.5H6V3.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M13 3.5V8h5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M12 11v5m0 0 2-2m-2 2-2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="p-6">
                  <h2 className="serif text-[1.5rem] leading-snug tracking-[-0.01em] text-pretty">
                    {lc(featured.title)}
                  </h2>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
                    {lc(featured.description)}
                  </p>
                  <p className="mono mt-4 text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                    {meta(featured.pages)}
                  </p>
                  <a
                    href={fileHref(featured.slug)}
                    download
                    className="mt-6 inline-flex cursor-pointer items-center gap-2 border-b border-ink pb-1 text-[13px] font-medium uppercase tracking-[0.04em] text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
                  >
                    {ru ? 'Скачать гайд' : en ? 'Download guide' : 'Descarcă ghidul'}
                    <span aria-hidden="true">↓</span>
                  </a>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Library — topic filter + grid (or empty state) */}
      <section id="library" className="scroll-mt-24 shell py-20 md:py-28">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Библиотека' : en ? 'Library' : 'Bibliotecă'}</p>
            <h2 className="serif text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.0] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Выберите <span className="serif-it text-sage">гайд</span>
                </>
              ) : en ? (
                <>
                  Choose a <span className="serif-it text-sage">guide</span>
                </>
              ) : (
                <>
                  Alege un <span className="serif-it text-sage">ghid</span>
                </>
              )}
            </h2>
          </div>
          <p className="max-w-[340px] text-sm leading-[1.7] text-ink-soft">
            {ru
              ? 'Фильтруйте по теме. Все гайды бесплатны и написаны Dr. Olesea Jalba.'
              : en
              ? 'Filter by topic. Every guide is free and written by Dr. Olesea Jalba.'
              : 'Filtrează după temă. Toate ghidurile sunt gratuite, scrise de Dr. Olesea Jalba.'}
          </p>
        </header>

        <GuideLibrary
          guides={items}
          topics={topics}
          labels={{
            all: ru ? 'Все' : en ? 'All' : 'Toate',
            download: ru ? 'Скачать гайд' : en ? 'Download guide' : 'Descarcă ghidul',
            soon: ru ? 'Скоро' : en ? 'Coming soon' : 'În curând',
            emptyTitle: ru ? 'Гайды появятся скоро' : en ? 'Guides are coming soon' : 'Ghidurile vin în curând',
            emptyBody: ru
              ? 'Мы работаем над первыми гайдами. А пока задайте вопрос врачу напрямую.'
              : en
              ? 'We’re working on the first guides. In the meantime, you can ask the doctor your question directly.'
              : 'Lucrăm la primele ghiduri. Între timp, dacă ai o întrebare, o poți adresa direct medicului.',
            emptyCta: ru ? 'Спросить врача' : en ? 'Ask the doctor' : 'Întreabă medicul',
            emptyCtaHref: `/${locale}/quick-question`,
          }}
        />
      </section>

      {/* 3 · How it works (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
            {ru ? 'Как это работает' : en ? 'How it works' : 'Cum funcționează'}
          </p>
          <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
            {ru ? (
              <>
                Бесплатно, в пару <span className="serif-it text-[var(--sage-soft)]">кликов</span>
              </>
            ) : en ? (
              <>
                Free, in a few <span className="serif-it text-[var(--sage-soft)]">taps</span>
              </>
            ) : (
              <>
                Gratuit, în câțiva <span className="serif-it text-[var(--sage-soft)]">pași</span>
              </>
            )}
          </h2>

          <div className="relative mt-14 grid gap-x-8 gap-y-12 md:mt-16 md:grid-cols-3">
            <span
              className="pointer-events-none absolute inset-x-0 top-8 hidden h-px bg-[rgba(245,241,234,0.2)] md:block"
              aria-hidden="true"
            />
            {HOW.map((step, i) => (
              <div key={step.title.en} className="relative">
                <span
                  aria-hidden="true"
                  className="relative z-10 mb-7 grid size-16 place-items-center rounded-full border-[5px] border-[var(--sage-deep)] bg-sage text-cream"
                >
                  <span className="serif block translate-y-[0.05em] text-[1.6rem] italic leading-none lining-nums tabular-nums">
                    {i + 1}
                  </span>
                </span>
                <h3 className="serif text-[1.5rem] leading-snug text-cream">{lc(step.title)}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/80 text-pretty">
                  {lc(step.text)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · Author + disclaimer */}
      <section className="shell grid gap-12 border-b border-[var(--rule)] py-20 md:grid-cols-2 md:gap-20 md:py-24">
        <div>
          <p className="eyebrow mb-3">{ru ? 'Кто их пишет' : en ? 'Who writes them' : 'Cine scrie ghidurile'}</p>
          <h2 className="serif text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.05] tracking-[-0.02em] text-balance">
            {ru ? (
              <>
                Написаны <span className="serif-it text-sage">педиатром</span>
              </>
            ) : en ? (
              <>
                Written by a <span className="serif-it text-sage">pediatrician</span>
              </>
            ) : (
              <>
                Scrise de un medic <span className="serif-it text-sage">pediatru</span>
              </>
            )}
          </h2>
          <p className="mt-5 max-w-[48ch] leading-relaxed text-ink-soft text-pretty">
            {ru
              ? 'Гайды пишет Dr. Olesea Jalba — педиатр со степенью магистра нутрициологии.'
              : en
              ? 'The guides are written by Dr. Olesea Jalba, a pediatrician with a Master’s in Human Nutrition.'
              : 'Ghidurile sunt realizate de Dr. Olesea Jalba, medic pediatru cu master în nutriție umană.'}
          </p>
          <Link href="/about" className={`mt-7 ${underlineLg}`}>
            {ru ? 'О враче' : en ? 'About the doctor' : 'Despre medic'} →
          </Link>
        </div>

        <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
          <p className="eyebrow mb-3">{ru ? 'Важно знать' : en ? 'Good to know' : 'De reținut'}</p>
          <p className="max-w-[52ch] leading-relaxed text-ink-soft text-pretty">
            {ru
              ? 'Гайды дают общую информацию и не заменяют медицинскую консультацию. Если нужно разобраться в ситуации вашего ребёнка — запишитесь на приём.'
              : en
              ? 'The guides are for information only and don’t replace a medical consultation. For your child’s specific situation, book a consultation.'
              : 'Ghidurile au scop informativ și nu înlocuiesc o consultație medicală. Pentru situația specifică a copilului tău, programează o consultație.'}
          </p>
        </div>
      </section>

      {/* 5 · Conversion CTA (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Нужен личный <span className="serif-it text-[var(--sage-soft)]">совет?</span>
                  </>
                ) : en ? (
                  <>
                    Need personal <span className="serif-it text-[var(--sage-soft)]">advice?</span>
                  </>
                ) : (
                  <>
                    Ai nevoie de un sfat <span className="serif-it text-[var(--sage-soft)]">personalizat?</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/quick-question" className={creamPill}>
                  {ru ? 'Спросить врача · ~1ч' : en ? 'Ask the doctor · ~1h' : 'Întreabă medicul · ~1h'}
                </Link>
                <Link href="/services" className={creamUnderline}>
                  {ru ? 'Смотреть консультации →' : en ? 'See the consultations →' : 'Vezi consultațiile →'}
                </Link>
              </div>
            </div>

            <p className="max-w-[30ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {ru
                ? 'Гайд — это отправная точка. А с ситуацией вашего ребёнка поможет разобраться консультация.'
                : en
                ? 'A guide is a starting point. For your child’s situation, a consultation goes further.'
                : 'Un ghid e un punct de plecare. Pentru situația copilului tău, o consultație merge mai departe.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
