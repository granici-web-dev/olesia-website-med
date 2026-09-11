import Image from 'next/image';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { pageMetadata } from '@/lib/page-metadata';
import { Link } from '@/i18n/navigation';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { FreeConsult } from '@/components/sections/FreeConsult';
import { Reveal } from '@/components/ui/Reveal';
import { calendlyUrlFor } from '@/lib/calendly';
import { btnDark, underlineLg, underline } from '@/components/ui/cta';
import { siteMediaAsset } from '@/lib/site-media';
import { api } from '@/lib/api';
import { formatServiceDuration } from '@/lib/service-price';
import { SERVICE_INCLUDED, fillIncluded } from '@/lib/service-content';
import { formatSla, formatSlaInHours } from '@/lib/working-hours';
import { biFor, type Bi } from '@/lib/i18n-types';

/** Service code → its dedicated landing page. Rows link here ("Detalii"). */
const DETAIL_ROUTE: Record<string, string> = {
  pediatric: '/pediatrics',
  nutrition: '/nutrition',
  integrative: '/integrative',
  monitoring: '/monitoring',
  quick_question: '/quick-question',
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  return pageMetadata({
    locale,
    path: '/services',
    title: ru
      ? 'Услуги — онлайн-консультации | Dr. Olesea Jalba'
      : en
        ? 'Services — online consultations | Dr. Olesea Jalba'
        : 'Servicii — consultații online | Dr. Olesea Jalba',
    description: ru
      ? 'Пять услуг в двух форматах: видеоконсультации педиатра и нутрициолога, наблюдение и экспресс-вопрос врачу.'
      : en
        ? 'Five services in two formats: pediatric and nutrition video consultations, ongoing monitoring, and a written express question.'
        : 'Cinci servicii în două formate: consultații video de pediatrie și nutriție, monitorizare și întrebare EXPRESS.',
  });
}

/* ──────────────────────────────────────────────────────────────────────────
   Content lives here, bilingual (RO default · EN), so the page renders fully
   even when the API is unreachable. The live API supplies only the per-service
   Calendly scheduling URLs (group A); group-B services open the lead modal.
   Visual language mirrors the homepage sections (Hero / Services / HowItWorks /
   About): big serif with italic sage accents, oversized italic serif numbers,
   mono micro-labels, hairline rules, square dark/outline buttons, olive band.
   ────────────────────────────────────────────────────────────────────────── */

interface ServiceContent {
  /**
   * Service `code`, which doubles as this row's anchor (`/services#nutrition`).
   * Mostly matches the API and the group-B LeadService values — except
   * `nutrition`, which is one summary row covering both catalog services
   * (`nutrition_copii` / `nutrition_adulti`) and links to the single
   * /nutrition page where both booking options live.
   */
  code: string;
  group: 'A_booking' | 'B_portal';
  num: string;
  tag: Bi;
  title: Bi;
  duration: Bi;
  value: Bi;
  bestFor: Bi;
  cta: Bi;
  /** Optional callout: a strength to highlight, or an emergency disclaimer. */
  note?: { kind: 'highlight' | 'warning' } & Bi;
}

const SERVICES_A: ServiceContent[] = [
  {
    code: 'pediatric',
    group: 'A_booking',
    num: '01',
    tag: { ro: 'Pediatrie', en: 'Pediatrics', ru: 'Педиатрия' },
    title: {
      ro: 'Consultație pediatrică',
      en: 'Pediatric consultation',
      ru: 'Педиатрическая консультация',
    },
    duration: {
      ro: '{duration} · video',
      en: '{duration} · video',
      ru: '{duration} · видео',
    },
    value: {
      ro: 'O consultație video dedicată sănătății copilului — simptome, creștere, dezvoltare sau o a doua opinie.',
      en: "A focused video visit for your child's health — symptoms, growth, development, or a second opinion.",
      ru: 'Видеоконсультация о здоровье ребёнка — симптомы, рост, развитие или второе мнение.',
    },
    bestFor: {
      ro: 'Pentru părinții care vor un sfat pediatric de specialitate, fără drum la clinică.',
      en: 'For parents who want expert pediatric guidance without a clinic visit.',
      ru: 'Для родителей, которым нужен совет педиатра без поездки в клинику.',
    },
    cta: { ro: 'Programează', en: 'Book a time', ru: 'Записаться' },
  },
  {
    code: 'nutrition',
    group: 'A_booking',
    num: '02',
    tag: { ro: 'Nutriție', en: 'Nutrition', ru: 'Питание' },
    title: {
      ro: 'Consultație nutrițională',
      en: 'Nutrition consultation',
      ru: 'Консультация по питанию',
    },
    duration: {
      ro: '{duration} · video',
      en: '{duration} · video',
      ru: '{duration} · видео',
    },
    value: {
      ro: 'O analiză personalizată a alimentației, pe bază de dovezi — pentru copii sau adulți.',
      en: 'A personalized, evidence-based look at feeding and nutrition — for children or adults.',
      ru: 'Персональный анализ питания на основе доказательной медицины — для детей и взрослых.',
    },
    bestFor: {
      ro: 'Pentru dificultăți de alimentație, diversificare, greutate sau obiceiuri sănătoase.',
      en: 'For feeding difficulties, weaning, weight, or healthy-eating goals.',
      ru: 'При трудностях с кормлением, введении прикорма, вопросах веса или здоровых привычках.',
    },
    note: {
      kind: 'highlight',
      ro: 'Cu experiență dedicată în dificultățile de alimentație și refuzul biberonului.',
      en: 'With dedicated experience in feeding difficulties and bottle aversion.',
      ru: 'Отдельно работаю с трудностями кормления и отказом от бутылочки.',
    },
    cta: { ro: 'Programează', en: 'Book a time', ru: 'Записаться' },
  },
  {
    code: 'integrative',
    group: 'A_booking',
    num: '03',
    tag: { ro: 'Integrativ', en: 'Integrative', ru: 'Интегративный' },
    title: {
      ro: 'Consultație integrativă și monitorizare',
      en: 'Integrative consultation & monitoring',
      ru: 'Интегративная консультация и наблюдение',
    },
    duration: {
      ro: '{duration} · video',
      en: '{duration} · video',
      ru: '{duration} · видео',
    },
    value: {
      ro: 'O consultație amănunțită care îmbină pediatria și nutriția, cu un plan de urmat în timp.',
      en: 'An in-depth visit that combines pediatric and nutrition expertise, with a plan to follow over time.',
      ru: 'Подробная консультация, объединяющая педиатрию и нутрициологию, с планом действий на будущее.',
    },
    bestFor: {
      ro: 'Pentru situații complexe sau de durată, care cer o evaluare completă.',
      en: 'For complex or ongoing situations that need a thorough assessment.',
      ru: 'Для сложных или длительных ситуаций, требующих всесторонней оценки.',
    },
    cta: { ro: 'Programează', en: 'Book a time', ru: 'Записаться' },
  },
];

