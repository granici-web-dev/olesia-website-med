import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { creamPill, creamUnderline } from '@/components/ui/cta';
import { api } from '@/lib/api';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   FAQ — the site's consolidation point. Removes friction before conversion,
   offloads support, and routes correctly (emergencies → 112, medical → Quick
   question). Content comes from the back office (`GET /faq`); the local
   `FALLBACK_CATEGORIES` below is only the safety net for an unreachable API.
   Accessible native <details> accordions, deep-link category anchors, and
   FAQPage JSON-LD for rich snippets. Trilingual (RO default · EN · RU).
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
      ? 'Частые вопросы | Dr. Olesea Jalba'
      : en
        ? 'FAQ | Dr. Olesea Jalba'
        : 'Întrebări frecvente | Dr. Olesea Jalba',
    description: ru
      ? 'Ответы про онлайн-консультации, запись, оплату переводом и услуги — педиатрия и нутрициология.'
      : en
        ? 'Answers about online consultations, booking, payment by transfer, and services — pediatrics and nutrition.'
        : 'Răspunsuri despre consultațiile online, programare, plată prin transfer și servicii — pediatrie și nutriție.',
  };
}

type Bi = { ro: string; en: string; ru: string };

interface FaqItem {
  q: Bi;
  a: Bi;
}
interface FaqCategory {
  key: string;
  title: Bi;
  items: FaqItem[];
}

/**
 * The content as it was seeded into the database. Rendered only when the API
 * is unreachable — an FAQ page that answers nothing is worse than a slightly
 * stale one, and this page is a support surface as much as a marketing one.
 */
