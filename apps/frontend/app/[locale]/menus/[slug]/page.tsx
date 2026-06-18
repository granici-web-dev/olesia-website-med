import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Reveal } from '@/components/ui/Reveal';
import {
  findPlaceholderMenu,
  menuSegmentLabel,
  type Bi,
} from '@/lib/placeholder-menus';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Menu detail — a single weekly menu rendered as seven day-cards (meal ideas,
   no grams or portions). Mirrors the menus-listing visual language; reinforces
   the "inspiration, not a plan" boundary and hands off to the nutrition
   consultation. Content is local placeholder data (→ back office later); a
   genuinely unknown slug 404s. Bilingual (RO default · EN).
   ────────────────────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  const menu = findPlaceholderMenu(slug);
  if (!menu) return { title: ru ? 'Меню | Dr. Olesea Jalba' : en ? 'Menu | Dr. Olesea Jalba' : 'Meniu | Dr. Olesea Jalba' };
  const title = ru ? menu.title.ru : en ? menu.title.en : menu.title.ro;
  return {
    title: `${title} | Dr. Olesea Jalba`,
    description: ru ? menu.description.ru : en ? menu.description.en : menu.description.ro,
  };
}

const creamPill =
  'inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-soft)]';
const creamUnderline =
  'inline-block cursor-pointer border-b border-[var(--sage-soft)] pb-0.5 text-sm text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage-soft)]';

export default async function MenuDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  const menu = findPlaceholderMenu(slug);
  if (!menu) notFound();

  const ageLabel = menuSegmentLabel(menu.age, en, ru);
  const title = lc(menu.title);

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Недельные меню' : en ? 'Weekly menus' : 'Meniuri săptămânale', href: '/menus' },
          { label: title },
        ]}
      />

      {/* 1 · Hero */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-16 md:py-24">
          <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ageLabel} · {ru ? 'Недельное меню' : en ? 'Weekly menu' : 'Meniu săptămânal'}
          </p>
          <div className="grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 lg:gap-20">
            <h1 className="serif max-w-[18ch] text-[clamp(2.3rem,5vw,4.4rem)] leading-[1.05] tracking-[-0.015em] text-balance">
              {title}
            </h1>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="max-w-[46ch] text-[1.0625rem] leading-[1.7] text-ink-soft text-pretty">
                {lc(menu.intro)}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.1em] text-sage-text">
                  {menu.days} {ru ? 'дн.' : en ? 'days' : 'zile'}
                </span>
                <span className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.1em] text-sage-text">
                  {ru ? 'Бесплатно · Вдохновение, а не план' : en ? 'Free · Inspiration, not a plan' : 'Gratuit · Inspirație, nu un plan'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · The week — one card per day */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menu.week.map((d, i) => (
            <Reveal
              key={d.day.en}
              as="article"
              className="flex flex-col border border-[var(--rule)] bg-paper p-6 md:p-7"
              delay={(i % 3) * 70}
            >
              <div className="flex items-baseline justify-between border-b border-[var(--rule)] pb-3">
                <h2 className="serif text-[1.4rem] leading-none tracking-[-0.01em] text-ink">
                  {lc(d.day)}
                </h2>
                <span className="mono text-[11px] uppercase tracking-[0.12em] text-sage-text">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <dl className="mt-4 grid gap-3.5">
                {d.meals.map((meal, j) => (
                  <div key={j} className="grid gap-0.5">
                    <dt className="mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                      {lc(menu.mealSlots[j])}
                    </dt>
                    <dd className="text-[0.975rem] leading-snug text-ink text-pretty">
                      {lc(meal)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3 · Boundary note (paper) */}
      <section className="bg-paper">
        <div className="shell grid gap-10 py-16 md:grid-cols-2 md:gap-20 md:py-20">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Важно знать' : en ? 'Good to know' : 'De reținut'}</p>
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
          </div>
          <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
            <p className="max-w-[52ch] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Это меню — набор идей блюд, без точных граммов, калорий или заданных порций. Адаптируйте его под возраст, предпочтения и потребности вашего ребёнка. Если у малыша аллергии, непереносимости или заболевание, сначала посоветуйтесь с врачом.'
                : en
                  ? 'This menu is a set of meal ideas — without exact grams, calories, or set portions. Adapt it to your child’s age, preferences, and needs. If your child has allergies, intolerances, or a condition, check with the doctor first.'
                  : 'Acest meniu este un set de idei de mese — fără gramaje exacte, calorii sau porții prescrise. Adaptează-l la vârsta, preferințele și nevoile copilului tău. Dacă cel mic are alergii, intoleranțe sau o afecțiune, consultă mai întâi medicul.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4 · Conversion CTA (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-16 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[36rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3rem)] leading-[1.04] tracking-[-0.02em] text-cream text-balance">
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
                <Link href="/menus" className={creamUnderline}>
                  {ru ? 'Все меню →' : en ? 'See all menus →' : 'Vezi toate meniurile →'}
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
