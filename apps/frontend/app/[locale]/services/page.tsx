import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { CalendlyButton } from '@/components/ui/CalendlyButton';
import { FreeConsult } from '@/components/sections/FreeConsult';
import { Reveal } from '@/components/ui/Reveal';
import { FREE_CONSULT_CALENDLY_URL } from '@/lib/calendly';

/** Service code → its dedicated landing page. Rows link here ("Detalii"). */
const DETAIL_ROUTE: Record<string, string> = {
  pediatric: '/pediatrics',
  nutrition: '/nutrition',
  integrative: '/integrative',
  monitoring: '/monitoring',
  quick_question: '/quick-question',
};

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Content lives here, bilingual (RO default · EN), so the page renders fully
   even when the API is unreachable. The live API supplies only the per-service
   Calendly scheduling URLs (group A); group-B services open the lead modal.
   Visual language mirrors the homepage sections (Hero / Services / HowItWorks /
   About): big serif with italic sage accents, oversized italic serif numbers,
   mono micro-labels, hairline rules, square dark/outline buttons, olive band.
   ────────────────────────────────────────────────────────────────────────── */

type Bi = { ro: string; en: string; ru: string };

interface ServiceContent {
  /** Service `code` — matches the API and the group-B LeadService values. */
  code: string;
  group: 'A_booking' | 'B_portal';
  num: string;
  tag: Bi;
  title: Bi;
  duration: Bi;
  value: Bi;
  bestFor: Bi;
  included: { ro: string[]; en: string[]; ru: string[] };
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
    duration: { ro: '50 min · video', en: '50 min · video', ru: '50 мин · видео' },
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
    included: {
      ro: [
        'Apel video de 50 de minute',
        'Analiza simptomelor, a istoricului și a documentelor trimise',
        'Evaluare clară și pașii următori',
        'Plan scris cu recomandări, în 24 de ore',
      ],
      en: [
        '50-minute video call',
        'Review of symptoms, history, and any documents you share',
        'A clear assessment and next steps',
        'Written summary with recommendations within 24 hours',
      ],
      ru: [
        'Видеозвонок 50 минут',
        'Разбор симптомов, истории болезни и присланных документов',
        'Понятная оценка и следующие шаги',
        'Письменный план с рекомендациями в течение 24 часов',
      ],
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
    duration: { ro: '60 min · video', en: '60 min · video', ru: '60 мин · видео' },
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
    included: {
      ro: [
        'Apel video de 60 de minute',
        'Analiza obiceiurilor alimentare actuale',
        'Un plan alimentar personalizat',
        'Recomandări scrise după consultație',
      ],
      en: [
        '60-minute video call',
        'Analysis of current eating and feeding patterns',
        'A personalized nutrition plan',
        'Written recommendations after the call',
      ],
      ru: [
        'Видеозвонок 60 минут',
        'Анализ текущих пищевых привычек',
        'Персональный план питания',
        'Письменные рекомендации после консультации',
      ],
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
    duration: { ro: '90 min · video', en: '90 min · video', ru: '90 мин · видео' },
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
    included: {
      ro: [
        'Apel video amănunțit de 90 de minute',
        'Evaluare pediatrică și nutrițională combinată',
        'Un plan de acțiune personalizat',
        'Prima urmărire / monitorizare inclusă',
      ],
      en: [
        '90-minute in-depth video call',
        'Combined pediatric and nutrition assessment',
        'A tailored action plan',
        'Initial follow-up / monitoring included',
      ],
      ru: [
        'Подробный видеозвонок 90 минут',
        'Совместная педиатрическая и нутрициологическая оценка',
        'Персональный план действий',
        'Первый контрольный визит / наблюдение включены',
      ],
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
      ro: 'Monitorizare 3 luni',
      en: '3-month monitoring',
      ru: 'Наблюдение 3 месяца (Абонемент)',
    },
    duration: { ro: '3 luni · portal', en: '3 months · portal', ru: '3 месяца · портал' },
    value: {
      ro: 'Acompaniere continuă timp de trei luni — urmăresc progresul între consultații.',
      en: 'Continuous guidance over three months — I follow your progress between consultations.',
      ru: 'Непрерывное сопровождение в течение трёх месяцев — слежу за динамикой между консультациями.',
    },
    bestFor: {
      ro: 'Pentru familiile care vor sprijin constant, nu o vizită singulară.',
      en: 'For families who want steady support, not a one-off visit.',
      ru: 'Для семей, которым нужна постоянная поддержка, а не разовый визит.',
    },
    included: {
      ro: [
        'Monitorizarea cazului timp de 3 luni',
        'Verificări periodice',
        'Ajustarea planului pe parcurs',
        'Mesagerie prioritară cu medicul',
      ],
      en: [
        'Case monitoring for 3 months',
        'Periodic check-ins',
        'Plan adjustments as things change',
        'Priority messaging with the doctor',
      ],
      ru: [
        'Наблюдение в течение 3 месяцев',
        'Регулярные проверки самочувствия',
        'Корректировка плана по мере изменений',
        'Приоритетная переписка с врачом',
      ],
    },
    cta: { ro: 'Solicită un loc', en: 'Request a place', ru: 'Оставить заявку' },
  },
  {
    code: 'quick_question',
    group: 'B_portal',
    num: '05',
    tag: { ro: 'EXPRESS', en: 'Express', ru: 'Экспресс' },
    title: { ro: 'Întrebare EXPRESS', en: 'Express question', ru: 'Экспресс-вопрос' },
    duration: { ro: 'răspuns în ~1h · scris', en: '~1h reply · written', ru: 'ответ за ~1ч · письменно' },
    value: {
      ro: 'Ai o singură întrebare? Primești un răspuns scris de la medic în ~1 oră în timpul programului de lucru.',
      en: 'Have one question? Get a written answer from the doctor within ~1 hour during working hours.',
      ru: 'Есть один вопрос? Получите письменный ответ от врача в течение ~1 часа в рабочее время.',
    },
    bestFor: {
      ro: 'Pentru o întrebare punctuală, non-urgentă, care nu cere o consultație completă.',
      en: "For a specific, non-urgent question that doesn't need a full consultation.",
      ru: 'Для конкретного несрочного вопроса, который не требует полной консультации.',
    },
    included: {
      ro: [
        'Trimiți întrebarea (cu poze sau documente, dacă e cazul)',
        'Răspuns scris în ~1 oră în timpul programului de lucru',
        'O rundă de clarificări',
      ],
      en: [
        'Submit your question (with photos or documents if needed)',
        'A written reply within ~1 hour during working hours',
        'One round of clarification',
      ],
      ru: [
        'Отправляете вопрос (с фото или документами, если нужно)',
        'Письменный ответ в течение ~1 часа в рабочее время',
        'Одно уточнение по ответу',
      ],
    },
    note: {
      kind: 'warning',
      ro: 'Nu este pentru urgențe. Dacă situația e urgentă, sună la 112.',
      en: 'Not for emergencies. If it’s urgent, call 112.',
      ru: 'Не для неотложных случаев. Если ситуация срочная, звоните 112.',
    },
    cta: { ro: 'Trimite întrebarea', en: 'Ask your question', ru: 'Отправить вопрос' },
  },
];

/* Choice helper — situation → service, anchored to the matching row. */
const CHOICE: { to: string; situation: Bi; service: Bi }[] = [
  {
    to: 'quick_question',
    situation: { ro: 'O singură întrebare punctuală', en: 'One specific question', ru: 'Один конкретный вопрос' },
    service: { ro: 'Întrebare EXPRESS', en: 'Express question', ru: 'Экспресс-вопрос' },
  },
  {
    to: 'pediatric',
    situation: { ro: 'Sănătatea copilului tău', en: "Your child's health", ru: 'Здоровье вашего ребёнка' },
    service: { ro: 'Consultație pediatrică', en: 'Pediatric consultation', ru: 'Педиатрическая консультация' },
  },
  {
    to: 'nutrition',
    situation: { ro: 'Alimentație sau diversificare', en: 'Feeding or diet', ru: 'Питание или прикорм' },
    service: { ro: 'Consultație nutrițională', en: 'Nutrition consultation', ru: 'Консультация по питанию' },
  },
  {
    to: 'integrative',
    situation: {
      ro: 'Un caz complex sau urmărire în timp',
      en: 'A complex case or ongoing care',
      ru: 'Сложный случай или наблюдение в динамике',
    },
    service: { ro: 'Consultație integrativă', en: 'Integrative consultation', ru: 'Интегративная консультация' },
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
  { ro: 'Monitorizare 3 luni', en: '3-month monitoring', ru: 'Наблюдение 3 месяца' },
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
      { ro: '50 min', en: '50 min', ru: '50 мин' },
      { ro: '60 min', en: '60 min', ru: '60 мин' },
      { ro: '90 min', en: '90 min', ru: '90 мин' },
      { ro: '3 luni', en: '3 months', ru: '3 месяца' },
      { ro: '~1h', en: '~1h', ru: '~1ч' },
    ],
  },
  {
    label: { ro: 'Pentru', en: 'For', ru: 'Для чего' },
    cells: [
      { ro: 'Sănătatea copilului', en: 'Child health', ru: 'Здоровье ребёнка' },
      { ro: 'Alimentație / dietă', en: 'Feeding / diet', ru: 'Питание / диета' },
      { ro: 'Caz complex / de durată', en: 'Complex / ongoing', ru: 'Сложный / длительный случай' },
      { ro: 'Sprijin continuu', en: 'Continuous support', ru: 'Постоянная поддержка' },
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
  { ro: 'Alegi serviciul și ora', en: 'Choose a service and time', ru: 'Выбираете услугу и время' },
  { ro: 'Plătești prin transfer și confirmi', en: 'Pay by transfer and confirm', ru: 'Оплачиваете переводом и подтверждаете' },
  { ro: 'Ne vedem pe video', en: 'Join the video call', ru: 'Встречаемся по видеосвязи' },
  { ro: 'Primești planul scris', en: 'Get your written summary', ru: 'Получаете письменный план' },
];
const TRACK_PORTAL: Bi[] = [
  { ro: 'Alegi serviciul', en: 'Choose the service', ru: 'Выбираете услугу' },
  { ro: 'Plătești și trimiți datele', en: 'Pay and submit your details', ru: 'Оплачиваете и отправляете данные' },
  { ro: 'Medicul analizează', en: 'The doctor reviews', ru: 'Врач изучает' },
  { ro: 'Primești răspunsul sau planul', en: 'Get your answer or plan', ru: 'Получаете ответ или план' },
];

/* FAQ. */
const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { ro: 'Cum decurg consultațiile video?', en: 'How do video consultations work?', ru: 'Как проходят видеоконсультации?' },
    a: {
      ro: 'Printr-un link în browser, fără să instalezi nimic. Primești instrucțiunile cu 24 de ore înainte.',
      en: 'Through a link in your browser — nothing to install. You get instructions 24 hours before.',
      ru: 'По ссылке в браузере, ничего устанавливать не нужно. Инструкции получаете за 24 часа.',
    },
  },
  {
    q: { ro: 'În ce limbi?', en: 'Which languages?', ru: 'На каких языках?' },
    a: { ro: 'Română, rusă și engleză.', en: 'Romanian, Russian, and English.', ru: 'Румынский, русский и английский.' },
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
    q: { ro: 'Pot reprograma sau anula?', en: 'Can I reschedule or cancel?', ru: 'Можно перенести или отменить?' },
    a: {
      ro: 'Da. Reprogramezi sau anulezi din linkul de confirmare, cu cel puțin 24 de ore înainte.',
      en: 'Yes. Reschedule or cancel from your confirmation link at least 24 hours ahead.',
      ru: 'Да. Перенести или отменить можно по ссылке из подтверждения, не позднее чем за 24 часа.',
    },
  },
  {
    q: { ro: 'Este pentru urgențe?', en: 'Is this for emergencies?', ru: 'Это для неотложных случаев?' },
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

/* ── Shared class strings (mirror the homepage sections) ─────────────────── */

const btnDark =
  'inline-flex cursor-pointer items-center bg-ink px-[22px] py-[14px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';
const underline =
  'inline-block cursor-pointer border-b border-ink pb-[3px] text-[13px] text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';
const underlineLg =
  'inline-block cursor-pointer border-b border-ink pb-1 text-sm text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';

/** A described service — homepage-style numbered editorial row. */
function ServiceRow({ locale, s }: { locale: string; s: ServiceContent }) {
  const detailHref = DETAIL_ROUTE[s.code] ?? '/services';
  const included =
    locale === 'ru' ? s.included.ru : locale === 'en' ? s.included.en : s.included.ro;
  const ru = locale === 'ru';
  const en = locale === 'en';
  const pick = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);
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
            {pick(s.duration)}
          </p>
          <p className="mt-5 max-w-[40ch] text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
            <span className="text-ink">{ru ? 'Рекомендуется — ' : en ? 'Best for — ' : 'Recomandat — '}</span>
            {pick(s.bestFor)}
          </p>
        </div>

        {/* Detail */}
        <div>
          <p className="max-w-[58ch] text-[1.15rem] leading-relaxed text-ink text-pretty">
            {pick(s.value)}
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
                <span className="mono mr-2 text-[11px] uppercase tracking-[0.12em] text-sage not-italic">
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

  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

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
      ? 'Пять услуг в двух форматах — от одной видеоконсультации до наблюдения в течение трёх месяцев. Выберите подходящую и запишитесь за несколько минут.'
      : en
        ? 'Five services in two formats — from a single video consultation to three-month monitoring. Pick the one that fits and book in minutes.'
        : 'Cinci servicii în două formate: de la o consultație video la urmărire de trei luni. Alege-l pe cel potrivit și programează în câteva minute.',
    ctaBook: ru ? 'Записаться на бесплатную беседу' : en ? 'Book a free intro call' : 'Programează o discuție gratuită',
    seePricing: ru ? 'Смотреть цены' : en ? 'See pricing' : 'Vezi tarifele',
    trust: ru
      ? 'Врач-педиатр · магистр нутрициологии (USMF) · член Общества педиатрии'
      : en
        ? 'Pediatrician · MSc in Human Nutrition (USMF) · member of the Society of Pediatrics'
        : 'Medic pediatru · MSc Nutriția Omului (USMF) · membră a Societății de Pediatrie',
    choiceTitle: ru ? 'Не знаете, с чего начать?' : en ? 'Not sure where to start?' : 'Nu ești sigură de unde să începi?',
    choiceSub: ru
      ? 'Выберите ситуацию, похожую на вашу.'
      : en
        ? 'Pick the situation that sounds like yours.'
        : 'Alege situația care seamănă cu a ta.',
    videoEyebrow: ru ? 'Группа A · Live' : en ? 'Group A · Live' : 'Grupa A · Live',
    portalEyebrow: ru ? 'Группа B · Портал' : en ? 'Group B · Portal' : 'Grupa B · Portal',
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
    howEyebrow: ru ? 'Как это работает' : en ? 'How it works' : 'Cum funcționează',
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
    doctorLink: ru ? 'Смотреть полный профиль' : en ? 'See full profile' : 'Vezi profilul complet',
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
      <span className={`serif-it ${onDark ? 'text-[var(--sage-soft)]' : 'text-sage'}`}>
        {accent}
      </span>
      {b ? <>{' '}{b}</> : null}
    </h2>
  );

