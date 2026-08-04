import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { creamPill, creamUnderline } from '@/components/ui/cta';
import { LegalDraftNotice } from '@/components/ui/LegalDraftNotice';
import { LEGAL_ENTITY, LEGAL_UPDATED } from '@/lib/legal-entity';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Privacy Policy / Politica de confidențialitate (/<locale>/gdpr).
   Two-layer, plain-language privacy page for a pediatrics & nutrition practice.
   Structure: hero + operator meta · "Pe scurt" TL;DR · sticky table-of-contents
   + readable legal sections · special-category (health) and children's-data
   callouts · contact CTA. Bilingual RO (default) · EN, matching the site's
   cream/sage/ink serif editorial system. Accessible: native landmarks, anchor
   ToC, AA contrast, no color-only meaning.

   ⚠ LEGAL: This is a business-specific draft, NOT a finished policy or legal
   advice. A qualified data-protection lawyer MUST review the final text —
   especially health data (special category) and children's data — and confirm
   the placeholders in META below (operator legal entity, data-contact mailbox,
   retention periods, full processor list, cross-border transfer safeguards,
   whether EU GDPR applies for diaspora users). Framework: Legea 133/2011 today,
   Legea 195/2024 (GDPR-aligned) from 23 Aug 2026; supervisory authority CNPDCP.
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Identity and dates come from `lib/legal-entity.ts` — the single place both
 * legal pages read, so they cannot drift apart, and the one edit that has to
 * happen when the client finally sends her entity data.
 */
const META = {
  operator: LEGAL_ENTITY.displayName,
  email: LEGAL_ENTITY.email,
  updatedRo: LEGAL_UPDATED.ro,
  updatedEn: LEGAL_UPDATED.en,
  updatedRu: LEGAL_UPDATED.ru,
};

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
      ? 'Политика конфиденциальности | Dr. Olesea Jalba'
      : en
      ? 'Privacy Policy | Dr. Olesea Jalba'
      : 'Politica de confidențialitate | Dr. Olesea Jalba',
    description: ru
      ? 'Как мы собираем, используем и защищаем ваши данные — в том числе данные о здоровье и о вашем ребёнке — и какие права у вас есть.'
      : en
      ? 'How we collect, use, and protect your data — including health data and data about your child — and the rights you have.'
      : 'Cum colectăm, folosim și protejăm datele tale, inclusiv datele despre sănătate și despre copil, și drepturile pe care le ai.',
  };
}

interface TocItem {
  id: string;
  ro: string;
  en: string;
  ru: string;
}

const TOC: TocItem[] = [
  { id: 'pe-scurt', ro: 'Pe scurt', en: 'In short', ru: 'Кратко' },
  { id: 'date', ro: 'Ce date colectăm', en: 'What we collect', ru: 'Какие данные мы собираем' },
  { id: 'temei', ro: 'Temeiul prelucrării', en: 'Why & legal basis', ru: 'Цели и правовое основание' },
  { id: 'transfer', ro: 'Cui transmitem datele', en: 'Who we share with', ru: 'Кому мы передаём данные' },
  { id: 'pastrare', ro: 'Cât timp păstrăm', en: 'How long we keep it', ru: 'Сколько мы храним данные' },
  { id: 'drepturi', ro: 'Drepturile tale', en: 'Your rights', ru: 'Ваши права' },
  { id: 'copii', ro: 'Datele copiilor', en: 'Children’s data', ru: 'Данные детей' },
  { id: 'securitate', ro: 'Securitate', en: 'Security', ru: 'Безопасность' },
  { id: 'cookies', ro: 'Cookie-uri', en: 'Cookies', ru: 'Файлы cookie' },
  { id: 'modificari', ro: 'Modificări', en: 'Changes', ru: 'Изменения' },
  { id: 'contact', ro: 'Contact', en: 'Contact', ru: 'Контакты' },
];

type Bi = { ro: string; en: string; ru: string };

/** Cookie categories, mirroring `components/analytics/CookieConsent.tsx`.
 *  Maintained by hand — a self-hosted CMP does no scanning. */
