import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { BookGroupBButton } from '@/components/ui/BookGroupBButton';
import { Reveal } from '@/components/ui/Reveal';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Single-service landing for the Express question (group B · portal). No
   calendar/video booking — the CTA opens the lead form (`quick_question`). The
   page's job: a specific, non-urgent question → a written answer in ~1h, with a
   clear "not for emergencies" boundary. Bilingual (RO default · EN); local copy.
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
      ? 'Экспресс-вопрос — ответ за ~1 час | Dr. Olesea Jalba'
      : en
      ? 'Express question — answer in ~1h | Dr. Olesea Jalba'
      : 'Întrebare EXPRESS — răspuns în ~1h | Dr. Olesea Jalba',
    description: ru
      ? 'Есть конкретный, неэкстренный вопрос? Получите письменный, обоснованный ответ от педиатра за ~1 час в рабочее время. Можно приложить фото и документы.'
      : en
      ? 'Have one specific, non-urgent question? Get a written, documented answer from a pediatrician within ~1 hour during working hours. Photos and documents welcome.'
      : 'Ai o întrebare punctuală, non-urgentă? Primești un răspuns scris și documentat de la un medic pediatru în ~1 oră în timpul programului de lucru. Poți atașa poze și documente.',
  };
}

type Bi = { ro: string; en: string; ru: string };

const STEPS: { title: Bi; text: Bi }[] = [
  {
    title: { ro: 'Trimiți întrebarea', en: 'Send your question', ru: 'Отправьте вопрос' },
    text: {
      ro: 'Completezi un formular scurt — adaugă poze sau documente, dacă e cazul.',
      en: 'Fill in a short form — add photos or documents if needed.',
      ru: 'Заполните короткую форму — при необходимости добавьте фото или документы.',
    },
  },
  {
    title: { ro: 'Medicul analizează', en: 'The doctor reviews', ru: 'Врач изучает' },
    text: {
      ro: 'Medicul citește întrebarea și contextul și pregătește un răspuns documentat.',
      en: 'The doctor reads your question and context and prepares a documented answer.',
      ru: 'Врач читает ваш вопрос и контекст и готовит обоснованный ответ.',
    },
  },
  {
    title: { ro: 'Răspuns în ~1h', en: 'Answer in ~1h', ru: 'Ответ за ~1ч' },
    text: {
      ro: 'Primești răspunsul scris pe email sau WhatsApp în ~1 oră în timpul programului de lucru, cu o rundă de clarificări.',
      en: 'You get the written answer by email or WhatsApp within ~1 hour during working hours, with one round of clarification.',
      ru: 'Письменный ответ придёт на email или в WhatsApp за ~1 час в рабочее время. Можно один раз задать уточняющие вопросы.',
    },
  },
];

const GET: Bi[] = [
  { ro: 'Analiza informațiilor și a documentelor trimise', en: 'Review of the information and documents you send', ru: 'Разбор присланной информации и документов' },
  { ro: 'Un răspuns scris și personalizat în ~1 oră în timpul programului de lucru', en: 'A written, personalized answer within ~1 hour during working hours', ru: 'Письменный, персональный ответ за ~1 час в рабочее время' },
  { ro: 'Recomandări orientative privind conduita ulterioară', en: 'Guidance on the next steps to take', ru: 'Ориентировочные рекомендации по дальнейшим действиям' },
  { ro: 'Recomandarea unor investigații suplimentare sau a unei consultații complete, dacă e nevoie', en: 'A suggestion for further tests or a full consultation, if needed', ru: 'Рекомендация дополнительных обследований или полной консультации, если нужно' },
  { ro: 'O rundă de clarificări', en: 'One round of clarification', ru: 'Возможность один раз задать уточняющие вопросы' },
];