const SERVICES_B: ServiceContent[] = [
  {
    code: 'monitoring',
    group: 'B_portal',
    num: '04',
    tag: { ro: 'Acompaniere', en: 'Support', ru: 'Сопровождение' },
    title: {
      ro: 'Monitorizare și abonamente',
      en: 'Monitoring & subscriptions',
      ru: 'Наблюдение и абонементы',
    },
    duration: {
      ro: '1–6 luni · portal',
      en: '1–6 months · portal',
      ru: '1–6 месяцев · портал',
    },
    value: {
      ro: 'Monitorizare și suport continuu — 4 tipuri de abonament, pe 1, 2, 3 sau 6 luni. Durata și prețul le stabilim individual cu medicul.',
      en: 'Continuous monitoring and support — 4 subscription types, over 1, 2, 3, or 6 months. Duration and price are set individually with the doctor.',
      ru: 'Постоянное наблюдение и поддержка — 4 типа абонемента на 1, 2, 3 или 6 месяцев. Длительность и цену врач согласует индивидуально.',
    },
    bestFor: {
      ro: 'Pentru familiile care vor sprijin constant, nu o vizită singulară.',
      en: 'For families who want steady support, not a one-off visit.',
      ru: 'Для семей, которым нужна постоянная поддержка, а не разовый визит.',
    },
    cta: {
      ro: 'Solicită un abonament',
      en: 'Request a subscription',
      ru: 'Оставить заявку',
    },
  },
  {
    code: 'quick_question',
    group: 'B_portal',
    num: '05',
    tag: { ro: 'EXPRESS', en: 'Express', ru: 'Экспресс' },
    title: {
      ro: 'Întrebare EXPRESS',
      en: 'Express question',
      ru: 'Экспресс-вопрос',
    },
    duration: {
      ro: 'răspuns în {sla} · scris',
      en: '{sla} reply · written',
      ru: 'ответ за {sla} · письменно',
    },
    value: {
      ro: 'Ai o singură întrebare? Primești un răspuns scris de la medic în {slaInHours}.',
      en: 'Have one question? Get a written answer from the doctor within {slaInHours}.',
      ru: 'Есть один вопрос? Получите письменный ответ от врача в течение {slaInHours}.',
    },
    bestFor: {
      ro: 'Pentru o întrebare punctuală, non-urgentă, care nu cere o consultație completă.',
      en: "For a specific, non-urgent question that doesn't need a full consultation.",
      ru: 'Для конкретного несрочного вопроса, который не требует полной консультации.',
    },
    note: {
      kind: 'warning',
      ro: 'Nu este pentru urgențe. Dacă situația e urgentă, sună la 112.',
      en: 'Not for emergencies. If it’s urgent, call 112.',
      ru: 'Не для неотложных случаев. Если ситуация срочная, звоните 112.',
    },
    cta: {
      ro: 'Trimite întrebarea',
      en: 'Ask your question',
      ru: 'Отправить вопрос',
    },
  },
];

/* Choice helper — situation → service, anchored to the matching row. */
const CHOICE: { to: string; situation: Bi; service: Bi }[] = [
  {
    to: 'quick_question',
    situation: {
      ro: 'O singură întrebare punctuală',
      en: 'One specific question',
      ru: 'Один конкретный вопрос',
    },
    service: {
      ro: 'Întrebare EXPRESS',
      en: 'Express question',
      ru: 'Экспресс-вопрос',
    },
  },
  {
    to: 'pediatric',
    situation: {
      ro: 'Sănătatea copilului tău',
      en: "Your child's health",
      ru: 'Здоровье вашего ребёнка',
    },
    service: {
      ro: 'Consultație pediatrică',
      en: 'Pediatric consultation',
      ru: 'Педиатрическая консультация',
    },
  },
  {
    to: 'nutrition',
    situation: {
      ro: 'Alimentație sau diversificare',
      en: 'Feeding or diet',
      ru: 'Питание или прикорм',
    },
    service: {
      ro: 'Consultație nutrițională',
      en: 'Nutrition consultation',
      ru: 'Консультация по питанию',
    },
  },
  {
    to: 'integrative',
    situation: {
      ro: 'Un caz complex sau urmărire în timp',
      en: 'A complex case or ongoing care',
      ru: 'Сложный случай или наблюдение в динамике',
    },
    service: {
      ro: 'Consultație integrativă',
      en: 'Integrative consultation',
      ru: 'Интегративная консультация',
    },
  },
];