const COOKIE_CATEGORIES = [
  {
    id: 'necessary',
    titleRo: 'Strict necesare',
    titleEn: 'Strictly necessary',
    titleRu: 'Строго необходимые',
    descRo:
      'Fac site-ul utilizabil: rețin limba aleasă și opțiunea ta privind cookie-urile. Se folosesc mereu, fără acord — fără ele site-ul nu funcționează.',
    descEn:
      'Make the site usable: they remember your chosen language and your cookie choice. They are always used, without consent — the site cannot work without them.',
    descRu:
      'Обеспечивают работу сайта: запоминают выбранный язык и ваш выбор по cookie. Используются всегда, без согласия — без них сайт не работает.',
    names: 'olesea_consent · NEXT_LOCALE',
  },
  {
    id: 'analytics',
    titleRo: 'Statistică',
    titleEn: 'Statistics',
    titleRu: 'Статистика',
    descRo:
      'Google Analytics 4, prin Google Tag Manager: ne arată anonim ce pagini sunt citite și de unde vin vizitatorii. Se încarcă doar dacă accepți categoria.',
    descEn:
      'Google Analytics 4, via Google Tag Manager: shows us anonymously which pages are read and where visitors come from. Loaded only if you accept this category.',
    descRu:
      'Google Analytics 4 через Google Tag Manager: анонимно показывает, какие страницы читают и откуда приходят посетители. Загружается только при вашем согласии.',
    names: '_ga · _ga_* · _gid',
  },
  {
    id: 'marketing',
    titleRo: 'Marketing',
    titleEn: 'Marketing',
    titleRu: 'Маркетинг',
    descRo:
      'Meta Pixel: măsoară eficiența campaniilor și permite afișarea de anunțuri relevante. Se încarcă doar dacă accepți categoria.',
    descEn:
      'Meta Pixel: measures campaign performance and allows relevant ads to be shown. Loaded only if you accept this category.',
    descRu:
      'Meta Pixel: измеряет эффективность кампаний и позволяет показывать релевантную рекламу. Загружается только при вашем согласии.',
    names: '_fbp · fr',
  },
];

const SUMMARY: Bi[] = [
  {
    ro: 'Colectăm doar datele necesare pentru a-ți oferi consultații și a răspunde întrebărilor tale.',
    en: 'We collect only the data needed to offer consultations and answer your questions.',
    ru: 'Мы собираем только данные, которые нужны, чтобы провести консультацию и ответить на ваши вопросы.',
  },
  {
    ro: 'Unele date sunt despre sănătate și despre copilul tău — le tratăm cu grijă deosebită.',
    en: 'Some data is about health and about your child — we treat it with special care.',
    ru: 'Часть данных относится к здоровью и к вашему ребёнку — с ними мы обращаемся с особой осторожностью.',
  },
  {
    ro: 'Nu vindem datele tale și nu le folosim pentru marketingul terților.',
    en: 'We don’t sell your data or use it for third-party marketing.',
    ru: 'Мы не продаём ваши данные и не используем их для маркетинга третьих лиц.',
  },
  {
    ro: 'Ai dreptul să le accesezi, corectezi sau ștergi oricând.',
    en: 'You can access, correct, or delete it at any time.',
    ru: 'Вы вправе в любой момент получить к ним доступ, исправить или удалить их.',
  },
  {
    ro: 'Pentru orice întrebare despre date, ne poți scrie la ' + META.email + '.',
    en: 'For any question about your data, write to us at ' + META.email + '.',
    ru: 'По любым вопросам о ваших данных вы можете написать нам на ' + META.email + '.',
  },
];