/* Examples of what you can ask (brief §Q3 "Exemple de solicitări"). */
const EXAMPLES: Bi[] = [
  { ro: 'Interpretarea unei analize sau a unor rezultate de laborator', en: 'Interpreting a test or lab results', ru: 'Интерпретация анализа или результатов лабораторных исследований' },
  { ro: 'Recomandări privind alimentația copilului sau a adultului', en: 'Advice on a child’s or adult’s nutrition', ru: 'Рекомендации по питанию ребёнка или взрослого' },
  { ro: 'O întrebare din alimentația complementară la sugari', en: 'A question about complementary feeding for infants', ru: 'Вопрос по введению прикорма у грудничков' },
  { ro: 'Administrarea vitaminelor, mineralelor sau a suplimentelor', en: 'Taking vitamins, minerals, or supplements', ru: 'Приём витаминов, минералов или добавок' },
  { ro: 'Clarificarea unei recomandări medicale primite anterior', en: 'Clarifying a medical recommendation you received', ru: 'Уточнение ранее полученной медицинской рекомендации' },
  { ro: 'O a doua opinie privind un diagnostic sau un plan de tratament', en: 'A second opinion on a diagnosis or treatment plan', ru: 'Второе мнение по диагнозу или плану лечения' },
  { ro: 'O situație pediatrică frecventă (febră, mușcătură de insectă, vomă, diaree)', en: 'A common pediatric situation (fever, insect bite, vomiting, diarrhea)', ru: 'Частая педиатрическая ситуация (температура, укус насекомого, рвота, диарея)' },
  { ro: 'Orientare privind investigațiile sau pașii următori', en: 'Guidance on tests or the next steps', ru: 'Ориентир по обследованиям или дальнейшим шагам' },
];