/* Comparison matrix — short summary labels (full copy lives in the rows).
   COMPARE_CODES aligns each column to its service anchor (same order). */
const COMPARE_CODES = [
  'pediatric',
  'nutrition',
  'integrative',
  'monitoring',
  'quick_question',
] as const;

const COMPARE_COLS: Bi[] = [
  { ro: 'Pediatrică', en: 'Pediatric', ru: 'Педиатрическая' },
  { ro: 'Nutrițională', en: 'Nutrition', ru: 'По питанию' },
  { ro: 'Integrativă', en: 'Integrative', ru: 'Интегративная' },
  {
    ro: 'Monitorizare și abonamente',
    en: 'Monitoring & subscriptions',
    ru: 'Наблюдение и абонементы',
  },
  { ro: 'Întrebare EXPRESS', en: 'Express question', ru: 'Экспресс-вопрос' },
];

const COMPARE_ROWS: { label: Bi; cells: Bi[] }[] = [
  {
    label: { ro: 'Format', en: 'Format', ru: 'Формат' },
    cells: [
      { ro: 'Video', en: 'Video', ru: 'Видео' },
      { ro: 'Video', en: 'Video', ru: 'Видео' },
      { ro: 'Video', en: 'Video', ru: 'Видео' },
      { ro: 'Portal', en: 'Portal', ru: 'Портал' },
      { ro: 'Portal', en: 'Portal', ru: 'Портал' },
    ],
  },
  {
    label: { ro: 'Durată', en: 'Duration', ru: 'Длительность' },
    cells: [
      { ro: '{duration}', en: '{duration}', ru: '{duration}' },
      { ro: '{duration}', en: '{duration}', ru: '{duration}' },
      { ro: '{duration}', en: '{duration}', ru: '{duration}' },
      { ro: '1–6 luni', en: '1–6 months', ru: '1–6 месяцев' },
      { ro: '{sla}', en: '{sla}', ru: '{sla}' },
    ],
  },
  {
    label: { ro: 'Pentru', en: 'For', ru: 'Для чего' },
    cells: [
      { ro: 'Sănătatea copilului', en: 'Child health', ru: 'Здоровье ребёнка' },
      {
        ro: 'Alimentație / dietă',
        en: 'Feeding / diet',
        ru: 'Питание / диета',
      },
      {
        ro: 'Caz complex / de durată',
        en: 'Complex / ongoing',
        ru: 'Сложный / длительный случай',
      },
      {
        ro: 'Sprijin continuu',
        en: 'Continuous support',
        ru: 'Постоянная поддержка',
      },
      { ro: 'O întrebare', en: 'One question', ru: 'Один вопрос' },
    ],
  },
  {
    label: { ro: 'Rezultat', en: 'Output', ru: 'Результат' },
    cells: [
      { ro: 'Plan scris', en: 'Written summary', ru: 'Письменный план' },
      { ro: 'Plan alimentar', en: 'Nutrition plan', ru: 'План питания' },
      { ro: 'Plan de acțiune', en: 'Action plan', ru: 'План действий' },
      { ro: 'Plan continuu', en: 'Ongoing plan', ru: 'План на весь срок' },
      { ro: 'Răspuns scris', en: 'Written answer', ru: 'Письменный ответ' },
    ],
  },
];

/* How it works — two tracks. */
const TRACK_VIDEO: Bi[] = [
  {
    ro: 'Alegi serviciul și ora',
    en: 'Choose a service and time',
    ru: 'Выбираете услугу и время',
  },
  {
    ro: 'Plătești prin transfer și confirmi',
    en: 'Pay by transfer and confirm',
    ru: 'Оплачиваете переводом и подтверждаете',
  },
  {
    ro: 'Ne vedem pe video',
    en: 'Join the video call',
    ru: 'Встречаемся по видеосвязи',
  },
  {
    ro: 'Primești planul scris',
    en: 'Get your written summary',
    ru: 'Получаете письменный план',
  },
];
const TRACK_PORTAL: Bi[] = [
  { ro: 'Alegi serviciul', en: 'Choose the service', ru: 'Выбираете услугу' },
  {
    ro: 'Plătești și trimiți datele',
    en: 'Pay and submit your details',
    ru: 'Оплачиваете и отправляете данные',
  },
  { ro: 'Medicul analizează', en: 'The doctor reviews', ru: 'Врач изучает' },
  {
    ro: 'Primești răspunsul sau planul',
    en: 'Get your answer or plan',
    ru: 'Получаете ответ или план',
  },
];

