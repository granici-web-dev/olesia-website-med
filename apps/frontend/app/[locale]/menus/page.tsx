import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import {
  MenuLibrary,
  type MenuItem,
  type MenuSegment,
} from '@/components/sections/MenuLibrary';
import {
  PLACEHOLDER_MENUS as MENUS,
  MENU_SEGMENTS as SEGMENTS,
  type Bi,
} from '@/lib/placeholder-menus';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Meniuri săptămânale — a content hub of weekly menu ideas. Top of funnel for
   nutrition → a soft hand-off into the nutrition consultation. Two specifics:
   (1) age segmentation is the core IA — the grid is filtered by age group;
   (2) the generic-vs-personalized boundary is explicit — these are inspiration
   (meal ideas, no grams or calories), and infants are routed to a consultation
   rather than a generic menu. Free model. Content is local bilingual data for
   now (→ CMS later) and degrades to an empty state. Visual language mirrors the
   service pages. Bilingual (RO default · EN).
   ⚠ Menu detail pages aren't built yet — `href`s are placeholders.
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
      ? 'Недельные меню для детей и семьи | Dr. Olesea Jalba'
      : en
        ? 'Weekly menus for children & family | Dr. Olesea Jalba'
        : 'Meniuri săptămânale pentru copii și familie | Dr. Olesea Jalba',
    description: ru
      ? 'Идеи сбалансированных недельных меню по возрастным группам, подготовленные педиатром со специализацией в нутрициологии.'
      : en
        ? 'Balanced weekly menu ideas by age group, prepared by a pediatrician specialized in nutrition.'
        : 'Idei de meniuri echilibrate pentru o săptămână, pe grupe de vârstă, pregătite de un medic pediatru cu specializare în nutriție.',
  };
}

/* Segments + menus now live in lib/placeholder-menus.ts — the single source
   shared with the menu detail page, so listing links never 404. */

const btnDark =
  'inline-flex cursor-pointer items-center bg-ink px-[22px] py-[14px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';
const underlineLg =
  'inline-block cursor-pointer border-b border-ink pb-1 text-sm text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';
const creamPill =
  'inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-soft)]';
const creamUnderline =
  'inline-block cursor-pointer border-b border-[var(--sage-soft)] pb-0.5 text-sm text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage-soft)]';