const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { ro: 'Cât de repede primesc răspunsul?', en: 'How fast do I get the answer?', ru: 'Как быстро я получу ответ?' },
    a: { ro: 'În aproximativ 1 oră în timpul programului de lucru de la trimiterea întrebării.', en: 'Within about 1 hour during working hours of sending your question.', ru: 'Примерно за 1 час в рабочее время с момента отправки вопроса.' },
  },
  {
    q: { ro: 'Pot atașa poze sau documente?', en: 'Can I attach photos or documents?', ru: 'Можно ли приложить фото или документы?' },
    a: {
      ro: 'Da, le poți adăuga la întrebare — ajută medicul să înțeleagă mai bine contextul.',
      en: 'Yes — add them to your question; they help the doctor understand the context.',
      ru: 'Да, добавьте их к вопросу — это поможет врачу лучше понять контекст.',
    },
  },
  {
    q: { ro: 'Pot pune întrebări suplimentare?', en: 'Can I ask follow-up questions?', ru: 'Можно ли задать дополнительные вопросы?' },
    a: { ro: 'Da, este inclusă o rundă de clarificări.', en: 'Yes — one round of clarification is included.', ru: 'Да, один раз уточнить можно.' },
  },
  {
    q: { ro: 'Este pentru urgențe?', en: 'Is it for emergencies?', ru: 'Это для экстренных случаев?' },
    a: {
      ro: 'Nu. Întrebarea EXPRESS este pentru situații non-urgente. Dacă situația e urgentă, sună la 112.',
      en: 'No. Express question is for non-urgent situations. If it’s urgent, call 112.',
      ru: 'Нет. Экспресс-вопрос — для неэкстренных ситуаций. Если случай экстренный, звоните 112.',
    },
  },
  {
    q: { ro: 'În ce limbi pot scrie?', en: 'Which languages can I write in?', ru: 'На каких языках можно писать?' },
    a: { ro: 'Română, rusă și engleză.', en: 'Romanian, Russian, and English.', ru: 'На румынском, русском и английском.' },
  },
  {
    q: { ro: 'Cum se face plata?', en: 'How do I pay?', ru: 'Как происходит оплата?' },
    a: {
      ro: 'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după trimiterea întrebării.',
      en: 'By bank transfer (no online payment for now). You’ll get the details after sending your question.',
      ru: 'Банковским переводом (пока без онлайн-оплаты). Реквизиты придут после отправки вопроса.',
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
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Услуги' : en ? 'Services' : 'Servicii', href: '/services' },
          { label: ru ? 'Экспресс-вопрос' : en ? 'Express question' : 'Întrebare EXPRESS' },
        ]}
      />
      {/* 1 · Hero — editorial split: statement left, description right (no photo) */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Экспресс-вопрос · Онлайн-портал' : en ? 'Express question · Online portal' : 'Întrebare EXPRESS · Portal online'}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[16ch] text-[clamp(2.4rem,5.4vw,4.8rem)] leading-[1.05] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    Один вопрос, <span className="serif-it text-sage">ответ</span> за ~1 час
                  </>
                ) : en ? (
                  <>
                    One question, an <span className="serif-it text-sage">answer</span> in ~1 hour
                  </>
                ) : (
                  <>
                    O întrebare, un <span className="serif-it text-sage">răspuns</span> în ~1 oră
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[36ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {ru
                  ? 'Для конкретного вопроса, без полной консультации.'
                  : en
                  ? 'For a specific question, without a full consultation.'
                  : 'Pentru o întrebare punctuală, fără o consultație completă.'}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <BookGroupBButton
                  service="quick_question"
                  label={ru ? 'Задать вопрос' : en ? 'Ask your question' : 'Trimite întrebarea'}
                  className={btnDark}
                />
                <Link href="/pricing" className={underlineLg}>
                  {ru ? 'Смотреть тарифы' : en ? 'See pricing' : 'Vezi tarifele'} →
                </Link>
              </div>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                {ru ? 'Онлайн-портал · ответ за ~1ч' : en ? 'Online portal · ~1h reply' : 'Portal online · răspuns în ~1h'}
              </p>
              <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {ru
                  ? 'Отправьте вопрос (с фото или документами, если нужно) и получите письменный, обоснованный ответ от врача.'
                  : en
                  ? 'Send your question (with photos or documents if needed) and get a written, documented answer from the doctor.'
                  : 'Trimite întrebarea ta (cu poze sau documente, dacă e cazul) și primești un răspuns scris și documentat de la medic.'}
              </p>
              <p className="mono mt-8 border-t border-[var(--rule)] pt-6 text-[11px] uppercase tracking-[0.1em] leading-relaxed text-ink-soft">
                {ru
                  ? 'Письменный ответ от педиатра с магистратурой по нутрициологии'
                  : en
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
            {ru ? 'Шаг за шагом' : en ? 'Step by step' : 'Pas cu pas'}
          </p>
          <h2 className="serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.0] tracking-[-0.02em] text-cream text-balance">
            {ru ? (
              <>
                Как это <span className="serif-it text-[var(--sage-soft)]">работает</span>
              </>
            ) : en ? (
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
          <p className="eyebrow mb-3">{ru ? 'Что вы получаете' : en ? 'What you get' : 'Ce primești'}</p>
          <h2 className="serif text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-balance">
            {ru ? (
              <>
                Ясный, письменный <span className="serif-it text-sage">ответ</span>
              </>
            ) : en ? (
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
          <p className="eyebrow mb-3">{ru ? 'Когда подходит' : en ? 'Best for' : 'Pentru ce e potrivită'}</p>
          <p className="max-w-[42ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
            {ru
              ? 'Конкретный, неэкстренный вопрос, для которого не нужна полная видеоконсультация, — когда вам нужен письменный, обоснованный ответ.'
              : en
              ? 'A specific, non-urgent question that doesn’t need a full video consultation — when you want a documented answer in writing.'
              : 'O întrebare punctuală, non-urgentă, care nu necesită o consultație video completă — când vrei un răspuns documentat, în scris.'}
          </p>
        </div>
      </section>

      {/* 3b · Examples of what you can ask (brief §Q3) */}
      <section className="border-t border-[var(--rule)]">
        <div className="shell py-16 md:py-24">
          <div className="max-w-[40rem]">
            <p className="eyebrow mb-3">{ru ? 'Что можно спросить' : en ? 'What you can ask' : 'Ce poți întreba'}</p>
            <h2 className="serif text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Примеры <span className="serif-it text-sage">вопросов</span>
                </>
              ) : en ? (
                <>
                  Example <span className="serif-it text-sage">questions</span>
                </>
              ) : (
                <>
                  Exemple de <span className="serif-it text-sage">întrebări</span>
                </>
              )}
            </h2>
          </div>
          <ul className="mt-10 grid gap-x-16 gap-y-5 sm:grid-cols-2">
            {EXAMPLES.map((it, i) => (
              <Reveal
                key={it.en}
                delay={(i % 2) * 70}
                className="grid grid-cols-[1.2em_1fr] gap-x-3 border-t border-[var(--rule)] pt-4 text-[1.05rem] leading-relaxed text-ink"
              >
                <span aria-hidden="true" className="text-sage-text">
                  —
                </span>
                <span className="text-pretty">{lc(it)}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 · Not for emergencies (calm safety band) */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-2 md:gap-20 md:py-20">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Оплата' : en ? 'Payment' : 'Plată'}</p>
            <p className="max-w-[48ch] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Банковским переводом (пока без онлайн-оплаты). Реквизиты придут после отправки вопроса.'
                : en
                ? 'By bank transfer (no online payment for now). You’ll get the details after sending your question.'
                : 'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după trimiterea întrebării.'}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">{ru ? 'Важно' : en ? 'Important' : 'Important'}</p>
            <p className="max-w-[56ch] leading-relaxed text-ink-soft text-pretty">
              {ru ? (
                <>
                  Экспресс-вопрос — не для экстренных случаев. Если ситуация экстренная или быстро
                  ухудшается, звоните <span className="font-medium text-ink">112</span> или
                  обращайтесь в ближайшую службу неотложной помощи.
                </>
              ) : en ? (
                <>
                  Express question isn’t for emergencies. If the situation is urgent or worsening
                  fast, call <span className="font-medium text-ink">112</span> or go to the nearest
                  emergency service.
                </>
              ) : (
                <>
                  Întrebarea EXPRESS nu este pentru urgențe. Dacă situația e urgentă sau se agravează
                  rapid, sună la <span className="font-medium text-ink">112</span> sau mergi la cel
                  mai apropiat serviciu de urgență.
                </>
              )}
            </p>
            <p className="mt-4 max-w-[56ch] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Один запрос — один основной вопрос. Это не заменяет полноценную консультацию: для сложных случаев выберите видеоконсультацию.'
                : en
                ? 'One request covers one main question. It doesn’t replace a full consultation — for complex cases, choose a video consultation.'
                : 'O cerere acoperă o singură întrebare principală. Nu înlocuiește o consultație completă — pentru cazuri complexe, alege o consultație video.'}
            </p>
            <p className="mt-4 max-w-[56ch] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Ответ даётся исключительно на основе присланной информации и документов.'
                : en
                ? 'The answer is given solely on the basis of the information and documents you submit.'
                : 'Răspunsul este oferit exclusiv pe baza informațiilor și documentelor transmise.'}
            </p>
          </div>
        </div>
      </section>

      {/* 5 · FAQ — centered */}
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

      {/* 6 · Final CTA + cross-links (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Задайте свой <span className="serif-it text-[var(--sage-soft)]">вопрос</span>
                  </>
                ) : en ? (
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
                  label={ru ? 'Задать вопрос' : en ? 'Ask your question' : 'Trimite întrebarea'}
                  className={creamPill}
                />
                <span className="text-sm text-[var(--sage-soft)]">
                  {ru ? 'Нужно больше, чем вопрос? ' : en ? 'Need more than a question? ' : 'Ai nevoie de mai mult? '}
                  <Link href="/services" className={creamUnderline}>
                    {ru ? 'Смотреть консультации →' : en ? 'See the consultations →' : 'Vezi consultațiile →'}
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
                  <Link href="/pediatrics" className={creamUnderline}>
                    {ru ? 'Беспокоит здоровье ребёнка? → Педиатрическая консультация' : en ? 'Child’s health concern? → Pediatric consultation' : 'Probleme de sănătate ale copilului? → Consultație pediatrică'}
                  </Link>
                </li>
                <li>
                  <Link href="/nutrition" className={creamUnderline}>
                    {ru ? 'Питание или диета? → Консультация по нутрициологии' : en ? 'Feeding or diet? → Nutrition consultation' : 'Alimentație sau dietă? → Consultație de nutriție'}
                  </Link>
                </li>
                <li>
                  <Link href="/integrative" className={creamUnderline}>
                    {ru ? 'Сложный случай? → Интегративная консультация' : en ? 'A complex case? → Integrative consultation' : 'Un caz complex? → Consultație integrativă'}
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