  return (
    <main className="bg-cream text-ink">
      {/* 1 · Hero — editorial split: statement left, description right (no photo) */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {T.eyebrow}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.8rem,6.5vw,5.8rem)] leading-[1.02] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    Педиатрия и <span className="serif-it text-sage">питание</span>, онлайн
                  </>
                ) : en ? (
                  <>
                    Pediatric & <span className="serif-it text-sage">nutrition</span> care, online
                  </>
                ) : (
                  <>
                    Pediatrie și <span className="serif-it text-sage">nutriție</span>, online
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[34ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {T.heroTagline}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <CalendlyButton
                  url={FREE_CONSULT_CALENDLY_URL}
                  reason={T.ctaBook}
                  label={T.ctaBook}
                  withArrow={false}
                  className={btnDark}
                />
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

      {/* 2 · Choice helper */}
      <section className="bg-paper">
        <div className="shell py-16 md:py-24">
          <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
            <SectionTitle
              a={ru ? 'С чего' : en ? 'Not sure where to' : 'Nu ești sigură de unde'}
              accent={ru ? 'начать?' : en ? 'start?' : 'să începi?'}
            />
            <p className="max-w-[300px] text-sm leading-[1.7] text-ink-soft">{T.choiceSub}</p>
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
            <SectionTitle a={ru ? 'Видео' : en ? 'Video' : 'Consultații'} accent={ru ? 'консультации' : en ? 'consultations' : 'video'} />
          </div>
          <p className="max-w-[340px] text-sm leading-[1.7] text-ink-soft md:pt-4">{T.videoSub}</p>
        </header>
        <div>
          {SERVICES_A.map((s) => (
            <ServiceRow key={s.code} locale={locale} s={s} />
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
              <ServiceRow key={s.code} locale={locale} s={s} />
            ))}
          </div>
        </div>
      </section>

      {/* 5 · Comparison — editorial spec columns (no table chrome) */}
      <section className="shell border-t border-[var(--rule)] py-20 md:py-28">
        <div className="mb-12 md:mb-16">
          <p className="eyebrow mb-3">{T.compareEyebrow}</p>
          <SectionTitle a={ru ? 'Сравните' : en ? 'Compare' : 'Compară'} accent={ru ? 'услуги' : en ? 'services' : 'serviciile'} />
        </div>

        <div className="grid grid-cols-1 border-t border-[var(--rule)] lg:grid-cols-5 lg:divide-x lg:divide-[var(--rule)]">
          {COMPARE_COLS.map((col, ci) => (
            <div
              key={col.en}
              className="flex flex-col border-b border-[var(--rule)] py-7 lg:border-b-0 lg:px-7 lg:pb-5 lg:pt-9 lg:first:pl-0 lg:last:pr-0"
            >
              <span className="mono self-start rounded-full border border-[var(--rule)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                {lc(COMPARE_ROWS[0].cells[ci])}
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
                      {lc(COMPARE_ROWS[ri].cells[ci])}
                    </dd>
                  </div>
                ))}
              </dl>
              <a href={`#${COMPARE_CODES[ci]}`} className={`mt-auto self-start pt-7 ${underline}`}>
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
            <SectionTitle a={ru ? 'Как это' : en ? 'How it' : 'Cum'} accent={ru ? 'работает' : en ? 'works' : 'decurge'} onDark />
            <p className="max-w-[320px] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {T.howSub}
            </p>
          </div>

          <div className="mt-14 grid gap-14 md:mt-20 md:grid-cols-2 md:gap-0">
            {[
              {
                title: ru ? 'Видеоконсультации' : en ? 'Video consultations' : 'Consultații video',
                chip: 'Video',
                descr: ru ? 'Живые встречи, в календаре.' : en ? 'Live visits, on a calendar.' : 'Întâlniri live, în calendar.',
                steps: TRACK_VIDEO,
              },
              {
                title: ru ? 'Сопровождение и вопросы' : en ? 'Support & questions' : 'Acompaniere și întrebări',
                chip: 'Portal',
                descr: ru ? 'Без календаря, через портал.' : en ? 'No calendar, through the portal.' : 'Fără calendar, prin portal.',
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
                  <span className="h-px flex-1 bg-[rgba(245,241,234,0.15)]" aria-hidden="true" />
                </div>
                <h3 className="serif mt-5 text-[clamp(1.5rem,2.4vw,2rem)] leading-snug text-cream">
                  {track.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">{track.descr}</p>

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
          <SectionTitle a={ru ? 'Кто вас' : en ? "Who you'll" : 'Cine te'} accent={ru ? 'консультирует' : en ? 'see' : 'consultă'} />
          <p className="mt-6 max-w-[54ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {T.doctorBody}
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">{T.docFocusLabel}</p>
              <p className="whitespace-pre-line text-sm leading-[1.7] text-ink">{T.docFocus}</p>
            </div>
            <div>
              <p className="eyebrow mb-3">{T.docRecLabel}</p>
              <p className="whitespace-pre-line text-sm leading-[1.7] text-ink">{T.docRec}</p>
            </div>
          </div>
          <Link href="/about" className={`mt-10 ${underlineLg}`}>
            {T.doctorLink} →
          </Link>
        </div>

        <div className="md:max-w-none mx-auto w-full max-w-[420px]">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e9e1d0]">
            <Image
              src="/assets/olesea-portrait.webp"
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
            <span>{ru ? 'Онлайн · Где угодно' : en ? 'Online · Anywhere' : 'Online · Oriunde'}</span>
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
            <details key={it.q.en} className="group border-t border-[var(--rule)] last:border-b">
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