/* FAQ. */
const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: {
      ro: 'Cum decurg consultațiile video?',
      en: 'How do video consultations work?',
      ru: 'Как проходят видеоконсультации?',
    },
    a: {
      ro: 'Printr-un link în browser, fără să instalezi nimic. Primești instrucțiunile cu 24 de ore înainte.',
      en: 'Through a link in your browser — nothing to install. You get instructions 24 hours before.',
      ru: 'По ссылке в браузере, ничего устанавливать не нужно. Инструкции получаете за 24 часа.',
    },
  },
  {
    q: { ro: 'În ce limbi?', en: 'Which languages?', ru: 'На каких языках?' },
    a: {
      ro: 'Română, rusă și engleză.',
      en: 'Romanian, Russian, and English.',
      ru: 'Румынский, русский и английский.',
    },
  },
  {
    q: { ro: 'Cum plătesc?', en: 'How do I pay?', ru: 'Как оплатить?' },
    a: {
      ro: 'Prin transfer bancar. Primești detaliile de plată după confirmarea programării.',
      en: "By bank transfer. You'll get the payment details once your booking is confirmed.",
      ru: 'Банковским переводом. Реквизиты для оплаты получаете после подтверждения записи.',
    },
  },
  {
    q: {
      ro: 'Pot reprograma sau anula?',
      en: 'Can I reschedule or cancel?',
      ru: 'Можно перенести или отменить?',
    },
    a: {
      ro: 'Da. Reprogramezi sau anulezi din linkul de confirmare, cu cel puțin 24 de ore înainte.',
      en: 'Yes. Reschedule or cancel from your confirmation link at least 24 hours ahead.',
      ru: 'Да. Перенести или отменить можно по ссылке из подтверждения, не позднее чем за 24 часа.',
    },
  },
  {
    q: {
      ro: 'Este pentru urgențe?',
      en: 'Is this for emergencies?',
      ru: 'Это для неотложных случаев?',
    },
    a: {
      ro: 'Nu. Consultațiile online nu sunt pentru urgențe. Dacă situația e urgentă, sună la 112.',
      en: "No. Online consultations aren't for emergencies. If it's urgent, call 112.",
      ru: 'Нет. Онлайн-консультации не для неотложных случаев. Если ситуация срочная, звоните 112.',
    },
  },
  {
    q: {
      ro: 'Care e diferența dintre pediatrică și integrativă?',
      en: 'Pediatric vs integrative — what’s the difference?',
      ru: 'В чём разница между педиатрической и интегративной?',
    },
    a: {
      ro: 'Consultația pediatrică se concentrează pe o întrebare de sănătate. Cea integrativă îmbină pediatria și nutriția pentru cazuri complexe și include începutul unei urmăriri.',
      en: 'A pediatric consultation focuses on one health question. The integrative one combines pediatrics and nutrition for complex cases and includes the start of ongoing monitoring.',
      ru: 'Педиатрическая консультация сосредоточена на одном вопросе здоровья. Интегративная объединяет педиатрию и нутрициологию для сложных случаев и включает начало наблюдения.',
    },
  },
];

/**
 * The numbers this page quotes and does not own: how long a call is, and how
 * long the EXPRESS answer takes. Both are edited by the client — the first in
 * the service catalog, the second in the working-hours row — and both used to
 * be literal text in twelve places here (audit A7, F2). The copy leaves a slot;
 * this fills it, and drops the separator when there is nothing to fill it with,
 * so an unreachable catalog shows "video" rather than "· video".
 */
interface ServiceFacts {
  duration: (code: string) => string | null;
  sla: string;
  slaInHours: string;
}

/** The page's own row keys → the catalog code carrying the duration. */
const CATALOG_CODE: Record<string, string> = { nutrition: 'nutrition_copii' };

function fillFacts(text: string, code: string, facts: ServiceFacts): string {
  return text
    .split('{duration}')
    .join(facts.duration(CATALOG_CODE[code] ?? code) ?? '')
    .split('{slaInHours}')
    .join(facts.slaInHours)
    .split('{sla}')
    .join(facts.sla)
    .replace(/^\s*·\s*/, '')
    .replace(/\s*·\s*$/, '')
    .trim();
}