const DATA: { term: Bi; desc: Bi }[] = [
  {
    term: {
      ro: 'Date de identificare și contact',
      en: 'Identity & contact data',
      ru: 'Идентификационные и контактные данные',
    },
    desc: {
      ro: 'nume, e-mail, telefon — la programare, prin formularul de contact sau la „Întreabă medicul”.',
      en: 'name, email, phone — when booking, via the contact form, or through “Ask the doctor”.',
      ru: 'имя, e-mail, телефон — при записи, через форму обратной связи или в разделе «Спросить врача».',
    },
  },
  {
    term: { ro: 'Date despre sănătate', en: 'Health data', ru: 'Данные о здоровье' },
    desc: {
      ro: 'simptome, istoric, documente sau poze încărcate, conținutul consultațiilor și datele de monitorizare.',
      en: 'symptoms, history, uploaded documents or photos, the content of consultations, and monitoring data.',
      ru: 'симптомы, анамнез, загруженные документы или фотографии, содержание консультаций и данные мониторинга.',
    },
  },
  {
    term: { ro: 'Date despre copil', en: 'Data about your child', ru: 'Данные о вашем ребёнке' },
    desc: {
      ro: 'furnizate de părinte sau de reprezentantul legal.',
      en: 'provided by the parent or legal guardian.',
      ru: 'предоставленные родителем или законным представителем.',
    },
  },
  {
    term: { ro: 'Date de programare', en: 'Booking data', ru: 'Данные о записи' },
    desc: {
      ro: 'gestionate prin Calendly, la rezervarea unei consultații video.',
      en: 'handled through Calendly when you book a video consultation.',
      ru: 'обрабатываемые через Calendly при записи на видеоконсультацию.',
    },
  },
  {
    term: { ro: 'Date de plată', en: 'Payment data', ru: 'Платёжные данные' },
    desc: {
      ro: 'nume și detaliile transferului bancar. Nu colectăm date de card — nu există plată online.',
      en: 'name and bank-transfer details. We don’t collect card data — there is no online payment.',
      ru: 'имя и реквизиты банковского перевода. Мы не собираем данные карт — онлайн-оплаты нет.',
    },
  },
  {
    term: { ro: 'Date tehnice', en: 'Technical data', ru: 'Технические данные' },
    desc: {
      ro: 'cookie-uri, adresă IP și statistici de utilizare a site-ului.',
      en: 'cookies, IP address, and site-usage statistics.',
      ru: 'файлы cookie, IP-адрес и статистика использования сайта.',
    },
  },
];

const BASIS: Bi[] = [
  {
    ro: 'Pentru a-ți presta serviciul — programări, consultații și răspunsuri (executarea contractului).',
    en: 'To deliver the service — bookings, consultations, and answers (performance of the contract).',
    ru: 'Для оказания услуги — записи, консультации и ответы (исполнение договора).',
  },
  {
    ro: 'Pentru datele despre sănătate — pe baza consimțământului tău explicit și a prestării de servicii de sănătate.',
    en: 'For health data — based on your explicit consent and the provision of healthcare services.',
    ru: 'Для данных о здоровье — на основании вашего явного согласия и оказания медицинских услуг.',
  },
  {
    ro: 'Pentru obligații legale — păstrarea documentației medicale impusă de lege.',
    en: 'For legal obligations — keeping medical records as required by law.',
    ru: 'Для исполнения юридических обязанностей — хранение медицинской документации, требуемое законом.',
  },
  {
    ro: 'Pe baza consimțământului — pentru newsletter sau ghiduri, dacă te abonezi.',
    en: 'Based on consent — for newsletter or guides, if you subscribe.',
    ru: 'На основании согласия — для рассылки или гайдов, если вы подпишетесь.',
  },
];

const SHARE: Bi[] = [
  {
    ro: 'Calendly — pentru programări (poate implica transferul datelor în afara Moldovei).',
    en: 'Calendly — for bookings (may involve transferring data outside Moldova).',
    ru: 'Calendly — для записей (может включать передачу данных за пределы Молдовы).',
  },
  {
    ro: 'Furnizorul de găzduire — pentru a rula site-ul.',
    en: 'Our hosting provider — to run the website.',
    ru: 'Хостинг-провайдер — для работы сайта.',
  },
  {
    ro: 'Furnizorul de e-mail — pentru confirmări și corespondență.',
    en: 'Our email provider — for confirmations and correspondence.',
    ru: 'Поставщик электронной почты — для подтверждений и переписки.',
  },
  {
    ro: 'Banca — pentru plata prin transfer.',
    en: 'The bank — for payment by transfer.',
    ru: 'Банк — для оплаты переводом.',
  },
];