export default async function MenusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  const ageLabel = (key: string) => {
    const s = SEGMENTS.find((x) => x.key === key);
    return s ? lc(s) : key;
  };
  const meta = (days: number) =>
    `${days} ${ru ? 'дн.' : en ? 'days' : 'zile'} · ${ru ? 'Смотреть на странице' : en ? 'View on page' : 'Vezi pe pagină'} · RO`;
  // ⚠ Placeholder detail route — menu detail pages aren't built yet.
  const menuHref = (slug: string) => `/${locale}/menus/${slug}`;

  const items: MenuItem[] = MENUS.map((m) => ({
    slug: m.slug,
    ageKey: m.age,
    ageLabel: ageLabel(m.age),
    title: lc(m.title),
    description: lc(m.description),
    meta: meta(m.days),
    href: menuHref(m.slug),
  }));

  const segments: MenuSegment[] = SEGMENTS.map((s) => ({ key: s.key, label: lc(s) }));
  const featured = MENUS.find((m) => m.featured) ?? MENUS[0];

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Недельные меню' : en ? 'Weekly menus' : 'Meniuri săptămânale' },
        ]}
      />
      {/* 1 · Hero — editorial split: statement left, featured menu right */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Меню' : en ? 'Menus' : 'Meniuri'}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.03] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    Недельные <span className="serif-it text-sage">меню</span>
                  </>
                ) : en ? (
                  <>
                    Weekly <span className="serif-it text-sage">menus</span>
                  </>
                ) : (
                  <>
                    Meniuri <span className="serif-it text-sage">săptămânale</span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[46ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {ru
                  ? 'Практичные идеи меню для детей и семьи от педиатра со специализацией в нутрициологии — вдохновение на целую неделю.'
                  : en
                    ? 'Practical menu ideas for children and family, by a pediatrician specialized in nutrition — inspiration for a whole week.'
                    : 'Idei practice de meniuri pentru copii și familie, pregătite de un medic pediatru cu specializare în nutriție — inspirație pentru o săptămână întreagă.'}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a href="#library" className={btnDark}>
                  {ru ? 'Смотреть меню' : en ? 'Browse the menus' : 'Vezi meniurile'}
                </a>
                <span className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-sage-text">
                  {ru ? 'Бесплатно · Вдохновение, а не план' : en ? 'Free · Inspiration, not a plan' : 'Gratuit · Inspirație, nu un plan'}
                </span>
              </div>
            </div>

            {/* Featured menu */}
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="eyebrow mb-5">{ru ? 'Рекомендуем' : en ? 'Featured' : 'Recomandat'}</p>
              <article className="flex flex-col border border-[var(--rule)] bg-paper">
                <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-cream-2 text-sage">
                  <span className="mono absolute left-4 top-4 rounded-full border border-[var(--rule)] bg-paper/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-sage-text">
                    {ageLabel(featured.age)}
                  </span>
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden="true">
                    <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M3.5 9.5h17M8 3.5V6m8-2.5V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M7 13h2m3 0h2m3 0h0M7 16.5h2m3 0h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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
                    {meta(featured.days)}
                  </p>
                  <a
                    href={menuHref(featured.slug)}
                    className="mt-6 inline-flex cursor-pointer items-center gap-2 border-b border-ink pb-1 text-[13px] font-medium uppercase tracking-[0.04em] text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
                  >
                    {ru ? 'Смотреть меню' : en ? 'View menu' : 'Vezi meniul'}
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Library — age-segment filter + grid (or empty state) */}
      <section id="library" className="scroll-mt-24 shell py-20 md:py-28">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Выберите по возрасту' : en ? 'Choose by age' : 'Alege în funcție de vârstă'}</p>
            <h2 className="serif text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.0] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Меню <span className="serif-it text-sage">недели</span>
                </>
              ) : en ? (
                <>
                  This week’s <span className="serif-it text-sage">menus</span>
                </>
              ) : (
                <>
                  Meniurile <span className="serif-it text-sage">săptămânii</span>
                </>
              )}
            </h2>
          </div>
          <p className="max-w-[340px] text-sm leading-[1.7] text-ink-soft">
            {ru
              ? 'Выберите возрастную группу. Только идеи — для граммов и порций нужна консультация.'
              : en
                ? 'Pick an age group. Ideas only — for grams and portions, see a consultation.'
                : 'Alege o grupă de vârstă. Doar idei — pentru gramaje și porții, vezi o consultație.'}
          </p>
        </header>

        {/* Infants → consultation, never a generic menu */}
        <div className="mb-10 max-w-[80ch] border border-[var(--rule)] bg-paper p-5 md:p-6">
          <p className="mono mb-2 text-[10px] uppercase tracking-[0.16em] text-sage-text">
            {ru ? 'Для грудничков' : en ? 'For infants' : 'Pentru sugari'}
          </p>
          <p className="text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
            {ru ? (
              <>
                Введение прикорма индивидуально — мы рекомендуем{' '}
                <Link href="/nutrition" className="text-ink underline underline-offset-2 hover:text-sage">
                  консультацию нутрициолога
                </Link>{' '}
                вместо общего меню.
              </>
            ) : en ? (
              <>
                Starting solids is individual — we recommend a{' '}
                <Link href="/nutrition" className="text-ink underline underline-offset-2 hover:text-sage">
                  nutrition consultation
                </Link>{' '}
                instead of a general menu.
              </>
            ) : (
              <>
                Diversificarea se face individual — recomandăm o{' '}
                <Link href="/nutrition" className="text-ink underline underline-offset-2 hover:text-sage">
                  consultație de nutriție
                </Link>{' '}
                în loc de un meniu general.
              </>
            )}
          </p>
        </div>

        <MenuLibrary
          menus={items}
          segments={segments}
          labels={{
            all: ru ? 'Все' : en ? 'All' : 'Toate',
            view: ru ? 'Смотреть меню' : en ? 'View menu' : 'Vezi meniul',
            emptyTitle: ru ? 'Меню скоро появятся' : en ? 'Menus are coming soon' : 'Meniurile vin în curând',
            emptyBody: ru
              ? 'Мы готовим первые недельные меню. А пока — для плана, подобранного под вашего ребёнка, запишитесь на консультацию нутрициолога.'
              : en
                ? 'We’re preparing the first weekly menus. In the meantime, for a plan tailored to your child, book a nutrition consultation.'
                : 'Pregătim primele meniuri săptămânale. Între timp, pentru un plan adaptat copilului tău, programează o consultație de nutriție.',
            emptyCta: ru ? 'Консультация нутрициолога' : en ? 'Nutrition consultation' : 'Consultație de nutriție',
            emptyCtaHref: `/${locale}/nutrition`,
          }}
        />
      </section>

      {/* 3 · How to use + content rule (paper) */}
      <section className="bg-paper">
        <div className="shell grid gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-24">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Как ими пользоваться' : en ? 'How to use them' : 'Cum să folosești meniurile'}</p>
            <h2 className="serif text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.05] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Идеи, чтобы <span className="serif-it text-sage">адаптировать</span>
                </>
              ) : en ? (
                <>
                  Ideas to <span className="serif-it text-sage">adapt</span>
                </>
              ) : (
                <>
                  Idei de <span className="serif-it text-sage">adaptat</span>
                </>
              )}
            </h2>
            <p className="mt-5 max-w-[50ch] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Это общие идеи, чтобы упростить планирование недели. Адаптируйте их под предпочтения, возраст и потребности вашего ребёнка.'
                : en
                  ? 'These are general ideas, meant to make planning your week easier. Adapt them to your child’s preferences, age, and needs.'
                  : 'Acestea sunt idei generale, gândite să-ți ușureze planificarea săptămânii. Adaptează-le la preferințele, vârsta și nevoile copilului tău.'}
            </p>
          </div>
          <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
            <p className="eyebrow mb-3">{ru ? 'Важно знать' : en ? 'Good to know' : 'De reținut'}</p>
            <p className="max-w-[52ch] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Меню — это идеи блюд, без точных граммов, калорий или заданных порций. Порции индивидуальны, особенно у детей, а точные количества — уже на консультации.'
                : en
                  ? 'Menus are meal ideas — without exact grams, calories, or set portions. Portions are individual, especially for children; exact amounts belong in a consultation.'
                  : 'Meniurile sunt idei de mese — fără gramaje exacte, calorii sau porții prescrise. Porțiile sunt individuale, mai ales la copii; cantitățile exacte se stabilesc în consultație.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4 · When you need a personalized plan (olive band — the conversion boundary) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell grid gap-10 py-20 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:py-24">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
              {ru ? 'Общее vs персональное' : en ? 'Generic vs personalized' : 'General vs personalizat'}
            </p>
            <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
              {ru ? (
                <>
                  Когда нужен <span className="serif-it text-[var(--sage-soft)]">план</span>
                </>
              ) : en ? (
                <>
                  When you need a <span className="serif-it text-[var(--sage-soft)]">plan</span>
                </>
              ) : (
                <>
                  Când ai nevoie de un <span className="serif-it text-[var(--sage-soft)]">plan</span>
                </>
              )}
            </h2>
            <p className="mt-6 max-w-[52ch] leading-relaxed text-cream/85 text-pretty">
              {ru
                ? 'Общее меню не учитывает конкретную ситуацию вашего ребёнка. Если нужен план под аллергии, трудности с кормлением или заболевание — запишитесь на консультацию нутрициолога.'
                : en
                  ? 'A general menu doesn’t account for your child’s specific situation. If you need a plan tailored to allergies, feeding difficulties, or a condition, book a nutrition consultation.'
                  : 'Un meniu general nu ține cont de situația specifică a copilului tău. Dacă ai nevoie de un plan adaptat — pentru alergii, dificultăți de hrănire sau o afecțiune — programează o consultație de nutriție.'}
            </p>
            <Link href="/nutrition" className={`mt-8 ${creamPill}`}>
              {ru ? 'Консультация нутрициолога' : en ? 'Nutrition consultation' : 'Consultație de nutriție'}
            </Link>
          </div>

          <div className="md:border-l md:border-[rgba(245,241,234,0.18)] md:pl-12 lg:pl-16">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
              {ru ? 'Персональный план охватывает' : en ? 'A personalized plan covers' : 'Un plan personalizat acoperă'}
            </p>
            <ul className="grid gap-3">
              {[
                { ro: 'Alergii și intoleranțe', en: 'Allergies and intolerances', ru: 'Аллергии и непереносимости' },
                { ro: 'Dificultăți de hrănire', en: 'Feeding difficulties', ru: 'Трудности с кормлением' },
                { ro: 'Gramaje și porții adaptate', en: 'Tailored amounts and portions', ru: 'Подобранные граммы и порции' },
                { ro: 'O afecțiune sau o nevoie specifică', en: 'A condition or specific need', ru: 'Заболевание или особая потребность' },
              ].map((it) => (
                <li
                  key={it.en}
                  className="grid grid-cols-[1.1em_1fr] gap-x-2 border-t border-[rgba(245,241,234,0.18)] pt-3 text-[1rem] leading-relaxed text-cream/85"
                >
                  <span aria-hidden="true" className="text-[var(--sage-soft)]">
                    —
                  </span>
                  <span className="text-pretty">{lc(it)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5 · Safety + author */}
      <section className="shell grid gap-12 border-b border-[var(--rule)] py-20 md:grid-cols-2 md:gap-20 md:py-24">
        <div>
          <p className="eyebrow mb-3">{ru ? 'Безопасность' : en ? 'Safety' : 'Siguranță'}</p>
          <p className="max-w-[52ch] leading-relaxed text-ink-soft text-pretty">
            {ru
              ? 'Меню даны для справки и не заменяют личную консультацию врача. Если у ребёнка есть аллергии, непереносимости или заболевание, посоветуйтесь с врачом, прежде чем следовать меню. Для грудничков сроки и состав прикорма подбирают индивидуально.'
              : en
                ? 'Menus are for information only and don’t replace personalized medical advice. If your child has allergies, intolerances, or a condition, consult the doctor before following a menu. For infants, starting solids is decided individually.'
                : 'Meniurile au scop informativ și nu înlocuiesc sfatul medical personalizat. Dacă copilul are alergii, intoleranțe sau o afecțiune, consultă medicul înainte de a aplica un meniu. Pentru sugari, diversificarea se stabilește individual.'}
          </p>
        </div>
        <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
          <p className="eyebrow mb-3">{ru ? 'Кто их готовит' : en ? 'Who prepares them' : 'Cine pregătește meniurile'}</p>
          <p className="max-w-[48ch] leading-relaxed text-ink-soft text-pretty">
            {ru
              ? 'Меню составляет Dr. Olesea Jalba, педиатр с магистерской степенью в области питания человека.'
              : en
                ? 'The menus are prepared by Dr. Olesea Jalba, a pediatrician with a Master’s in Human Nutrition.'
                : 'Meniurile sunt realizate de Dr. Olesea Jalba, medic pediatru cu master în nutriție umană.'}
          </p>
          <Link href="/about" className={`mt-7 ${underlineLg}`}>
            {ru ? 'О враче' : en ? 'About the doctor' : 'Despre medic'} →
          </Link>
        </div>
      </section>

      {/* 6 · Conversion CTA (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Хотите план для вашего <span className="serif-it text-[var(--sage-soft)]">ребёнка?</span>
                  </>
                ) : en ? (
                  <>
                    Want a plan made for your <span className="serif-it text-[var(--sage-soft)]">child?</span>
                  </>
                ) : (
                  <>
                    Vrei un plan făcut pentru copilul <span className="serif-it text-[var(--sage-soft)]">tău?</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/nutrition" className={creamPill}>
                  {ru ? 'Консультация нутрициолога' : en ? 'Nutrition consultation' : 'Consultație de nutriție'}
                </Link>
                <Link href="/quick-question" className={creamUnderline}>
                  {ru ? 'Или задать короткий вопрос · 48ч →' : en ? 'Or ask a quick question · 48h →' : 'Sau o întrebare punctuală · 48h →'}
                </Link>
              </div>
            </div>

            <p className="max-w-[30ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {ru
                ? 'Меню — это вдохновение. План строится вокруг вашего ребёнка.'
                : en
                  ? 'A menu is inspiration. A plan is built around your child.'
                  : 'Un meniu e inspirație. Un plan e construit în jurul copilului tău.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