/** A described service — homepage-style numbered editorial row. */
function ServiceRow({
  locale,
  s,
  facts,
}: {
  locale: string;
  s: ServiceContent;
  facts: ServiceFacts;
}) {
  const detailHref = DETAIL_ROUTE[s.code] ?? '/services';
  // The same list the homepage tile and /pricing render. This page kept its
  // own copy of all five, and fifteen of the fifty-seven lines had already
  // drifted from it (audit A7).
  const shared = SERVICE_INCLUDED[s.code];
  const included = shared
    ? fillIncluded(
        locale === 'ru' ? shared.ru : locale === 'en' ? shared.en : shared.ro,
        {
          duration: facts.duration(CATALOG_CODE[s.code] ?? s.code),
          slaInHours: facts.slaInHours,
        },
      )
    : [];
  const ru = locale === 'ru';
  const en = locale === 'en';
  const pick = biFor(locale);
  const title = pick(s.title);

  return (
    <Reveal
      as="article"
      id={s.code}
      className="grid scroll-mt-28 grid-cols-[clamp(48px,12vw,72px)_1fr] gap-x-5 border-t border-[var(--rule)] py-12 md:grid-cols-[clamp(88px,9vw,120px)_1fr] md:gap-x-10 md:py-16"
    >
      {/* Oversized italic serif number */}
      <div
        className="serif select-none text-[clamp(48px,8vw,96px)] italic leading-[0.82] text-sage"
        aria-hidden="true"
      >
        {s.num}
      </div>

      <div className="grid gap-x-12 gap-y-7 lg:grid-cols-[1fr_1.4fr]">
        {/* Identity */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-sage-text">
            {pick(s.tag)}
          </p>
          <h3 className="serif mt-3 text-[clamp(1.9rem,3vw,2.75rem)] leading-[1.05] tracking-[-0.01em]">
            {title}
          </h3>
          <p className="mono mt-3 text-[11px] uppercase tracking-[0.06em] text-ink-soft">
            {fillFacts(pick(s.duration), s.code, facts)}
          </p>
          <p className="mt-5 max-w-[40ch] text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
            <span className="text-ink">
              {ru ? 'Рекомендуется — ' : en ? 'Best for — ' : 'Recomandat — '}
            </span>
            {pick(s.bestFor)}
          </p>
        </div>

        {/* Detail */}
        <div>
          <p className="max-w-[58ch] text-[1.15rem] leading-relaxed text-ink text-pretty">
            {fillFacts(pick(s.value), s.code, facts)}
          </p>

          <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            {ru ? 'Что входит' : en ? "What's included" : 'Ce include'}
          </p>
          <ul className="mt-3 grid gap-2.5">
            {included.map((item) => (
              <li
                key={item}
                className="grid grid-cols-[1.1em_1fr] gap-x-2 text-[0.95rem] leading-relaxed text-ink-soft"
              >
                <span aria-hidden="true" className="text-sage">
                  —
                </span>
                <span className="text-pretty">{item}</span>
              </li>
            ))}
          </ul>

          {s.note && (
            <p
              className={
                s.note.kind === 'warning'
                  ? 'mt-6 max-w-[58ch] border-t border-[var(--rule)] pt-4 text-[0.9rem] leading-relaxed text-ink text-pretty'
                  : 'mt-6 max-w-[58ch] text-[0.95rem] italic leading-relaxed text-[var(--walnut)] text-pretty'
              }
            >
              {s.note.kind === 'warning' && (
                <span className="mono mr-2 text-[11px] uppercase tracking-[0.12em] text-sage-text not-italic">
                  {ru ? 'Важно' : en ? 'Important' : 'Important'}
                </span>
              )}
              {pick(s.note)}
            </p>
          )}

          <div className="mt-8">
            <Link href={detailHref} className={underline}>
              {ru ? 'Подробнее' : en ? 'Details' : 'Detalii'} →
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [portrait, services, hours] = await Promise.all([
    siteMediaAsset('portrait_services'),
    api.services(),
    api.workingHours(),
  ]);
  const facts: ServiceFacts = {
    duration: (code) =>
      formatServiceDuration(
        locale,
        services.find((s) => s.code === code)?.durationMin ?? null,
      ),
    sla: formatSla(locale, hours.expressSlaMinutes),
    slaInHours: formatSlaInHours(locale, hours.expressSlaMinutes),
  };
  const freeConsult = calendlyUrlFor('free_consult', services);

  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = biFor(locale);

  const T = {
    eyebrow: ru
      ? 'Услуги · Педиатрия & Питание'
      : en
        ? 'Services · Pediatrics & Nutrition'
        : 'Servicii · Pediatrie & Nutriție',
    heroTagline: ru
      ? 'Видеоконсультации и сопровождение — в вашем ритме.'
      : en
        ? 'Video consultations and ongoing support — at your pace.'
        : 'Consultații video și acompaniere — în ritmul tău.',
    heroDesc: ru
      ? 'Пять услуг в двух форматах — от одной видеоконсультации до абонемента с наблюдением. Выберите подходящую и запишитесь за несколько минут.'
      : en
        ? 'Five services in two formats — from a single video consultation to a monitoring subscription. Pick the one that fits and book in minutes.'
        : 'Cinci servicii în două formate: de la o consultație video la un abonament cu monitorizare. Alege-l pe cel potrivit și programează în câteva minute.',
    ctaBook: ru
      ? 'Записаться на бесплатную беседу'
      : en
        ? 'Book a free intro call'
        : 'Programează o discuție gratuită',
    seePricing: ru ? 'Смотреть цены' : en ? 'See pricing' : 'Vezi tarifele',
    slogan: ru
      ? 'Оказываю услуги педиатрии и клинической нутрициологии для детей и взрослых — с акцентом на профилактику, гармоничный рост и развитие, введение прикорма, здоровье пищеварения, пищевые непереносимости и аллергии, метаболические нарушения и оптимизацию образа жизни.'
      : en
        ? 'I offer pediatric and clinical nutrition services for children and adults, with a focus on prevention, healthy growth and development, complementary feeding, digestive health, food intolerances and allergies, metabolic conditions, and lifestyle optimization.'
        : 'Ofer servicii de pediatrie și nutriție clinică pentru copii și adulți, cu accent pe prevenție, creștere și dezvoltare armonioasă, alimentație complementară, sănătate digestivă, intoleranțe și alergii alimentare, boli metabolice și optimizarea stilului de viață.',
    trust: ru
      ? 'Врач-педиатр · магистр нутрициологии (USMF) · член Общества педиатрии'
      : en
        ? 'Pediatrician · MSc in Human Nutrition (USMF) · member of the Society of Pediatrics'
        : 'Medic pediatru · MSc Nutriția Omului (USMF) · membră a Societății de Pediatrie',
    choiceTitle: ru
      ? 'Не знаете, с чего начать?'
      : en
        ? 'Not sure where to start?'
        : 'Nu ești sigură de unde să începi?',
    choiceSub: ru
      ? 'Выберите ситуацию, похожую на вашу.'
      : en
        ? 'Pick the situation that sounds like yours.'
        : 'Alege situația care seamănă cu a ta.',
    videoEyebrow: ru
      ? 'Группа A · Live'
      : en
        ? 'Group A · Live'
        : 'Grupa A · Live',
    portalEyebrow: ru
      ? 'Группа B · Портал'
      : en
        ? 'Group B · Portal'
        : 'Grupa B · Portal',
    videoSub: ru
      ? 'Живые встречи, запись через календарь. Оплата переводом, письменный план — после.'
      : en
        ? 'Live visits, booked from a calendar. Pay by transfer; get your written plan afterwards.'
        : 'Întâlniri live, rezervate dintr-un calendar. Plătești prin transfer, primești planul scris după.',
    portalSub: ru
      ? 'Без календаря. Отправляете данные через портал, и врач отвечает.'
      : en
        ? 'No calendar. Submit your details through the portal and the doctor replies.'
        : 'Fără calendar. Trimiți datele prin portal și medicul îți răspunde.',
    compareEyebrow: ru ? 'Все рядом' : en ? 'Side by side' : 'Toate, alături',
    service: ru ? 'Услуга' : en ? 'Serviciu' : 'Serviciu',
    pricingCell: ru ? 'Цены' : en ? 'Pricing' : 'Tarife',
    howEyebrow: ru
      ? 'Как это работает'
      : en
        ? 'How it works'
        : 'Cum funcționează',
    howSub: ru
      ? 'Два простых пути. Выбираете формат — остальное понятно.'
      : en
        ? 'Two simple paths. Choose the format — the rest is clear.'
        : 'Două drumuri simple. Alegi formatul — restul e clar.',
    doctorEyebrow: ru ? 'О враче' : en ? 'About the doctor' : 'Despre medic',
    doctorBody: ru
      ? 'Олеся Жалба, врач-педиатр с магистратурой по нутрициологии (USMF «Николае Тестемицану»). Работает исключительно онлайн, чтобы расстояние больше не было препятствием — для семей по всей стране и в диаспоре.'
      : en
        ? 'Olesea Jalba, a pediatrician with an MSc in Human Nutrition (USMF “Nicolae Testemițanu”). She works exclusively online, so distance is never the obstacle — for families across the country and the diaspora.'
        : 'Olesea Jalba, medic pediatru cu masterat în Nutriția Omului (USMF „Nicolae Testemițanu”). Lucrează exclusiv online, ca distanța să nu mai fie o problemă — pentru familii din toată țara și din diasporă.',
    doctorLink: ru
      ? 'Смотреть полный профиль'
      : en
        ? 'See full profile'
        : 'Vezi profilul complet',
    docFocusLabel: ru ? 'Специализации' : en ? 'Focus areas' : 'Specializări',
    docFocus: ru
      ? 'Питание ребёнка\nТрудности кормления\nДетская гастроэнтерология'
      : en
        ? 'Child nutrition\nFeeding difficulties\nPediatric gastroenterology'
        : 'Nutriția copilului\nDificultăți de alimentație\nGastroenterologie pediatrică',
    docRecLabel: ru ? 'Признание' : en ? 'Credentials' : 'Recunoaștere',
    docRec: ru
      ? 'Член Общества педиатрии\nМагистр нутрициологии (USMF)'
      : en
        ? 'Member, Society of Pediatrics\nMSc Human Nutrition (USMF)'
        : 'Membră a Societății de Pediatrie\nMSc Nutriția Omului (USMF)',
    faqEyebrow: ru ? 'Полезно знать' : en ? 'Good to know' : 'Bine de știut',
  };

  const SectionTitle = ({
    a,
    b,
    accent,
    onDark = false,
  }: {
    a: string;
    accent: string;
    b?: string;
    onDark?: boolean;
  }) => (
    <h2
      className={`serif text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.0] tracking-[-0.02em] text-balance ${
        onDark ? 'text-cream' : 'text-ink'
      }`}
    >
      {a}{' '}
      <span
        className={`serif-it ${onDark ? 'text-[var(--sage-soft)]' : 'text-sage'}`}
      >
        {accent}
      </span>
      {b ? <> {b}</> : null}
    </h2>
  );

  return (
    <main className="bg-cream text-ink">
      {/* 1 · Hero — editorial split: statement left, description right (no photo) */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span
              className="size-1.5 rounded-full bg-sage"
              aria-hidden="true"
            />
            {T.eyebrow}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.8rem,6.5vw,5.8rem)] leading-[1.02] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    Педиатрия и{' '}
                    <span className="serif-it text-sage">питание</span>, онлайн
                  </>
                ) : en ? (
                  <>
                    Pediatric &{' '}
                    <span className="serif-it text-sage">nutrition</span> care,
                    online
                  </>
                ) : (
                  <>
                    Pediatrie și{' '}
                    <span className="serif-it text-sage">nutriție</span>, online
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[34ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {T.heroTagline}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                {freeConsult && (
                  <CalendlyButton
                    url={freeConsult}
                    reason={T.ctaBook}
                    label={T.ctaBook}
                    withArrow={false}
                    className={btnDark}
                  />
                )}
                <Link href="/pricing" className={underlineLg}>
                  {T.seePricing} →
                </Link>
              </div>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {T.heroDesc}
              </p>
              <p className="mono mt-8 border-t border-[var(--rule)] pt-6 text-[11px] uppercase tracking-[0.1em] leading-relaxed text-ink-soft">
                {T.trust}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1b · Services slogan (brief §7.3) — first-person mission statement */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-14 md:py-20">
          <blockquote className="serif mx-auto max-w-[46rem] text-center text-[clamp(1.35rem,2.8vw,2.1rem)] leading-[1.35] tracking-[-0.01em] text-ink text-balance">
            <span className="serif-it text-sage">“</span>
            {T.slogan}
            <span className="serif-it text-sage">”</span>
          </blockquote>
        </div>
      </section>

      {/* 2 · Choice helper */}
      <section className="bg-paper">
        <div className="shell py-16 md:py-24">
          <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
            <SectionTitle
              a={
                ru
                  ? 'С чего'
                  : en
                    ? 'Not sure where to'
                    : 'Nu ești sigură de unde'
              }
              accent={ru ? 'начать?' : en ? 'start?' : 'să începi?'}
            />
            <p className="max-w-[300px] text-sm leading-[1.7] text-ink-soft">
              {T.choiceSub}
            </p>
          </div>
          <ul className="mt-10 border-t border-[var(--rule)]">
            {CHOICE.map((c) => (
              <li key={c.to} className="border-b border-[var(--rule)]">
                <a
                  href={`#${c.to}`}
                  className="group flex items-center justify-between gap-6 py-5 transition-colors hover:text-sage focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sage"
                >
                  <span className="serif text-[clamp(1.25rem,2.2vw,1.7rem)] leading-snug text-ink transition-colors group-hover:text-sage text-pretty">
                    {lc(c.situation)}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-[13px] font-medium uppercase tracking-[0.08em] text-sage-text">
                    <span className="hidden sm:inline">{lc(c.service)}</span>
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 · Video consultations (group A) */}
      <section className="shell py-20 md:py-28">
        <header className="mb-4 flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
          <div>
            <p className="eyebrow mb-3">{T.videoEyebrow}</p>
            <SectionTitle
              a={ru ? 'Видео' : en ? 'Video' : 'Consultații'}
              accent={ru ? 'консультации' : en ? 'consultations' : 'video'}
            />
          </div>
          <p className="max-w-[340px] text-sm leading-[1.7] text-ink-soft md:pt-4">
            {T.videoSub}
          </p>
        </header>
        <div>
          {SERVICES_A.map((s) => (
            <ServiceRow key={s.code} locale={locale} s={s} facts={facts} />
          ))}
        </div>
      </section>

      {/* 4 · Support & portal (group B) */}
      <section className="bg-paper">
        <div className="shell py-20 md:py-28">
          <header className="mb-4 flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
            <div>
              <p className="eyebrow mb-3">{T.portalEyebrow}</p>
              <SectionTitle
                a={ru ? 'Сопровождение' : en ? 'Support &' : 'Acompaniere'}
                accent={ru ? 'и вопросы' : en ? 'questions' : '& întrebări'}
              />
            </div>
            <p className="max-w-[340px] text-sm leading-[1.7] text-ink-soft md:pt-4">
              {T.portalSub}
            </p>
          </header>
          <div>
            {SERVICES_B.map((s) => (
              <ServiceRow key={s.code} locale={locale} s={s} facts={facts} />
            ))}
          </div>
        </div>
      </section>

      {/* 5 · Comparison — editorial spec columns (no table chrome) */}
      <section className="shell border-t border-[var(--rule)] py-20 md:py-28">
        <div className="mb-12 md:mb-16">
          <p className="eyebrow mb-3">{T.compareEyebrow}</p>
          <SectionTitle
            a={ru ? 'Сравните' : en ? 'Compare' : 'Compară'}
            accent={ru ? 'услуги' : en ? 'services' : 'serviciile'}
          />
        </div>

        <div className="grid grid-cols-1 border-t border-[var(--rule)] lg:grid-cols-5 lg:divide-x lg:divide-[var(--rule)]">
          {COMPARE_COLS.map((col, ci) => (
            <div
              key={col.en}
              className="flex flex-col border-b border-[var(--rule)] py-7 lg:border-b-0 lg:px-7 lg:pb-5 lg:pt-9 lg:first:pl-0 lg:last:pr-0"
            >
              <span className="mono self-start rounded-full border border-[var(--rule)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                {fillFacts(
                  lc(COMPARE_ROWS[0].cells[ci]),
                  COMPARE_CODES[ci],
                  facts,
                )}
              </span>
              <h3 className="serif mt-4 text-[clamp(1.45rem,1.8vw,1.8rem)] leading-[1.1] tracking-[-0.01em] text-balance">
                {lc(col)}
              </h3>
              <dl className="mt-6 grid gap-4">
                {[1, 2, 3].map((ri) => (
                  <div key={COMPARE_ROWS[ri].label.en}>
                    <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-sage-text">
                      {lc(COMPARE_ROWS[ri].label)}
                    </dt>
                    <dd className="mt-1 text-[0.95rem] leading-snug text-ink text-pretty">
                      {fillFacts(
                        lc(COMPARE_ROWS[ri].cells[ci]),
                        COMPARE_CODES[ci],
                        facts,
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <a
                href={`#${COMPARE_CODES[ci]}`}
                className={`mt-auto self-start pt-7 ${underline}`}
              >
                {ru ? 'Подробнее' : en ? 'Details' : 'Detalii'} →
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm leading-relaxed text-ink-soft">
          {ru
            ? 'Цены на все услуги — на странице '
            : en
              ? 'Prices for every service are on the '
              : 'Prețurile pentru toate serviciile sunt pe pagina de '}
          <Link href="/pricing" className={underlineLg}>
            {ru ? 'цен' : en ? 'pricing page' : 'tarife'} →
          </Link>
        </p>
      </section>

      {/* 6 · How it works — two parallel timelines (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-28">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
            {T.howEyebrow}
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              a={ru ? 'Как это' : en ? 'How it' : 'Cum'}
              accent={ru ? 'работает' : en ? 'works' : 'decurge'}
              onDark
            />
            <p className="max-w-[320px] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {T.howSub}
            </p>
          </div>

          <div className="mt-14 grid gap-14 md:mt-20 md:grid-cols-2 md:gap-0">
            {[
              {
                title: ru
                  ? 'Видеоконсультации'
                  : en
                    ? 'Video consultations'
                    : 'Consultații video',
                chip: 'Video',
                descr: ru
                  ? 'Живые встречи, в календаре.'
                  : en
                    ? 'Live visits, on a calendar.'
                    : 'Întâlniri live, în calendar.',
                steps: TRACK_VIDEO,
              },
              {
                title: ru
                  ? 'Сопровождение и вопросы'
                  : en
                    ? 'Support & questions'
                    : 'Acompaniere și întrebări',
                chip: 'Portal',
                descr: ru
                  ? 'Без календаря, через портал.'
                  : en
                    ? 'No calendar, through the portal.'
                    : 'Fără calendar, prin portal.',
                steps: TRACK_PORTAL,
              },
            ].map((track, ti) => (
              <div
                key={track.title}
                className={
                  ti === 1
                    ? 'md:border-l md:border-[rgba(245,241,234,0.15)] md:pl-16 lg:pl-20'
                    : 'md:pr-16 lg:pr-20'
                }
              >
                {/* Track header */}
                <div className="flex items-center gap-4">
                  <span className="mono rounded-full border border-[rgba(245,241,234,0.3)] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--sage-soft)]">
                    {track.chip}
                  </span>
                  <span
                    className="h-px flex-1 bg-[rgba(245,241,234,0.15)]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="serif mt-5 text-[clamp(1.5rem,2.4vw,2rem)] leading-snug text-cream">
                  {track.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">
                  {track.descr}
                </p>

                {/* Numbered timeline */}
                <ol className="relative mt-9 grid gap-8">
                  <span
                    className="pointer-events-none absolute left-7 top-7 bottom-7 w-px bg-[rgba(245,241,234,0.2)]"
                    aria-hidden="true"
                  />
                  {track.steps.map((step, i) => (
                    <Reveal
                      as="li"
                      key={lc(step)}
                      delay={i * 80}
                      className="relative grid grid-cols-[56px_1fr] items-start gap-5"
                    >
                      <span
                        aria-hidden="true"
                        className="relative z-10 grid size-[56px] place-items-center rounded-full border-[5px] border-[var(--sage-deep)] bg-sage text-cream"
                      >
                        <span className="serif block translate-y-[0.05em] text-[1.5rem] italic leading-none lining-nums tabular-nums">
                          {i + 1}
                        </span>
                      </span>
                      <span className="pt-3.5 text-[1rem] leading-relaxed text-cream/85 text-pretty">
                        {lc(step)}
                      </span>
                    </Reveal>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · About the doctor — content left, portrait right */}
      <section className="shell grid items-start gap-12 border-b border-[var(--rule)] py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-20 md:py-28">
        <div className="md:sticky md:top-[133px] md:self-start">
          <p className="eyebrow mb-4">{T.doctorEyebrow}</p>
          <SectionTitle
            a={ru ? 'Кто вас' : en ? "Who you'll" : 'Cine te'}
            accent={ru ? 'консультирует' : en ? 'see' : 'consultă'}
          />
          <p className="mt-6 max-w-[54ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {T.doctorBody}
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">{T.docFocusLabel}</p>
              <p className="whitespace-pre-line text-sm leading-[1.7] text-ink">
                {T.docFocus}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-3">{T.docRecLabel}</p>
              <p className="whitespace-pre-line text-sm leading-[1.7] text-ink">
                {T.docRec}
              </p>
            </div>
          </div>
          <Link href="/about" className={`mt-10 ${underlineLg}`}>
            {T.doctorLink} →
          </Link>
        </div>

        <div className="md:max-w-none mx-auto w-full max-w-[420px]">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e9e1d0]">
            <Image
              src={portrait.url}
              alt={
                ru
                  ? 'Д-р Олеся Жалба, врач-педиатр и специалист по питанию'
                  : en
                    ? 'Dr. Olesea Jalba, pediatrician and nutrition specialist'
                    : 'Dr. Olesea Jalba, medic pediatru și specialist în nutriție'
              }
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
          <div className="mono mt-4 flex justify-between text-[11px] uppercase tracking-[0.08em] text-ink-soft">
            <span>Dr. Olesea Jalba</span>
            <span>
              {ru
                ? 'Онлайн · Где угодно'
                : en
                  ? 'Online · Anywhere'
                  : 'Online · Oriunde'}
            </span>
          </div>
        </div>
      </section>

      {/* 8 · FAQ — centered */}
      <section className="shell py-20 md:py-28">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="eyebrow mb-3">{T.faqEyebrow}</p>
          <SectionTitle
            a={ru ? 'Частые' : en ? 'Frequently' : 'Întrebări'}
            accent={ru ? 'вопросы' : en ? 'asked' : 'frecvente'}
          />
        </div>
        <div className="mx-auto mt-12 max-w-[760px]">
          {FAQ.map((it) => (
            <details
              key={it.q.en}
              className="group border-t border-[var(--rule)] last:border-b"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage [&::-webkit-details-marker]:hidden">
                <span className="serif text-[clamp(1.3rem,2vw,1.7rem)] leading-snug text-ink">
                  {lc(it.q)}
                </span>
                <span
                  className="mono shrink-0 text-2xl text-sage transition-transform duration-300 group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[66ch] pb-7 text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
                {lc(it.a)}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 9 · Final CTA */}
      <FreeConsult locale={locale} />
    </main>
  );
}