const RIGHTS: { term: Bi; desc: Bi }[] = [
  {
    term: { ro: 'Acces', en: 'Access', ru: 'Доступ' },
    desc: {
      ro: 'să afli ce date avem despre tine',
      en: 'find out what data we hold about you',
      ru: 'узнать, какие данные о вас у нас есть',
    },
  },
  {
    term: { ro: 'Rectificare', en: 'Rectification', ru: 'Исправление' },
    desc: {
      ro: 'să corectezi date inexacte',
      en: 'correct inaccurate data',
      ru: 'исправить неточные данные',
    },
  },
  {
    term: { ro: 'Ștergere', en: 'Erasure', ru: 'Удаление' },
    desc: {
      ro: 'să ceri ștergerea datelor',
      en: 'request deletion of your data',
      ru: 'запросить удаление ваших данных',
    },
  },
  {
    term: { ro: 'Restricționare', en: 'Restriction', ru: 'Ограничение обработки' },
    desc: {
      ro: 'să limitezi prelucrarea',
      en: 'limit how we process it',
      ru: 'ограничить обработку данных',
    },
  },
  {
    term: { ro: 'Portabilitate', en: 'Portability', ru: 'Переносимость' },
    desc: {
      ro: 'să primești datele într-un format uzual',
      en: 'receive your data in a common format',
      ru: 'получить ваши данные в общепринятом формате',
    },
  },
  {
    term: { ro: 'Opoziție', en: 'Objection', ru: 'Возражение' },
    desc: {
      ro: 'să te opui anumitor prelucrări',
      en: 'object to certain processing',
      ru: 'возражать против определённой обработки',
    },
  },
  {
    term: { ro: 'Retragerea consimțământului', en: 'Withdraw consent', ru: 'Отзыв согласия' },
    desc: {
      ro: 'oricând, fără a afecta prelucrarea anterioară',
      en: 'at any time, without affecting prior processing',
      ru: 'в любой момент, не затрагивая обработку, проведённую ранее',
    },
  },
];


function Dot() {
  return (
    <span
      className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-sage"
      aria-hidden="true"
    />
  );
}