const FALLBACK_CATEGORIES: FaqCategory[] = [
  {
    key: 'consultatii',
    title: { ro: 'Consultații online', en: 'Online consultations', ru: 'Онлайн-консультации' },
    items: [
      {
        q: { ro: 'Cum decurge o consultație online?', en: 'How does an online consultation work?', ru: 'Как проходит онлайн-консультация?' },
        a: {
          ro: 'Consultația are loc pe Google Meet, la ora programată — primești linkul automat în e-mailul de confirmare, fără să instalezi nimic. La cerere, putem folosi și WhatsApp, Viber sau Instagram video. Instrucțiunile vin cu 24 de ore înainte.',
          en: 'The consultation takes place on Google Meet at the scheduled time — you get the link automatically in the confirmation email, with nothing to install. On request, we can also use WhatsApp, Viber, or Instagram video. Instructions arrive 24 hours ahead.',
          ru: 'Консультация проходит в Google Meet в назначенное время — ссылку вы получаете автоматически в письме-подтверждении, ничего устанавливать не нужно. По желанию можем использовать WhatsApp, Viber или Instagram video. Инструкции придут за 24 часа.',
        },
      },
      {
        q: { ro: 'De ce am nevoie pentru consultație?', en: 'What do I need for the consultation?', ru: 'Что нужно для консультации?' },
        a: {
          ro: 'Un dispozitiv cu cameră, conexiune la internet și un loc liniștit. Pregătește analizele și documentele relevante.',
          en: 'A device with a camera, an internet connection, and a quiet spot. Have any relevant test results and documents ready.',
          ru: 'Устройство с камерой, интернет и тихое место. Заранее подготовьте анализы и нужные документы.',
        },
      },
      {
        q: { ro: 'În ce limbi pot avea consultația?', en: 'Which languages can I have the consultation in?', ru: 'На каких языках можно пройти консультацию?' },
        a: { ro: 'În română, rusă și engleză.', en: 'Romanian, Russian, and English.', ru: 'На румынском, русском и английском.' },
      },
      {
        q: { ro: 'Trebuie să fie copilul prezent la consultație?', en: 'Does my child need to be present?', ru: 'Нужно ли, чтобы ребёнок был на консультации?' },
        a: {
          ro: 'Da, recomandăm ca cel mic să fie prezent — ajută la o evaluare cât mai bună.',
          en: 'Yes — we recommend the child is present, as it helps with the most accurate assessment.',
          ru: 'Да, лучше, чтобы ребёнок был рядом, — так врачу проще точно оценить состояние.',
        },
      },
      {
        q: { ro: 'Ce nu poate înlocui o consultație online?', en: 'What can’t an online consultation replace?', ru: 'Что онлайн-консультация не может заменить?' },
        a: {
          ro: 'Consultația online nu este pentru urgențe. Unele situații pot necesita o examinare fizică — îți vom spune clar când e cazul.',
          en: 'Online consultations aren’t for emergencies. Some situations need a physical exam — we’ll tell you clearly when that’s the case.',
          ru: 'Онлайн-консультация не подходит для экстренных ситуаций. Иногда нужен очный осмотр — и мы прямо скажем, когда именно.',
        },
      },
    ],
  },
  {
    key: 'programare',
    title: { ro: 'Programare și anulare', en: 'Booking & cancellation', ru: 'Запись и отмена' },
    items: [
      {
        q: { ro: 'Cum programez o consultație?', en: 'How do I book a consultation?', ru: 'Как записаться на консультацию?' },
        a: {
          ro: 'Alegi serviciul din „Servicii" și selectezi o oră liberă din calendar.',
          en: 'Choose the service under “Services” and pick an available time from the calendar.',
          ru: 'Выберите услугу в разделе «Услуги» и свободное время в календаре.',
        },
      },
      {
        q: { ro: 'Pot anula sau reprograma?', en: 'Can I cancel or reschedule?', ru: 'Можно ли отменить или перенести?' },
        a: {
          ro: 'Da. Poți anula sau reprograma cu cel puțin 24 de ore înainte, din linkul de confirmare.',
          en: 'Yes. You can cancel or reschedule at least 24 hours ahead, from your confirmation link.',
          ru: 'Да. Отменить или перенести запись можно минимум за 24 часа — по ссылке из письма-подтверждения.',
        },
      },
      {
        q: { ro: 'Ce se întâmplă dacă întârzii la consultație?', en: 'What if I’m late?', ru: 'Что если я опоздаю на консультацию?' },
        a: {
          ro: 'Te rugăm să ne anunți. Putem reprograma dacă întârzierea este prea mare pentru a desfășura consultația.',
          en: 'Please let us know. We can reschedule if the delay is too long to hold the consultation.',
          ru: 'Пожалуйста, предупредите нас. Если опоздание слишком большое и консультацию уже не успеть провести, мы её перенесём.',
        },
      },
    ],
  },
  {
    key: 'plata',
    title: { ro: 'Plată', en: 'Payment', ru: 'Оплата' },
    items: [
      {
        q: { ro: 'Cum se face plata?', en: 'How do I pay?', ru: 'Как происходит оплата?' },
        a: {
          ro: 'Prin transfer bancar (deocamdată fără plată online). Primești detaliile după confirmarea programării.',
          en: 'By bank transfer (no online payment for now). You’ll get the details once your booking is confirmed.',
          ru: 'Банковским переводом (пока без онлайн-оплаты). Реквизиты вы получите после подтверждения записи.',
        },
      },
      {
        q: { ro: 'Când achit consultația?', en: 'When do I pay?', ru: 'Когда я оплачиваю консультацию?' },
        a: {
          ro: 'Înainte de consultație, după confirmarea programării.',
          en: 'Before the consultation, once your booking is confirmed.',
          ru: 'До консультации, после подтверждения записи.',
        },
      },
      {
        q: { ro: 'Primesc o factură sau o confirmare?', en: 'Do I get an invoice or confirmation?', ru: 'Получу ли я счёт или подтверждение?' },
        a: {
          ro: 'Da, primești o confirmare pe email.',
          en: 'Yes, you receive a confirmation by email.',
          ru: 'Да, подтверждение придёт на электронную почту.',
        },
      },
      {
        q: { ro: 'Există posibilitatea de rambursare?', en: 'Are refunds possible?', ru: 'Возможен ли возврат средств?' },
        a: {
          ro: 'Da, dacă anulezi în timp util, conform politicii de anulare.',
          en: 'Yes, if you cancel in good time, per the cancellation policy.',
          ru: 'Да, если отменить запись вовремя — по правилам отмены.',
        },
      },
    ],
  },
  {
    key: 'servicii',
    title: { ro: 'Servicii', en: 'Services', ru: 'Услуги' },
    items: [
      {
        q: { ro: 'Care este diferența dintre consultații?', en: 'What’s the difference between the consultations?', ru: 'В чём разница между консультациями?' },
        a: {
          ro: 'Pediatrică (sănătate, 30 min) · Nutriție (alimentație, 60 min) · Integrativă (situații complexe + monitorizare, 90 min).',
          en: 'Pediatric (health, 30 min) · Nutrition (feeding, 60 min) · Integrative (complex cases + monitoring, 90 min).',
          ru: 'Педиатрическая (здоровье, 30 мин) · Нутрициологическая (питание, 60 мин) · Интегративная (сложные случаи + наблюдение, 90 мин).',
        },
      },
      {
        q: { ro: 'Cum aleg serviciul potrivit?', en: 'How do I choose the right service?', ru: 'Как выбрать подходящую услугу?' },
        a: {
          ro: 'Vezi ghidul scurt din pagina „Servicii", care te ajută să alegi în funcție de situație.',
          en: 'See the short helper on the “Services” page that guides you by situation.',
          ru: 'На странице «Услуги» есть короткая подсказка — она поможет выбрать под вашу ситуацию.',
        },
      },
      {
        q: { ro: 'Primesc o rețetă în urma consultației?', en: 'Will I get a prescription?', ru: 'Получу ли я рецепт после консультации?' },
        a: {
          ro: 'În funcție de situație. Unele recomandări pot necesita o evaluare suplimentară — îți spunem clar la consultație.',
          en: 'It depends on the situation. Some recommendations may need further assessment — we’ll tell you clearly during the consultation.',
          ru: 'Смотря по ситуации. Иногда, прежде чем что-то назначить, нужно дообследование — об этом мы прямо скажем на консультации.',
        },
      },
      {
        q: { ro: 'Pentru ce vârste sunt consultațiile?', en: 'What ages are the consultations for?', ru: 'Для какого возраста консультации?' },
        a: {
          ro: 'De la naștere până la adolescență.',
          en: 'From birth through adolescence.',
          ru: 'От рождения до подросткового возраста.',
        },
      },
      {
        q: { ro: 'Consultațiile sunt și pentru adulți?', en: 'Are consultations also for adults?', ru: 'Подходят ли консультации и для взрослых?' },
        a: {
          ro: 'Consultația de nutriție este disponibilă și pentru adulți.',
          en: 'The nutrition consultation is also available for adults.',
          ru: 'Консультация по нутрициологии доступна и для взрослых.',
        },
      },
    ],
  },
  {
    key: 'portal',
    title: { ro: 'Servicii prin portal', en: 'Portal services', ru: 'Услуги через портал' },
    items: [
      {
        q: { ro: 'Cum funcționează „Întreabă medicul"?', en: 'How does “Ask the doctor” work?', ru: 'Как работает «Спросить врача»?' },
        a: {
          ro: 'Scrii întrebarea, achiți prin transfer și primești un răspuns scris în ~1 oră în timpul programului de lucru.',
          en: 'You write your question, pay by transfer, and get a written answer within ~1 hour during working hours.',
          ru: 'Вы пишете вопрос, оплачиваете переводом и в течение ~1 часа в рабочее время получаете письменный ответ.',
        },
      },
      {
        q: { ro: '„~1 oră" înseamnă timp de lucru?', en: 'Does “~1 hour” mean working hours?', ru: '«~1 час» — это в рабочее время?' },
        a: {
          ro: 'Da — aproximativ o oră în timpul programului de lucru. Întrebările trimise în afara programului primesc răspuns în următorul interval de lucru.',
          en: 'Yes — about an hour during working hours. Questions sent outside the schedule are answered in the next working interval.',
          ru: 'Да, примерно час в рабочее время. На вопросы, отправленные вне графика, ответ приходит в следующий рабочий интервал.',
        },
      },
      {
        q: { ro: 'Ce include „Monitorizare și abonamente"?', en: 'What does “Monitoring & subscriptions” include?', ru: 'Что включает «Наблюдение и абонементы»?' },
        a: {
          ro: 'Sunt 4 tipuri de abonament (Pediatrie, Nutriție copii, Nutriție adulți, Complex), pe 1, 2, 3 sau 6 luni: monitorizare periodică, ajustarea planului pe parcurs și comunicare directă cu medicul. Durata și prețul le stabilim individual — lași o solicitare și te contactăm.',
          en: 'There are 4 subscription types (Pediatrics, Child nutrition, Adult nutrition, Complex), over 1, 2, 3, or 6 months: periodic monitoring, plan adjustments along the way, and direct communication with the doctor. Duration and price are set individually — leave a request and we’ll get in touch.',
          ru: 'Есть 4 типа абонемента (педиатрия, питание детей, питание взрослых, комплекс) на 1, 2, 3 или 6 месяцев: периодическое наблюдение, корректировка плана и прямая связь с врачом. Длительность и цену согласуем индивидуально — оставьте заявку, и мы свяжемся с вами.',
        },
      },
      {
        q: { ro: 'Trebuie o consultație înainte de a intra în program?', en: 'Do I need a consultation before joining the program?', ru: 'Нужна ли консультация перед началом программы?' },
        a: {
          ro: 'Recomandăm o consultație inițială, ca planul să fie adaptat copilului.',
          en: 'We recommend an initial consultation so the plan is tailored to your child.',
          ru: 'Советуем начать с первой консультации — так план получится подобрать под ребёнка.',
        },
      },
    ],
  },
  {
    key: 'confidentialitate',
    title: { ro: 'Confidențialitate și urgențe', en: 'Privacy & emergencies', ru: 'Конфиденциальность и неотложные случаи' },
    items: [
      {
        q: { ro: 'Datele mele sunt în siguranță?', en: 'Is my data safe?', ru: 'Мои данные в безопасности?' },
        a: {
          ro: 'Da. Datele tale sunt folosite doar pentru consultație și sunt păstrate în siguranță, conform legii.',
          en: 'Yes. Your data is used only for the consultation and is kept securely, in line with the law.',
          ru: 'Да. Данные нужны только для консультации, хранятся надёжно и по закону.',
        },
      },
      {
        q: { ro: 'Este o urgență medicală — ce fac?', en: 'It’s a medical emergency — what do I do?', ru: 'Это неотложный медицинский случай — что делать?' },
        a: {
          ro: 'Sună la 112 sau mergi la cel mai apropiat serviciu de urgență. Nu folosi platforma pentru urgențe.',
          en: 'Call 112 or go to the nearest emergency service. Don’t use the platform for emergencies.',
          ru: 'Звоните 112 или обращайтесь в ближайшую службу неотложной помощи. Не используйте платформу для экстренных случаев.',
        },
      },
      {
        q: { ro: 'Pot atașa poze sau analize la „Întreabă medicul"?', en: 'Can I attach photos or test results to “Ask the doctor”?', ru: 'Можно ли прикрепить фото или анализы к «Спросить врача»?' },
        a: {
          ro: 'Da, poți atașa poze și documente. Sunt stocate în siguranță și folosite doar pentru a-ți răspunde.',
          en: 'Yes — you can attach photos and documents. They’re stored securely and used only to answer you.',
          ru: 'Да, фото и документы прикрепить можно. Они хранятся надёжно и нужны только для того, чтобы вам ответить.',
        },
      },
    ],
  },
];


