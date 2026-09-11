import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { pageMetadata } from '@/lib/page-metadata';
import { Link } from '@/i18n/navigation';
import { ContactForm } from '@/components/ui/ContactForm';
import { Reveal } from '@/components/ui/Reveal';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { underlineLg } from '@/components/ui/cta';
import { api, loc } from '@/lib/api';
import { contactHref, groupContacts, socialNetwork } from '@/lib/contacts';
import {
  formatSla,
  formatSlaInHours,
  formatWorkingWeek,
  provisionalNote,
  withSla,
} from '@/lib/working-hours';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Contact — a utility page, not a landing page. Its job is to triage by intent:
   send people down the right path rather than collect everything in one form.
   The form accepts non-medical questions only (appointments, payment, how it
   works); medical questions are routed to "Întreabă medicul" by design — that's
   UX, business-model protection, and GDPR (consent + boundaries) at once.
   Visual language mirrors the service pages: editorial-split hero, hairline
   rules, mono micro-labels, big serif with italic sage accents. Trilingual
   (RO default · EN · RU).
   The channels and the opening hours come from `GET /contacts` and
   `GET /working-hours`. They were string constants here while the back office
   edited tables nothing rendered (audit A6, F12); a kind the client has not
   entered is simply not shown.
   ────────────────────────────────────────────────────────────────────────── */

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
    path: '/contact',
    title: ru
      ? 'Контакты | Dr. Olesea Jalba'
      : en
      ? 'Contact | Dr. Olesea Jalba'
      : 'Contact | Dr. Olesea Jalba',
    description: ru
      ? 'Свяжитесь с нами по вопросам онлайн-консультаций, записи на приём и оплаты. По медицинским вопросам используйте «Спросить врача».'
      : en
      ? 'Get in touch about online consultations, appointments, and payment. For a medical question, use “Ask the doctor”.'
      : 'Contactează-ne pentru întrebări despre consultații online, programări și plată. Pentru întrebări medicale, folosește „Întreabă medicul".',
  });
}

type Bi = { ro: string; en: string; ru: string };