export default async function GdprPage({
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
      <LegalDraftNotice locale={locale} />
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Конфиденциальность' : en ? 'Privacy' : 'Confidențialitate' },
        ]}
      />
      {/* 1 · Hero — title + operator meta */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Конфиденциальность' : en ? 'Privacy' : 'Confidențialitate'}
          </p>
          <div className="grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 lg:gap-20">
            <h1 className="serif max-w-[15ch] text-[clamp(2.5rem,5.6vw,5rem)] leading-[1.04] tracking-[-0.015em] text-balance">
              {ru ? (
                <>
                  Ваша <span className="serif-it text-sage">конфиденциальность</span>
                </>
              ) : en ? (
                <>
                  Your <span className="serif-it text-sage">privacy</span>
                </>
              ) : (
                <>
                  <span className="serif-it text-sage">Confidențialitatea</span> ta
                </>
              )}
            </h1>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="max-w-[46ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {ru
                  ? 'Как мы собираем, используем и защищаем ваши данные — включая данные о здоровье и данные о вашем ребёнке.'
                  : en
                  ? 'How we collect, use, and protect your data — including health data and data about your child.'
                  : 'Cum colectăm, folosim și protejăm datele tale — inclusiv datele despre sănătate și despre copilul tău.'}
              </p>
              <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[0.9375rem]">
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {ru ? 'Оператор' : en ? 'Operator' : 'Operator'}
                </dt>
                <dd className="text-ink">
                  {LEGAL_ENTITY.registeredName || META.operator}
                </dd>
                {LEGAL_ENTITY.idno && (
                  <>
                    <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                      IDNO
                    </dt>
                    <dd className="text-ink">{LEGAL_ENTITY.idno}</dd>
                  </>
                )}
                {LEGAL_ENTITY.address && (
                  <>
                    <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                      {ru ? 'Адрес' : en ? 'Address' : 'Adresă'}
                    </dt>
                    <dd className="text-ink">{LEGAL_ENTITY.address}</dd>
                  </>
                )}
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {ru ? 'Обновлено' : en ? 'Updated' : 'Actualizat'}
                </dt>
                <dd className="text-ink">{ru ? META.updatedRu : en ? META.updatedEn : META.updatedRo}</dd>
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {ru ? 'Контакты' : en ? 'Contact' : 'Contact'}
                </dt>
                <dd>
                  <a
                    href={`mailto:${META.email}`}
                    className="text-sage-text underline decoration-[var(--sage-soft)] underline-offset-4 transition-colors hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                  >
                    {META.email}
                  </a>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · TL;DR — plain-language summary */}
      <section id="pe-scurt" className="scroll-mt-24 border-b border-[var(--rule)] bg-paper">
        <div className="shell grid gap-8 py-16 md:grid-cols-[240px_1fr] md:gap-16 md:py-20">
          <h2 className="serif text-[clamp(1.9rem,3.4vw,2.7rem)] leading-tight tracking-[-0.02em] text-balance">
            {ru ? 'Кратко' : en ? 'In short' : 'Pe scurt'}
          </h2>
          <ul className="grid max-w-[60ch] gap-4">
            {SUMMARY.map((s) => (
              <li key={s.en} className="flex gap-3.5">
                <Dot />
                <span className="text-[1.0625rem] leading-relaxed text-ink text-pretty">
                  {lc(s)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 · Table of contents (sticky) + sections */}
      <section className="shell grid gap-12 py-16 md:grid-cols-[240px_1fr] md:gap-16 md:py-24 lg:gap-24">
        <nav
          aria-label={ru ? 'Разделы' : en ? 'Sections' : 'Secțiuni'}
          className="min-w-0 md:sticky md:top-[133px] md:self-start"
        >
          <p className="eyebrow mb-4">{ru ? 'Содержание' : en ? 'Contents' : 'Cuprins'}</p>
          <ul className="flex flex-wrap gap-2 md:flex-col md:flex-nowrap md:gap-1">
            {TOC.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="mono inline-block whitespace-nowrap rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:rounded-none md:border-0 md:border-l md:px-3 md:py-1.5 md:text-[12px] md:normal-case md:tracking-normal"
                >
                  {ru ? item.ru : en ? item.en : item.ro}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          {/* Ce date colectăm */}
          <Section
            id="date"
            title={ru ? 'Какие данные мы собираем' : en ? 'What we collect' : 'Ce date colectăm'}
          >
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'В зависимости от того, как вы с нами взаимодействуете, мы можем собирать:'
                : en
                ? 'Depending on how you interact with us, we may collect:'
                : 'În funcție de cum interacționezi cu noi, putem colecta:'}
            </p>
            <ul className="mt-6 grid gap-4">
              {DATA.map((d) => (
                <li key={d.term.en} className="flex gap-3.5">
                  <Dot />
                  <p className="max-w-[64ch] text-[1.0625rem] leading-relaxed text-pretty">
                    <span className="text-ink">{lc(d.term)}</span>
                    <span className="text-ink-soft"> — {lc(d.desc)}</span>
                  </p>
                </li>
              ))}
            </ul>
            <Callout
              label={
                ru
                  ? 'Особая категория данных'
                  : en
                  ? 'Special category'
                  : 'Categorie specială de date'
              }
            >
              {ru
                ? 'Данные о здоровье и данные детей относятся к особым категориям персональных данных и подлежат дополнительной защите. Мы обрабатываем их только на основании вашего явного согласия и для оказания медицинских услуг.'
                : en
                ? 'Health data and children’s data are special categories with extra protection. We process them only on the basis of your explicit consent and to provide healthcare services.'
                : 'Datele despre sănătate și datele copiilor sunt categorii speciale, protejate suplimentar. Le prelucrăm doar pe baza consimțământului tău explicit și pentru a-ți oferi servicii de sănătate.'}
            </Callout>
          </Section>

          {/* Temeiul prelucrării */}
          <Section
            id="temei"
            title={
              ru
                ? 'Зачем мы обрабатываем данные и на каком основании'
                : en
                ? 'Why we process data & on what basis'
                : 'De ce prelucrăm datele și pe ce temei'
            }
          >
            <ul className="mt-6 grid gap-4">
              {BASIS.map((b) => (
                <li key={b.en} className="flex gap-3.5">
                  <Dot />
                  <span className="max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
                    {lc(b)}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Cui transmitem datele */}
          <Section
            id="transfer"
            title={ru ? 'Кому мы передаём данные' : en ? 'Who we share data with' : 'Cui transmitem datele'}
          >
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Мы работаем с подрядчиками, которые помогают нам оказывать услугу:'
                : en
                ? 'We work with providers who help us deliver the service:'
                : 'Lucrăm cu furnizori care ne ajută să oferim serviciul:'}
            </p>
            <ul className="mt-6 grid gap-4">
              {SHARE.map((s) => (
                <li key={s.en} className="flex gap-3.5">
                  <Dot />
                  <span className="max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
                    {lc(s)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
              {ru
                ? 'Мы не продаём ваши данные и не передаём их для маркетинга третьих лиц. Иногда данные могут передаваться за пределы Молдовы; в таких случаях мы применяем меры защиты, предусмотренные законом.'
                : en
                ? 'We don’t sell your data and don’t pass it on for third parties’ marketing. Some transfers may take place outside Moldova; where they do, we apply the safeguards required by law.'
                : 'Nu vindem datele tale și nu le transmitem în scopuri de marketing ale terților. Unele transferuri pot avea loc în afara Moldovei; atunci aplicăm garanțiile cerute de lege.'}
            </p>
          </Section>

          {/* Cât timp păstrăm */}
          <Section
            id="pastrare"
            title={ru ? 'Сколько мы храним данные' : en ? 'How long we keep it' : 'Cât timp păstrăm datele'}
          >
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Мы храним ваши данные только столько, сколько нужно для целей, описанных здесь, и в течение сроков, установленных законом для медицинской документации. После этого мы удаляем или обезличиваем их.'
                : en
                ? 'We keep your data only as long as needed for the purposes described here and for the periods required by law for medical records. After that, we delete or anonymise it.'
                : 'Păstrăm datele doar atât timp cât este necesar pentru scopurile descrise aici și pentru termenele impuse de lege în cazul documentației medicale. După aceea, le ștergem sau le anonimizăm.'}
            </p>
            {/* Documents a patient sends through the pre-consultation upload
                link (§11.14). Stated separately because it is the one category
                with an automatic deletion date rather than a legal maximum. */}
            <p className="mt-4 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Анализы и документы, присланные по персональной ссылке перед консультацией, хранятся отдельно, недоступны публично и удаляются автоматически по истечении срока хранения. Сама ссылка перестаёт работать раньше — примерно через месяц. Вы можете удалить любой файл сами, пока ссылка активна, или попросить нас об этом в любой момент.'
                : en
                ? 'Analyses and documents sent through the personal pre-consultation link are stored separately, are never publicly reachable, and are deleted automatically once the retention period ends. The link itself stops working sooner — about a month after it is issued. You can delete any file yourself while the link is active, or ask us to at any time.'
                : 'Analizele și documentele trimise prin linkul personal dinaintea consultației sunt stocate separat, nu sunt accesibile public și se șterg automat la finalul perioadei de păstrare. Linkul în sine expiră mai devreme — la aproximativ o lună de la emitere. Poți șterge singur orice fișier cât timp linkul este activ sau ne poți cere oricând acest lucru.'}
            </p>
          </Section>

          {/* Drepturile tale */}
          <Section id="drepturi" title={ru ? 'Ваши права' : en ? 'Your rights' : 'Drepturile tale'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru ? 'Вы имеете право на:' : en ? 'You have the right to:' : 'Ai dreptul la:'}
            </p>
            <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {RIGHTS.map((r) => (
                <div key={r.term.en} className="border-t border-[var(--rule)] pt-3">
                  <dt className="serif text-[1.2rem] leading-snug text-ink">
                    {lc(r.term)}
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft text-pretty">
                    {lc(r.desc)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Вы также вправе подать жалобу в Национальный центр по защите персональных данных (CNPDCP).'
                : en
                ? 'You can also lodge a complaint with the National Centre for Personal Data Protection (CNPDCP).'
                : 'Poți depune o plângere la Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP).'}
            </p>
            <p className="mt-4 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
              {ru
                ? 'Чтобы реализовать свои права, напишите нам на '
                : en
                ? 'To exercise your rights, write to us at '
                : 'Pentru a-ți exercita drepturile, scrie-ne la '}
              <a
                href={`mailto:${META.email}`}
                className="text-sage-text underline decoration-[var(--sage-soft)] underline-offset-4 transition-colors hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                {META.email}
              </a>
              {ru ? ' или через страницу ' : en ? ' or via the ' : ' sau prin pagina de '}
              <Link
                href="/contact"
                className="text-sage-text underline decoration-[var(--sage-soft)] underline-offset-4 transition-colors hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                {ru ? 'Контакты' : en ? 'Contact page' : 'Contact'}
              </Link>
              .
            </p>
          </Section>

          {/* Datele copiilor — emphasised */}
          <Section id="copii" title={ru ? 'Данные детей' : en ? 'Children’s data' : 'Datele copiilor'}>
            <div className="mt-6 rounded-2xl border border-[var(--rule)] bg-paper p-6 md:p-8">
              <p className="mono mb-3 text-[11px] uppercase tracking-[0.12em] text-sage-text">
                {ru
                  ? 'Обрабатываются с особой осторожностью'
                  : en
                  ? 'Handled with special care'
                  : 'Tratate cu grijă deosebită'}
              </p>
              <p className="max-w-[64ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
                {ru
                  ? 'Наши услуги нередко касаются детей. Данные о ребёнке передаёт родитель или законный представитель, подтверждая, что вправе это сделать. Мы используем эти данные только для консультации и дальнейшего наблюдения.'
                  : en
                  ? 'Our services often concern children. Data about a child is provided by the parent or legal guardian, who confirms they have the right to provide it. We use this data only for the consultation and ongoing care.'
                  : 'Serviciile noastre privesc adesea copii. Datele despre un copil sunt furnizate de părinte sau de reprezentantul legal, care confirmă că are dreptul să le ofere. Folosim aceste date doar pentru consultație și îngrijire.'}
              </p>
            </div>
          </Section>

          {/* Securitate */}
          <Section
            id="securitate"
            title={ru ? 'Безопасность данных' : en ? 'Data security' : 'Securitatea datelor'}
          >
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Мы применяем технические и организационные меры для защиты ваших данных: ограниченный доступ, безопасное хранение и шифрованную передачу. Ни одна система не идеальна, но защиту данных мы рассматриваем как приоритет.'
                : en
                ? 'We apply technical and organisational measures to protect your data: restricted access, secure storage, and encrypted transmission. No system is perfect, but we treat data protection as a priority.'
                : 'Aplicăm măsuri tehnice și organizatorice pentru a-ți proteja datele: acces restricționat, stocare securizată și transmitere criptată. Niciun sistem nu este perfect, dar tratăm protecția datelor ca pe o prioritate.'}
            </p>
          </Section>

          {/* Cookie-uri */}
          <Section id="cookies" title={ru ? 'Файлы cookie' : en ? 'Cookies' : 'Cookie-uri'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Мы используем файлы cookie для работы сайта и, с вашего согласия, для статистики использования. Вы можете управлять своими настройками в любое время.'
                : en
                ? 'We use cookies for the site to function and, if you accept, for usage statistics. You can manage your preferences at any time.'
                : 'Folosim cookie-uri pentru funcționarea site-ului și, dacă accepți, pentru statistici de utilizare. Îți poți gestiona preferințele în orice moment.'}
            </p>

            {/* Category-by-category detail. Written by hand — the consent banner
                is self-hosted (CookieConsent v3), so nothing scans the site and
                fills this in for us. Keep it in step with the categories in
                `components/analytics/CookieConsent.tsx`; the analytics and
                marketing rows only ever apply once the client's tracker IDs are
                configured, and nothing loads without consent. */}
            <dl className="mt-8 grid max-w-[68ch] gap-6">
              {COOKIE_CATEGORIES.map((c) => (
                <div key={c.id} className="border-t border-[var(--rule)] pt-5">
                  <dt className="text-[1.0625rem] font-semibold text-ink">
                    {ru ? c.titleRu : en ? c.titleEn : c.titleRo}
                  </dt>
                  <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft text-pretty">
                    {ru ? c.descRu : en ? c.descEn : c.descRo}
                    <span className="mono mt-2 block text-[0.8125rem] text-sage-text">
                      {c.names}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 max-w-[68ch] text-[0.9375rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Изменить или отозвать согласие можно в любой момент — ссылка «Настройки cookie» есть в подвале каждой страницы. Видео из телеэфиров на странице «СМИ» загружаются с YouTube и Facebook только после того, как вы нажмёте play: до этого запросы к ним не отправляются.'
                : en
                ? 'You can change or withdraw your consent at any time — the “Cookie settings” link sits in the footer of every page. The TV clips on the media page load from YouTube and Facebook only after you press play; until then those providers are never contacted.'
                : 'Îți poți schimba sau retrage acordul oricând — linkul „Setări cookie” se află în subsolul fiecărei pagini. Materialele TV de pe pagina de media se încarcă de pe YouTube și Facebook doar după ce apeși play; până atunci acești furnizori nu sunt contactați.'}
            </p>
          </Section>

          {/* Modificări */}
          <Section id="modificari" title={ru ? 'Изменения' : en ? 'Changes' : 'Modificări'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Мы можем обновлять настоящую политику. Дата последнего обновления указана в верхней части страницы.'
                : en
                ? 'We may update this policy. The date of the latest update is shown at the top of the page.'
                : 'Putem actualiza această politică. Data ultimei actualizări este afișată în partea de sus a paginii.'}
            </p>
          </Section>

          {/* Contact */}
          <Section id="contact" title={ru ? 'Контакты' : en ? 'Contact' : 'Contact'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
              {ru
                ? 'По любым вопросам о ваших данных или для реализации своих прав напишите нам на '
                : en
                ? 'For any question about your data, or to exercise your rights, write to us at '
                : 'Pentru orice întrebare despre datele tale sau pentru a-ți exercita drepturile, scrie-ne la '}
              <a
                href={`mailto:${META.email}`}
                className="text-sage-text underline decoration-[var(--sage-soft)] underline-offset-4 transition-colors hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                {META.email}
              </a>
              .
            </p>
          </Section>
        </div>
      </section>

      {/* 4 · CTA — questions about your data (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[34rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.04] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Вопрос о <span className="serif-it text-[var(--sage-soft)]">ваших данных?</span>
                  </>
                ) : en ? (
                  <>
                    A question about <span className="serif-it text-[var(--sage-soft)]">your data?</span>
                  </>
                ) : (
                  <>
                    O întrebare despre <span className="serif-it text-[var(--sage-soft)]">datele tale?</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/contact" className={creamPill}>
                  {ru ? 'Напишите нам' : en ? 'Contact us' : 'Scrie-ne'}
                </Link>
                <a href={`mailto:${META.email}`} className={creamUnderline}>
                  {META.email} →
                </a>
              </div>
            </div>
            <p className="max-w-[28ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {ru
                ? 'Мы отвечаем на запросы по данным так быстро, как можем, в соответствии с законом.'
                : en
                ? 'We answer data requests as soon as we can, in line with the law.'
                : 'Răspundem solicitărilor privind datele cât de repede putem, conform legii.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-[var(--rule)] pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-14"
    >
      <Reveal>
        <h2 className="serif text-[clamp(1.7rem,3vw,2.4rem)] leading-tight tracking-[-0.02em] text-balance">
          {title}
        </h2>
        {children}
      </Reveal>
    </section>
  );
}

function Callout({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-[var(--rule)] bg-paper p-6 md:p-8">
      <p className="mono mb-3 text-[11px] uppercase tracking-[0.12em] text-sage-text">
        {label}
      </p>
      <p className="max-w-[64ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
        {children}
      </p>
    </div>
  );
}