/**
 * Fetch the published FAQ and reshape it for this page.
 *
 * The RU fallback is resolved here rather than at render time, so `lc()` keeps
 * working on plain trilingual strings: an untranslated question shows its
 * Romanian text instead of a blank line. Same rule as `loc()` in `lib/api` —
 * an empty string counts as missing, because that is what a cleared field in
 * the back office produces.
 */
async function loadCategories(): Promise<FaqCategory[]> {
  const sections = await api.faq();
  if (sections.length === 0) return FALLBACK_CATEGORIES;

  const ruOr = (ru: string | null, fallback: string) =>
    ru?.trim() ? ru : fallback;

  return sections.map((c) => ({
    key: c.slug,
    title: {
      ro: c.titleRo,
      en: c.titleEn,
      ru: ruOr(c.titleRu, c.titleRo),
    },
    items: c.items.map((i) => ({
      q: {
        ro: i.questionRo,
        en: i.questionEn,
        ru: ruOr(i.questionRu, i.questionRo),
      },
      a: {
        ro: i.answerRo,
        en: i.answerEn,
        ru: ruOr(i.answerRu, i.answerRo),
      },
    })),
  }));
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  const CATEGORIES = await loadCategories();

  // FAQPage JSON-LD (rich snippets) — built from the current-locale answers.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CATEGORIES.flatMap((c) =>
      c.items.map((it) => ({
        '@type': 'Question',
        name: lc(it.q),
        acceptedAnswer: { '@type': 'Answer', text: lc(it.a) },
      })),
    ),
  };

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Частые вопросы' : en ? 'FAQ' : 'Întrebări frecvente' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1 · Hero — editorial split */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Частые вопросы' : en ? 'FAQ' : 'Întrebări frecvente'}
          </p>
          <div className="grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[16ch] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.03] tracking-[-0.015em] text-balance">
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
              </h1>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {ru
                  ? 'Ответы на самые частые вопросы о консультациях, записи, оплате и услугах.'
                  : en
                    ? 'Answers to the most common questions about consultations, booking, payment, and services.'
                    : 'Răspunsuri la cele mai des întâlnite întrebări despre consultații, programare, plată și servicii.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Category nav (sticky) + 3 · accordions */}
      <section className="shell grid gap-12 py-16 md:grid-cols-[240px_1fr] md:gap-16 md:py-24 lg:gap-24">
        <nav aria-label={ru ? 'Категории вопросов' : en ? 'FAQ categories' : 'Categorii de întrebări'} className="min-w-0 md:sticky md:top-[133px] md:self-start">
          <p className="eyebrow mb-4">{ru ? 'Категории' : en ? 'Categories' : 'Categorii'}</p>
          <ul className="-mx-1 flex gap-2 overflow-x-auto pb-1 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
            {CATEGORIES.map((c) => (
              <li key={c.key} className="shrink-0 md:shrink">
                <a
                  href={`#${c.key}`}
                  className="mono inline-block whitespace-nowrap rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:rounded-none md:border-0 md:border-l md:px-3 md:py-1.5 md:text-[12px] md:normal-case md:tracking-normal"
                >
                  {lc(c.title)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          {CATEGORIES.map((c) => (
            <section key={c.key} id={c.key} className="scroll-mt-28 border-t border-[var(--rule)] pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-14">
              <h2 className="serif text-[clamp(1.7rem,3vw,2.4rem)] leading-tight tracking-[-0.02em] text-balance">
                {lc(c.title)}
              </h2>
              <div className="mt-6">
                {c.items.map((it, i) => (
                  <Reveal key={it.q.en} as="details" className="group border-t border-[var(--rule)] last:border-b" delay={i * 50}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage [&::-webkit-details-marker]:hidden">
                      <span className="serif text-[clamp(1.15rem,1.8vw,1.45rem)] leading-snug text-ink text-pretty">
                        {lc(it.q)}
                      </span>
                      <span
                        className="mono shrink-0 text-2xl text-sage transition-transform duration-300 group-open:rotate-45"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <p className="max-w-[68ch] pb-6 text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
                      {lc(it.a)}
                    </p>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* 4 · Still have a question? */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-[1fr_1fr] md:gap-16 md:py-20">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Не нашли ответ?' : en ? 'Still stuck?' : 'Nu ai găsit răspunsul?'}</p>
            <h2 className="serif text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.05] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Спросите нас <span className="serif-it text-sage">напрямую</span>
                </>
              ) : en ? (
                <>
                  Ask us <span className="serif-it text-sage">directly</span>
                </>
              ) : (
                <>
                  Întreabă-ne <span className="serif-it text-sage">direct</span>
                </>
              )}
            </h2>
          </div>
          <ul className="grid gap-4 self-center">
            <li className="border-t border-[var(--rule)] pt-4">
              <Link href="/contact" className="group flex items-baseline justify-between gap-4">
                <span className="text-[1.05rem] leading-snug text-ink text-pretty">
                  {ru ? 'Общий вопрос' : en ? 'A general question' : 'O întrebare generală'}
                </span>
                <span className="shrink-0 text-[13px] font-medium uppercase tracking-[0.06em] text-sage-text">
                  {ru ? 'Контакт' : en ? 'Contact' : 'Contact'}{' '}
                  <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </li>
            <li className="border-t border-[var(--rule)] pt-4">
              <Link href="/quick-question" className="group flex items-baseline justify-between gap-4">
                <span className="text-[1.05rem] leading-snug text-ink text-pretty">
                  {ru ? 'Медицинский вопрос' : en ? 'A medical question' : 'O întrebare medicală'}
                </span>
                <span className="shrink-0 text-[13px] font-medium uppercase tracking-[0.06em] text-sage-text">
                  {ru ? 'Спросить врача · ~1ч' : en ? 'Ask the doctor · ~1h' : 'Întreabă medicul · ~1h'}{' '}
                  <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* 5 · CTA — see services (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Готовы <span className="serif-it text-[var(--sage-soft)]">начать?</span>
                  </>
                ) : en ? (
                  <>
                    Ready to <span className="serif-it text-[var(--sage-soft)]">start?</span>
                  </>
                ) : (
                  <>
                    Gata să <span className="serif-it text-[var(--sage-soft)]">începi?</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/services" className={creamPill}>
                  {ru ? 'Посмотреть услуги' : en ? 'See the services' : 'Vezi serviciile'}
                </Link>
                <Link href="/quick-question" className={creamUnderline}>
                  {ru ? 'Или задайте экспресс-вопрос · ~1ч →' : en ? 'Or ask an express question · ~1h →' : 'Sau o întrebare EXPRESS · ~1h →'}
                </Link>
              </div>
            </div>
            <p className="max-w-[28ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {ru
                ? 'Пять услуг в двух форматах — выберите подходящий.'
                : en
                  ? 'Five services in two formats — pick the one that fits.'
                  : 'Cinci servicii în două formate — alege-l pe cel potrivit.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
