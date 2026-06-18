import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { ContactForm } from '@/components/ui/ContactForm';
import { Reveal } from '@/components/ui/Reveal';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Contact — a utility page, not a landing page. Its job is to triage by intent:
   send people down the right path rather than collect everything in one form.
   The form accepts non-medical questions only (appointments, payment, how it
   works); medical questions are routed to "Întreabă medicul" by design — that's
   UX, business-model protection, and GDPR (consent + boundaries) at once.
   Visual language mirrors the service pages: editorial-split hero, hairline
   rules, mono micro-labels, big serif with italic sage accents. Bilingual
   (RO default · EN).
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
      ? 'Контакты | Dr. Olesea Jalba'
      : en
      ? 'Contact | Dr. Olesea Jalba'
      : 'Contact | Dr. Olesea Jalba',
    description: ru
      ? 'Свяжитесь с нами по вопросам онлайн-консультаций, записи на приём и оплаты. По медицинским вопросам используйте «Спросить врача».'
      : en
      ? 'Get in touch about online consultations, appointments, and payment. For a medical question, use “Ask the doctor”.'
      : 'Contactează-ne pentru întrebări despre consultații online, programări și plată. Pentru întrebări medicale, folosește „Întreabă medicul".',
  };
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
    route: { ro: 'Întreabă medicul · 48h', en: 'Ask the doctor · 48h', ru: 'Спросить врача · 48ч' },
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

/* Direct contact details. ⚠ Confirm the phone and social URLs before launch. */
const EMAIL = 'contact@olesiajalba.md';
const PHONE_DISPLAY = '+373 79 000 000';
const PHONE_HREF = 'tel:+37379000000';

const SOCIALS: { name: string; href: string; icon: ReactNode }[] = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
        <path d="M12 2c-2.7 0-3 0-4.1.1-1 .1-1.8.2-2.4.5-.7.3-1.2.6-1.8 1.2S2.7 5 2.5 5.5c-.2.6-.4 1.4-.4 2.4C2 9 2 9.3 2 12s0 3 .1 4.1c0 1 .2 1.8.4 2.4.3.7.6 1.2 1.2 1.8s1.1.9 1.8 1.2c.6.2 1.4.4 2.4.4C9 22 9.3 22 12 22s3 0 4.1-.1c1 0 1.8-.2 2.4-.4.7-.3 1.2-.6 1.8-1.2s.9-1.1 1.2-1.8c.2-.6.4-1.4.4-2.4.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c0-1-.2-1.8-.4-2.4-.3-.7-.6-1.2-1.2-1.8S19 2.7 18.5 2.5c-.6-.2-1.4-.4-2.4-.4C15 2 14.7 2 12 2zm0 1.8c2.7 0 3 0 4 .1.9 0 1.5.2 1.8.3.5.2.8.4 1.1.7.3.3.6.6.7 1.1.1.3.3.9.3 1.8.1 1 .1 1.3.1 4s0 3-.1 4c0 .9-.2 1.5-.3 1.8-.2.5-.4.8-.7 1.1-.3.3-.6.6-1.1.7-.3.1-.9.3-1.8.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-.9 0-1.5-.2-1.8-.3-.5-.2-.8-.4-1.1-.7-.3-.3-.6-.6-.7-1.1-.1-.3-.3-.9-.3-1.8-.1-1-.1-1.3-.1-4s0-3 .1-4c0-.9.2-1.5.3-1.8.2-.5.4-.8.7-1.1.3-.3.6-.6 1.1-.7.3-.1.9-.3 1.8-.3 1-.1 1.3-.1 4-.1zm0 3.1a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 1.8a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6zm5.3-3.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0 0 22 12z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
        <path d="M20.4 3H3.6C3.3 3 3 3.3 3 3.6v16.8c0 .3.3.6.6.6h16.8c.3 0 .6-.3.6-.6V3.6c0-.3-.3-.6-.6-.6zM8.3 18.3H5.6V9.8h2.7v8.5zM6.9 8.6a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2zm11.4 9.7h-2.7v-4.1c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.2H9.9V9.8h2.6v1.2h.1c.4-.7 1.3-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1v4.6z" />
      </svg>
    ),
  },
];

const underlineLg =
  'inline-block cursor-pointer border-b border-ink pb-1 text-sm text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';

export default async function ContactPage({
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
                  ? 'Медицинский вопрос о ребёнке или о себе? Воспользуйтесь сервисом «Спросить врача» — обоснованный ответ придёт в течение 48 часов, с уважением к согласию и границам.'
                  : en
                  ? 'For a medical question about your child or yourself, use the “Ask the doctor” service — you’ll get a documented answer within 48 hours, with proper consent and boundaries.'
                  : 'Pentru o întrebare medicală despre copilul tău sau despre tine, folosește serviciul „Întreabă medicul" — primești un răspuns documentat în 48 de ore, cu acordul și limitele corecte.'}
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
                  <span className="hidden sm:inline">{lc(item.route)}</span>
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
            <div>
              <p className="eyebrow mb-5">
                {ru ? 'Другие способы связи' : en ? 'Other ways to reach us' : 'Alte modalități de contact'}
              </p>
              <dl className="grid gap-5">
                <div className="border-t border-[var(--rule)] pt-4">
                  <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-sage-text">
                    {ru ? 'Email' : en ? 'Email' : 'Email'}
                  </dt>
                  <dd className="serif mt-1.5 text-[1.4rem] leading-snug">
                    <a
                      href={`mailto:${EMAIL}`}
                      className="text-ink underline-offset-4 transition-colors hover:text-sage hover:underline"
                    >
                      {EMAIL}
                    </a>
                  </dd>
                </div>
                <div className="border-t border-[var(--rule)] pt-4">
                  <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-sage-text">
                    {ru ? 'Телефон' : en ? 'Phone' : 'Telefon'}
                  </dt>
                  <dd className="serif mt-1.5 text-[1.4rem] leading-snug lining-nums">
                    <a
                      href={PHONE_HREF}
                      className="text-ink underline-offset-4 transition-colors hover:text-sage hover:underline"
                    >
                      {PHONE_DISPLAY}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-[var(--rule)] pt-7">
              <p className="eyebrow mb-4">{ru ? 'Соцсети' : en ? 'Social' : 'Rețele sociale'}</p>
              <ul className="flex gap-3">
                {SOCIALS.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.name}
                      className="grid size-11 place-items-center border border-[var(--rule)] text-ink-soft transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                    >
                      {s.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