/* Triage routes — intent → destination. */
const TRIAGE: { situation: Bi; route: Bi; href: string; anchor?: boolean }[] = [
  {
    situation: {
      ro: 'Vreau să programez o consultație',
      en: 'I want to book a consultation',
      ru: 'Хочу записаться на консультацию',
    },
    route: { ro: 'Vezi serviciile', en: 'See the services', ru: 'Посмотреть услуги' },
    href: '/services',
  },
  {
    situation: {
      ro: 'Am o întrebare medicală pentru medic',
      en: 'I have a medical question for the doctor',
      ru: 'У меня медицинский вопрос к врачу',
    },
    /* `{sla}` is filled from `WorkingHours.expressSlaMinutes` below — the
       promise is the client's to edit, not ours to compile in (audit A7, F2). */
    route: {
      ro: 'Întreabă medicul · {sla}',
      en: 'Ask the doctor · {sla}',
      ru: 'Спросить врача · {sla}',
    },
    href: '/quick-question',
  },
  {
    situation: {
      ro: 'Am o întrebare despre servicii, plată sau cum funcționează',
      en: 'I have a question about services, payment, or how it works',
      ru: 'У меня вопрос об услугах, оплате или о том, как всё устроено',
    },
    route: { ro: 'Scrie-ne mai jos', en: 'Write to us below', ru: 'Напишите нам ниже' },
    href: '#contact-form',
    anchor: true,
  },
];

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = (b: Bi) => (ru ? b.ru : en ? b.en : b.ro);

  const [contacts, hours] = await Promise.all([
    api.contacts(),
    api.workingHours(),
  ]);
  const { phones, emails, addresses, socials } = groupContacts(contacts);
  const direct = [...emails, ...phones, ...addresses];
  const week = formatWorkingWeek(locale, hours);
  const provisional = provisionalNote(locale, hours);
  const sla = formatSla(locale, hours.expressSlaMinutes);
  const slaInHours = formatSlaInHours(locale, hours.expressSlaMinutes);

  return (
    <main className="bg-cream text-ink">
      {/* 1 · Hero — editorial split: statement left, expectation-setting right */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Контакты' : en ? 'Contact' : 'Contact'}
          </p>
          <div className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14 lg:gap-20">
            <div>
              <h1 className="serif max-w-[14ch] text-[clamp(2.8rem,6.5vw,5.8rem)] leading-[1.02] tracking-[-0.015em] text-balance">
                {ru ? (
                  <>
                    Давайте <span className="serif-it text-sage">поговорим</span>
                  </>
                ) : en ? (
                  <>
                    Let’s <span className="serif-it text-sage">talk</span>
                  </>
                ) : (
                  <>
                    Hai să <span className="serif-it text-sage">vorbim</span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-[36ch] text-[1.125rem] leading-[1.6] text-ink-soft text-pretty">
                {ru
                  ? 'Вопрос об услугах, запись на приём или оплата? Напишите нам.'
                  : en
                  ? 'A question about services, an appointment, or payment? Write to us.'
                  : 'Ai o întrebare despre servicii, o programare sau o plată? Scrie-ne.'}
              </p>
              <div className="mt-9">
                <a href="#contact-form" className={underlineLg}>
                  {ru ? 'Перейти к форме' : en ? 'Go to the form' : 'Mergi la formular'} →
                </a>
              </div>
            </div>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="max-w-[44ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {ru
                  ? `Медицинский вопрос о ребёнке или о себе? Воспользуйтесь сервисом «Спросить врача» — обоснованный ответ придёт в течение ${slaInHours}, с уважением к согласию и границам.`
                  : en
                  ? `For a medical question about your child or yourself, use the “Ask the doctor” service — you’ll get a documented answer within ${slaInHours}, with proper consent and boundaries.`
                  : `Pentru o întrebare medicală despre copilul tău sau despre tine, folosește serviciul „Întreabă medicul" — primești un răspuns documentat în ${slaInHours}, cu acordul și limitele corecte.`}
              </p>
              <Link
                href="/quick-question"
                className="mono mt-6 inline-flex items-center gap-2 border-b border-sage pb-1 text-[11px] uppercase tracking-[0.12em] text-sage-text transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
              >
                {ru ? 'Спросить врача' : en ? 'Ask the doctor' : 'Întreabă medicul'} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Triage — intent → the right path */}
      <section className="shell py-16 md:py-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
          <h2 className="serif text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.0] tracking-[-0.02em] text-balance">
            {ru ? (
              <>
                Чем мы можем <span className="serif-it text-sage">помочь?</span>
              </>
            ) : en ? (
              <>
                How can we <span className="serif-it text-sage">help?</span>
              </>
            ) : (
              <>
                Cum te putem <span className="serif-it text-sage">ajuta?</span>
              </>
            )}
          </h2>
          <p className="max-w-[320px] text-sm leading-[1.7] text-ink-soft">
            {ru
              ? 'Выберите то, что похоже на вашу ситуацию — мы подскажем верный путь.'
              : en
              ? 'Pick what sounds like your situation — we’ll point you the right way.'
              : 'Alege ce seamănă cu situația ta — te îndrumăm pe drumul potrivit.'}
          </p>
        </div>

        <ul className="mt-10 border-t border-[var(--rule)]">
          {TRIAGE.map((item, i) => {
            const inner = (
              <>
                <span className="serif text-[clamp(1.25rem,2.2vw,1.7rem)] leading-snug text-ink transition-colors group-hover:text-sage text-pretty">
                  {lc(item.situation)}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-[13px] font-medium uppercase tracking-[0.08em] text-sage-text">
                  <span className="hidden sm:inline">
                    {withSla(lc(item.route), sla)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </>
            );
            const cls =
              'group flex items-center justify-between gap-6 py-5 transition-colors hover:text-sage focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sage';
            return (
              <Reveal key={item.href} as="li" className="border-b border-[var(--rule)]" delay={i * 60}>
                {item.anchor ? (
                  <a href={item.href} className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link href={item.href} className={cls}>
                    {inner}
                  </Link>
                )}
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* 3 · Form + direct channels — form left, the rest as an aside */}
      <section id="contact-form" className="scroll-mt-24 bg-paper">
        <div className="shell grid gap-12 py-20 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:py-28 lg:gap-24">
          {/* Form */}
          <div>
            <p className="eyebrow mb-3">{ru ? 'Напишите нам' : en ? 'Write to us' : 'Scrie-ne'}</p>
            <h2 className="serif text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-balance">
              {ru ? (
                <>
                  Отправьте нам <span className="serif-it text-sage">сообщение</span>
                </>
              ) : en ? (
                <>
                  Send us a <span className="serif-it text-sage">message</span>
                </>
              ) : (
                <>
                  Trimite-ne un <span className="serif-it text-sage">mesaj</span>
                </>
              )}
            </h2>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'По вопросам об услугах, записи на приём или оплате. Пожалуйста, не указывайте здесь подробную медицинскую информацию.'
                : en
                ? 'For questions about services, appointments, or payment. Please don’t include detailed medical information here.'
                : 'Pentru întrebări despre servicii, programări sau plată. Te rugăm să nu incluzi informații medicale detaliate aici.'}
            </p>

            <div className="mt-10">
              <ContactForm locale={locale} />
            </div>
          </div>

          {/* Aside: direct contact details */}
          <aside className="flex flex-col gap-8 md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
            {direct.length > 0 && (
              <div>
                <p className="eyebrow mb-5">
                  {ru ? 'Другие способы связи' : en ? 'Other ways to reach us' : 'Alte modalități de contact'}
                </p>
                <dl className="grid gap-5">
                  {direct.map((c) => {
                    const href = contactHref(c);
                    const label = loc(locale, c.labelRo, c.labelEn, c.labelRu);
                    return (
                      <div key={c.id} className="border-t border-[var(--rule)] pt-4">
                        <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-sage-text">
                          {label}
                        </dt>
                        <dd className="serif mt-1.5 text-[1.4rem] leading-snug lining-nums">
                          {href ? (
                            <a
                              href={href}
                              className="text-ink underline-offset-4 transition-colors hover:text-sage hover:underline"
                            >
                              {c.value}
                            </a>
                          ) : (
                            c.value
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            )}

            {week.length > 0 && (
              <div className="border-t border-[var(--rule)] pt-7">
                <p className="eyebrow mb-4">
                  {ru ? 'Часы работы' : en ? 'Opening hours' : 'Program de lucru'}
                </p>
                <dl className="grid gap-2.5">
                  {week.map((row) => (
                    <div
                      key={row.days}
                      className="flex items-baseline justify-between gap-6 text-[0.95rem]"
                    >
                      <dt className="text-ink">{row.days}</dt>
                      <dd
                        className={`lining-nums ${row.closed ? 'text-ink-soft' : 'text-ink'}`}
                      >
                        {row.hours}
                      </dd>
                    </div>
                  ))}
                </dl>
                {provisional && (
                  <p className="mt-4 text-[0.8rem] leading-relaxed text-ink-soft text-pretty">
                    {provisional}
                  </p>
                )}
              </div>
            )}

            {socials.length > 0 && (
              <div className="border-t border-[var(--rule)] pt-7">
                <p className="eyebrow mb-4">{ru ? 'Соцсети' : en ? 'Social' : 'Rețele sociale'}</p>
                <ul className="flex gap-3">
                  {socials.map((c) => {
                    const href = contactHref(c);
                    if (!href) return null;
                    const label = loc(locale, c.labelRo, c.labelEn, c.labelRu);
                    return (
                      <li key={c.id}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={label}
                          className="grid size-11 place-items-center border border-[var(--rule)] text-ink-soft transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                        >
                          <SocialIcon network={socialNetwork(c.value)} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
