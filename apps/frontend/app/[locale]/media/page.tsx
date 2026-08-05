import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import { MediaGallery } from '@/components/sections/MediaGallery';
import { PLACEHOLDER_MEDIA } from '@/lib/placeholder-media';
import { api } from '@/lib/api';
import { btnDark, creamPill, creamUnderline } from '@/components/ui/cta';

/* ──────────────────────────────────────────────────────────────────────────
   Apariții media (brief §7.4 · client answers v2 §6) — the dedicated page the
   client asked for. Content comes from the back-office `media-appearances`
   module; radio, conferences and presentations follow with the client's full
   list. When the API answers it always wins; when it does not, the page falls
   back to the committed copy in `lib/placeholder-media.ts` — see the reasoning
   there, and delete it once the API is deployed.

   Embeds are click-to-load (see MediaGallery) so no YouTube/Facebook cookie is
   set before the visitor presses play. Recordings are never self-hosted — the
   broadcast rights belong to the channels, so each item links to its source.
   Trilingual (RO default · EN · RU).
   ────────────────────────────────────────────────────────────────────────── */

export const revalidate = 60;

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
      ? 'СМИ о враче — телеэфиры и интервью | Dr. Olesea Jalba'
      : en
        ? 'In the media — TV appearances & interviews | Dr. Olesea Jalba'
        : 'Apariții media — emisiuni TV și interviuri | Dr. Olesea Jalba',
    description: ru
      ? 'Педиатр Olesea Jalba в эфире Moldova 1, TVR Moldova и Canal 2: аппетит у детей, сезонный грипп, защита от солнечного удара.'
      : en
        ? 'Pediatrician Olesea Jalba on Moldova 1, TVR Moldova and Canal 2: children’s appetite, seasonal flu, protecting kids from heatstroke.'
        : 'Medicul pediatru Olesea Jalba la Moldova 1, TVR Moldova și Canal 2: inapetența la copii, gripa sezonieră, protecția de insolație.',
  };
}

export default async function MediaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lang = (ru ? 'ru' : en ? 'en' : 'ro') as 'ro' | 'en' | 'ru';

  const live = await api.mediaAppearances();
  const appearances = live.length > 0 ? live : PLACEHOLDER_MEDIA;
  const outlets = [...new Set(appearances.map((m) => m.outlet))];

  return (
    <main className="bg-cream text-ink">
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'СМИ' : en ? 'Media' : 'Media' },
        ]}
      />

      {/* 1 · Hero */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'СМИ' : en ? 'In the media' : 'Apariții media'}
          </p>

          <div className="grid items-end gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[15ch] text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.03] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    В <span className="serif-it text-sage">эфире</span>
                  </>
                ) : en ? (
                  <>
                    In the <span className="serif-it text-sage">media</span>
                  </>
                ) : (
                  <>
                    Apariții <span className="serif-it text-sage">media</span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[46ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {ru
                  ? 'Разговоры о детском здоровье и питании на молдавском телевидении — темы, с которыми родители сталкиваются каждый день.'
                  : en
                    ? 'Conversations about children’s health and nutrition on Moldovan television — the topics parents run into every day.'
                    : 'Discuții despre sănătatea și alimentația copiilor la televiziunile din Moldova — temele cu care părinții se confruntă zilnic.'}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-8 gap-y-8 md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <div>
                <dt className="eyebrow mb-2">
                  {ru ? 'Материалов' : en ? 'Appearances' : 'Materiale'}
                </dt>
                <dd className="serif text-[2.4rem] leading-none lining-nums tabular-nums text-sage">
                  {appearances.length}
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">{ru ? 'Каналы' : en ? 'Outlets' : 'Televiziuni'}</dt>
                <dd className="mt-1 text-[0.95rem] leading-relaxed text-ink">
                  {outlets.join(' · ')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* 2 · The appearances */}
      <section className="shell py-20 md:py-28">
        <header className="mb-12 flex flex-col gap-4 md:mb-14 md:flex-row md:items-baseline md:justify-between">
          <div>
            <p className="eyebrow mb-3">{ru ? 'Телеэфиры' : en ? 'On television' : 'La televizor'}</p>
            <h2 className="serif text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.0] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Выпуски и <span className="serif-it text-sage">интервью</span>
                </>
              ) : en ? (
                <>
                  Shows and <span className="serif-it text-sage">interviews</span>
                </>
              ) : (
                <>
                  Emisiuni și <span className="serif-it text-sage">interviuri</span>
                </>
              )}
            </h2>
          </div>
          <p className="max-w-[340px] text-sm leading-[1.7] text-ink-soft text-pretty">
            {ru
              ? 'Видео открывается по клику — до этого YouTube и Facebook не загружаются и не ставят куки.'
              : en
                ? 'A video only loads when you press play — until then YouTube and Facebook are never contacted and set no cookies.'
                : 'Videoclipul se încarcă doar când apeși play — până atunci YouTube și Facebook nu sunt contactate și nu setează cookie-uri.'}
          </p>
        </header>

        <MediaGallery locale={lang} items={appearances} />

        <p className="mt-12 max-w-[70ch] text-sm leading-relaxed text-ink-soft text-pretty">
          {ru
            ? 'Материалы принадлежат телеканалам, которые их подготовили, и показаны здесь со ссылкой на первоисточник.'
            : en
              ? 'The recordings belong to the broadcasters that produced them and are shown here with a link to the original publication.'
              : 'Materialele aparțin instituțiilor media care le-au realizat și sunt afișate aici cu link către sursa originală.'}
        </p>
      </section>

      {/* 3 · Press contact + consultation CTA (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem]">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sage-soft)]">
                {ru ? 'Для прессы' : en ? 'For the press' : 'Pentru presă'}
              </p>
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Приглашение в <span className="serif-it text-[var(--sage-soft)]">эфир?</span>
                  </>
                ) : en ? (
                  <>
                    An interview or <span className="serif-it text-[var(--sage-soft)]">a talk?</span>
                  </>
                ) : (
                  <>
                    O invitație sau un <span className="serif-it text-[var(--sage-soft)]">interviu?</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/contact" className={creamPill}>
                  {ru ? 'Написать' : en ? 'Get in touch' : 'Scrie-mi'}
                </Link>
                <Link href="/about" className={creamUnderline}>
                  {ru ? 'О враче →' : en ? 'About the doctor →' : 'Despre medic →'}
                </Link>
              </div>
            </div>

            <p className="max-w-[30ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {ru
                ? 'Темы: питание и здоровье детей, профилактика, сезонные болезни, вопросы родителей.'
                : en
                  ? 'Topics: children’s nutrition and health, prevention, seasonal illness, parents’ questions.'
                  : 'Teme: alimentația și sănătatea copiilor, prevenție, boli sezoniere, întrebările părinților.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4 · Consultation CTA */}
      <section className="shell flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <p className="serif max-w-[24ch] text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.12] tracking-[-0.01em] text-balance">
          {ru
            ? 'Нужен разбор ситуации вашего ребёнка?'
            : en
              ? 'Need your child’s situation looked at?'
              : 'Ai nevoie de o părere pentru copilul tău?'}
        </p>
        <Link href="/services" className={btnDark}>
          {ru ? 'Смотреть консультации' : en ? 'See the consultations' : 'Vezi consultațiile'}
        </Link>
      </section>
    </main>
  );
}
