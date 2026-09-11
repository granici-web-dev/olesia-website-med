import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { pageMetadata } from '@/lib/page-metadata';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { creamPill, creamUnderline } from '@/components/ui/cta';
import { LegalDraftNotice } from '@/components/ui/LegalDraftNotice';
import { api } from '@/lib/api';
import { LEGAL_UPDATED, SITE_IDENTITY } from '@/lib/legal-entity';
import { biFor, type Bi } from '@/lib/i18n-types';

export const revalidate = 60;

/* ──────────────────────────────────────────────────────────────────────────
   Terms & Conditions / Termeni și condiții (/<locale>/terms).
   Two-layer terms page for a pediatrics & nutrition tele-practice, matching
   the /gdpr + FAQ editorial system: hero + provider meta · plain-language
   "Pe scurt" TL;DR · sticky table-of-contents + sections · a prominent
   "not for emergencies" safety callout in the medical-nature section (the
   core) · cancellation rules · links to the Privacy Policy. Bilingual RO
   (default) · EN.

   ⚠ LEGAL: Draft scaffold, NOT a finished contract or legal advice. This is a
   paid-medical-service agreement (liability, consumer rights, distance-selling
   withdrawal, prescriptions under MD telemedicine rules) — a qualified lawyer
   MUST review and confirm the META placeholders below. Cancellation/payment
   wording here is kept consistent with the FAQ page (24h notice, pay before
   the consultation); the FAQ, service pages, and these Terms are one source of
   truth and must stay aligned — Terms is the binding version. Framework: MD law
   + consumer-protection law. ⚠ confirm refund terms, liability limits, dispute
   resolution, prescription policy, and which language version prevails.
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Dates and the trading name come from `lib/legal-entity.ts`; the registered
 * entity comes from the API — see /gdpr for why. `provider` falls back to the
 * trading name so the page reads as prose while the entity is outstanding, and
 * the draft banner says what is missing.
 */
const META = {
  email: SITE_IDENTITY.email,
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
  return pageMetadata({
    locale,
    path: '/terms',
    title: ru
      ? 'Условия использования | Dr. Olesea Jalba'
      : en
        ? 'Terms & Conditions | Dr. Olesea Jalba'
        : 'Termeni și condiții | Dr. Olesea Jalba',
    description: ru
      ? 'Условия пользования услугами онлайн-консультаций — запись, оплата, отмена и ограничения медицинских услуг.'
      : en
        ? 'Terms of use for online consultation services — booking, payment, cancellation, and the limits of the medical services.'
        : 'Condițiile de utilizare a serviciilor de consultații online — programare, plată, anulare și limitele serviciilor medicale.',
  });
}

interface TocItem {
  id: string;
  ro: string;
  en: string;
  ru: string;
}

const TOC: TocItem[] = [
  { id: 'pe-scurt', ro: 'Pe scurt', en: 'In short', ru: 'Коротко' },
  { id: 'servicii', ro: 'Serviciile oferite', en: 'The services', ru: 'Услуги' },
  { id: 'utilizatori', ro: 'Cine poate folosi', en: 'Who can use them', ru: 'Кто может пользоваться' },
  { id: 'programare', ro: 'Programare', en: 'Booking', ru: 'Запись' },
  { id: 'plata', ro: 'Plată', en: 'Payment', ru: 'Оплата' },
  { id: 'anulare', ro: 'Anulare și rambursare', en: 'Cancellation & refunds', ru: 'Отмена и возврат' },
  { id: 'rambursare', ro: 'Rambursarea, pe tipuri', en: 'Refunds by purchase', ru: 'Возврат по видам' },
  { id: 'natura', ro: 'Natura serviciilor', en: 'Nature of the services', ru: 'Характер услуг' },
  { id: 'obligatii', ro: 'Obligațiile tale', en: 'Your obligations', ru: 'Ваши обязанности' },
  { id: 'raspundere', ro: 'Răspundere', en: 'Liability', ru: 'Ответственность' },
  { id: 'proprietate', ro: 'Proprietate intelectuală', en: 'Intellectual property', ru: 'Интеллектуальная собственность' },
  { id: 'confidentialitate', ro: 'Confidențialitate', en: 'Privacy', ru: 'Конфиденциальность' },
  { id: 'modificari', ro: 'Modificări', en: 'Changes', ru: 'Изменения' },
  { id: 'lege', ro: 'Legea aplicabilă', en: 'Governing law', ru: 'Применимое право' },
  { id: 'contact', ro: 'Contact', en: 'Contact', ru: 'Контакты' },
];

const SUMMARY: Bi[] = [
  {
    ro: 'Acești termeni reglementează folosirea serviciilor noastre.',
    en: 'These terms govern how you use our services.',
    ru: 'Настоящие Условия регулируют пользование нашими услугами.',
  },
  {
    ro: 'Consultațiile online au limite și nu sunt pentru urgențe — în caz de urgență, sună la 112.',
    en: 'Online consultations have limits and aren’t for emergencies — in an emergency, call 112.',
    ru: 'Онлайн-консультации ограничены и не предназначены для экстренных случаев — в неотложной ситуации звоните 112.',
  },
  {
    ro: 'Plata se face prin transfer bancar, înainte de consultație.',
    en: 'Payment is by bank transfer, before the consultation.',
    ru: 'Оплата — банковским переводом, до консультации.',
  },
  {
    ro: 'Poți anula sau reprograma cu cel puțin 24 de ore înainte.',
    en: 'You can cancel or reschedule at least 24 hours in advance.',
    ru: 'Вы можете отменить или перенести запись не позднее чем за 24 часа.',
  },
  {
    ro: 'Pentru copii, serviciile sunt solicitate de un părinte sau reprezentant legal.',
    en: 'For children, services are requested by a parent or legal guardian.',
    ru: 'Услуги для детей заказывает родитель или законный представитель.',
  },
];

/**
 * What is refundable, per kind of purchase. The acquirer's compliance review
 * asks for this in so many words, and the three kinds genuinely differ: a
 * consultation can be cancelled, a written answer is work already done once it
 * is written, and a file cannot be returned after it has been downloaded.
 *
 * ⚠ These are the practice's stated terms, not a lawyer's. Confirm them with
 * the same review that confirms the rest of this page.
 */
const REFUNDS: Bi[] = [
  {
    ro: 'Consultații video: rambursare integrală dacă anulezi cu cel puțin 24 de ore înainte. Sub acest termen, plata acoperă intervalul rezervat.',
    en: 'Video consultations: a full refund if you cancel at least 24 hours ahead. Inside that window, the payment covers the slot that was held for you.',
    ru: 'Видеоконсультации: полный возврат при отмене не позднее чем за 24 часа. Позже оплата покрывает забронированное время.',
  },
  {
    ro: 'Întrebare EXPRESS: rambursare integrală oricând înainte ca medicul să trimită răspunsul. După ce răspunsul a plecat, serviciul a fost prestat.',
    en: 'Express question: a full refund any time before the doctor sends the answer. Once the answer has gone out, the service has been delivered.',
    ru: 'Экспресс-вопрос: полный возврат в любой момент, пока врач не отправил ответ. После отправки ответа услуга считается оказанной.',
  },
  {
    ro: 'Meniuri și protocoale personalizate: rambursare integrală înainte de începerea lucrului. După livrarea documentului, nu se rambursează — este realizat pentru situația ta.',
    en: 'Personalized menus and protocols: a full refund before work starts. Once the document has been delivered it is not refundable — it was written for your situation.',
    ru: 'Персональные меню и протоколы: полный возврат до начала работы. После передачи документа возврат не производится — он составлен под вашу ситуацию.',
  },
  {
    ro: 'Materiale din bibliotecă: fiind fișiere descărcate imediat, nu se rambursează după descărcare. Dacă fișierul nu se deschide sau nu este cel comandat, scrie-ne și îl înlocuim sau returnăm banii.',
    en: 'Library materials: a file downloaded straight away is not refundable once downloaded. If the file will not open, or is not the one you ordered, write to us and we replace it or refund it.',
    ru: 'Материалы из библиотеки: файл скачивается сразу, поэтому после скачивания возврат не производится. Если файл не открывается или это не то, что вы заказывали, напишите нам — заменим или вернём деньги.',
  },
  {
    ro: 'Cererea de rambursare se trimite pe email, cu numărul comenzii din confirmarea de plată. Răspundem în cel mult 5 zile lucrătoare.',
    en: 'Ask for a refund by email, quoting the order number from your payment confirmation. We answer within 5 working days.',
    ru: 'Запрос на возврат отправляйте по электронной почте, указав номер заказа из письма-подтверждения. Отвечаем в течение 5 рабочих дней.',
  },
];

const NATURE: Bi[] = [
  {
    ro: 'Consultațiile online au limite și nu înlocuiesc o examinare fizică atunci când aceasta este necesară.',
    en: 'Online consultations have limits and don’t replace a physical examination when one is needed.',
    ru: 'Онлайн-консультации ограничены и не заменяют очный осмотр, когда он необходим.',
  },
  {
    ro: 'Medicul poate stabili că situația necesită o consultație în persoană sau investigații suplimentare și te poate îndruma în acest sens.',
    en: 'The doctor may determine that the situation needs an in-person consultation or further tests, and will guide you accordingly.',
    ru: 'Врач может решить, что ситуация требует очной консультации или дополнительных обследований, и подскажет, что делать дальше.',
  },
  {
    ro: 'Nu garantăm un anumit rezultat medical.',
    en: 'We don’t guarantee any particular medical outcome.',
    ru: 'Мы не гарантируем определённый медицинский результат.',
  },
  {
    ro: 'Materialele informative — ghiduri, meniuri, articole — au caracter general și nu reprezintă sfaturi medicale personalizate.',
    en: 'Informational materials — guides, menus, articles — are general in nature and aren’t personalised medical advice.',
    ru: 'Информационные материалы — руководства, меню, статьи — носят общий характер и не заменяют индивидуальную медицинскую консультацию.',
  },
  {
    // ⚠ prescriptions: confirm MD telemedicine regulations with lawyer
    ro: 'Eliberarea rețetelor depinde de situație și de reglementările aplicabile.',
    en: 'Whether a prescription is issued depends on the situation and the applicable regulations.',
    ru: 'Выписка рецептов зависит от ситуации и применимых нормативных требований.',
  },
];

const inlineLink =
  'text-sage-text underline decoration-[var(--sage-soft)] underline-offset-4 transition-colors hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';

function Dot() {
  return (
    <span
      className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-sage"
      aria-hidden="true"
    />
  );
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const en = locale === 'en';
  const ru = locale === 'ru';
  const lc = biFor(locale);
  const legalEntity = await api.legalEntity();

  return (
    <main className="bg-cream text-ink">
      <LegalDraftNotice locale={locale} entity={legalEntity} />
      <Breadcrumbs
        className="shell pt-6 md:pt-8"
        items={[
          { label: ru ? 'Главная' : en ? 'Home' : 'Acasă', href: '/' },
          { label: ru ? 'Условия' : en ? 'Terms' : 'Termeni' },
        ]}
      />
      {/* 1 · Hero — title + provider meta */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {ru ? 'Условия' : en ? 'Terms' : 'Termeni'}
          </p>
          <div className="grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 lg:gap-20">
            <h1 className="serif max-w-[15ch] text-[clamp(2.5rem,5.6vw,5rem)] leading-[1.04] tracking-[-0.015em] text-balance">
              {ru ? (
                <>
                  Условия <span className="serif-it text-sage">использования</span>
                </>
              ) : en ? (
                <>
                  Terms &amp; <span className="serif-it text-sage">conditions</span>
                </>
              ) : (
                <>
                  Termeni și <span className="serif-it text-sage">condiții</span>
                </>
              )}
            </h1>
            <div className="md:border-l md:border-[var(--rule)] md:pl-12 lg:pl-16">
              <p className="max-w-[46ch] text-[1.0625rem] leading-[1.75] text-ink text-pretty">
                {ru
                  ? 'Условия пользования нашими услугами онлайн-консультаций — запись, оплата, отмена и ограничения медицинских услуг.'
                  : en
                    ? 'The terms for using our online consultation services — booking, payment, cancellation, and the limits of the medical services.'
                    : 'Condițiile de utilizare a serviciilor noastre de consultații online — programare, plată, anulare și limitele serviciilor medicale.'}
              </p>
              <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[0.9375rem]">
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {ru ? 'Поставщик услуг' : en ? 'Provider' : 'Furnizor'}
                </dt>
                <dd className="text-ink">
                  {legalEntity.registeredName || SITE_IDENTITY.displayName}
                </dd>
                {legalEntity.idno && (
                  <>
                    <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                      IDNO
                    </dt>
                    <dd className="text-ink">{legalEntity.idno}</dd>
                  </>
                )}
                {legalEntity.address && (
                  <>
                    <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                      {ru ? 'Адрес' : en ? 'Address' : 'Adresă'}
                    </dt>
                    <dd className="text-ink">{legalEntity.address}</dd>
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
                  <a href={`mailto:${META.email}`} className={inlineLink}>
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
            {ru ? 'Коротко' : en ? 'In short' : 'Pe scurt'}
          </h2>
          <ul className="grid max-w-[62ch] gap-4">
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
          {/* Serviciile oferite */}
          <Section id="servicii" title={ru ? 'Предлагаемые услуги' : en ? 'The services we offer' : 'Serviciile oferite'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru ? (
                <>
                  Мы предлагаем видеоконсультации — педиатрические, по питанию и
                  интегративные — а также услуги через портал: «Спросите врача» и
                  наблюдение с абонементами. Детали и продолжительность каждой услуги описаны
                  на странице{' '}
                  <Link href="/services" className={inlineLink}>
                    Услуги
                  </Link>
                  .
                </>
              ) : en ? (
                <>
                  We offer video consultations — pediatric, nutrition, and integrative —
                  and portal-based services: “Ask the doctor” and monitoring subscriptions. The
                  details and duration of each service are described on the{' '}
                  <Link href="/services" className={inlineLink}>
                    Services
                  </Link>{' '}
                  page.
                </>
              ) : (
                <>
                  Oferim consultații video — pediatrică, de nutriție și integrativă — și
                  servicii prin portal: „Întreabă medicul” și monitorizare cu abonamente.
                  Detaliile și durata fiecărui serviciu sunt descrise pe pagina{' '}
                  <Link href="/services" className={inlineLink}>
                    Servicii
                  </Link>
                  .
                </>
              )}
            </p>
          </Section>

          {/* Cine poate folosi serviciile */}
          <Section id="utilizatori" title={ru ? 'Кто может пользоваться услугами' : en ? 'Who can use the services' : 'Cine poate folosi serviciile'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Если услуга предназначена для ребёнка, запись оформляет и настоящие Условия принимает родитель или законный представитель, который подтверждает своё право действовать от имени ребёнка.'
                : en
                  ? 'For services intended for children, booking and acceptance of these terms are done by a parent or legal guardian, who confirms they have the right to act on the child’s behalf.'
                  : 'Pentru serviciile destinate copiilor, programarea și acceptarea acestor termeni se fac de către un părinte sau reprezentantul legal, care confirmă că are dreptul să acționeze în numele copilului.'}
            </p>
          </Section>

          {/* Programare și confirmare */}
          <Section id="programare" title={ru ? 'Запись и подтверждение' : en ? 'Booking & confirmation' : 'Programare și confirmare'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'На видеоконсультации вы записываетесь через Calendly и получаете подтверждение выбранного времени. Для услуг через портал — отправляете заявку или вопрос.'
                : en
                  ? 'You book video consultations through Calendly and receive a confirmation of the time you chose. For portal-based services, you send a request or a question.'
                  : 'Programarea consultațiilor video se face prin Calendly; vei primi o confirmare a orei alese. Pentru serviciile prin portal, trimiți o solicitare sau o întrebare.'}
            </p>
          </Section>

          {/* Plată */}
          <Section id="plata" title={ru ? 'Оплата' : en ? 'Payment' : 'Plată'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru ? (
                <>
                  Оплатить можно на сайте картой или через MIA — платёж проходит на
                  защищённой странице BC «MAIB» S.A. — либо банковским переводом. Оплата
                  вносится до консультации, после того как запись подтверждена.
                  Цены указаны для каждой услуги и на странице{' '}
                  <Link href="/pricing" className={inlineLink}>
                    Тарифы
                  </Link>
                  . Подтверждение оплаты придёт по электронной почте.
                </>
              ) : en ? (
                <>
                  You can pay on the site by card or through MIA — the payment takes place
                  on the secure page of BC “MAIB” S.A. — or by bank transfer. Payment is due
                  before the consultation, once the booking is confirmed. Prices
                  are shown for each service and on the{' '}
                  <Link href="/pricing" className={inlineLink}>
                    Pricing
                  </Link>{' '}
                  page. You receive a payment confirmation by email.
                </>
              ) : (
                <>
                  Poți plăti pe site cu cardul sau prin MIA — plata are loc pe pagina
                  securizată a BC „MAIB” S.A. — ori prin transfer bancar. Plata se achită
                  înainte de consultație, după confirmarea programării. Prețurile sunt
                  afișate la fiecare serviciu și pe pagina{' '}
                  <Link href="/pricing" className={inlineLink}>
                    Tarife
                  </Link>
                  . Vei primi o confirmare a plății pe email.
                </>
              )}
            </p>
          </Section>

          {/* Anulare, reprogramare și rambursare */}
          <Section
            id="anulare"
            title={ru ? 'Отмена, перенос и возврат средств' : en ? 'Cancellation, rescheduling & refunds' : 'Anulare, reprogramare și rambursare'}
          >
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Вы можете отменить или перенести консультацию не позднее чем за 24 часа до назначенного времени — по ссылке из подтверждения. Если вы отменяете запись в этот срок, мы возвращаем оплату согласно политике отмены. Если вы опаздываете настолько, что провести консультацию уже нельзя, мы можем её перенести.'
                : en
                  ? 'You can cancel or reschedule a consultation at least 24 hours before the scheduled time, from your confirmation link. Refunds are made if you cancel within this window, per the cancellation policy. If you’re too late for the consultation to take place, we can reschedule it.'
                  : 'Poți anula sau reprograma o consultație cu cel puțin 24 de ore înainte de ora programată, din linkul de confirmare. Rambursările se fac dacă anulezi în acest interval, conform politicii de anulare. Dacă întârzii prea mult pentru a desfășura consultația, o putem reprograma.'}
            </p>
          </Section>

          {/* Rambursare pe tip de produs — cerută de banca acceptatoare */}
          <Section
            id="rambursare"
            title={
              ru
                ? 'Возврат средств по видам услуг'
                : en
                  ? 'Refunds, by kind of purchase'
                  : 'Rambursarea, pe tipuri de achiziție'
            }
          >
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Возврат всегда идёт на ту же карту, которой была произведена оплата, и поступает в течение нескольких рабочих дней — срок зависит от вашего банка, а не от нас. Ниже — что именно возвращается для каждого вида покупки.'
                : en
                  ? 'A refund always goes back to the card the payment was made with, and lands within a few working days — the timing is your bank’s, not ours. What is refundable depends on what was bought.'
                  : 'Rambursarea se face întotdeauna pe cardul cu care s-a plătit și ajunge în câteva zile lucrătoare — termenul ține de banca ta, nu de noi. Mai jos, ce se rambursează pentru fiecare tip de achiziție.'}
            </p>
            <ul className="mt-8 grid gap-4">
              {REFUNDS.map((r) => (
                <li key={r.en} className="flex gap-3.5">
                  <Dot />
                  <span className="max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
                    {lc(r)}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Natura serviciilor medicale și limitele lor — CORE */}
          <Section
            id="natura"
            title={ru ? 'Характер медицинских услуг и их ограничения' : en ? 'The nature of the medical services & their limits' : 'Natura serviciilor medicale și limitele lor'}
          >
            <Callout
              tone="danger"
              label={ru ? 'Не для экстренных случаев' : en ? 'Not for emergencies' : 'Nu pentru urgențe'}
            >
              {ru
                ? 'Услуги не предназначены для экстренной медицинской помощи. В неотложной ситуации звоните 112 или обратитесь в ближайшую службу экстренной помощи.'
                : en
                  ? 'The services aren’t intended for medical emergencies. In an emergency, call 112 or go to the nearest emergency service.'
                  : 'Serviciile nu sunt destinate urgențelor medicale. În caz de urgență, sună la 112 sau mergi la cel mai apropiat serviciu de urgență.'}
            </Callout>
            <ul className="mt-8 grid gap-4">
              {NATURE.map((n) => (
                <li key={n.en} className="flex gap-3.5">
                  <Dot />
                  <span className="max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
                    {lc(n)}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Obligațiile tale */}
          <Section id="obligatii" title={ru ? 'Ваши обязанности' : en ? 'Your obligations' : 'Obligațiile tale'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Вы обязуетесь предоставлять точную и полную информацию о состоянии здоровья и пользоваться услугами добросовестно, в соответствии с настоящими Условиями.'
                : en
                  ? 'You agree to give accurate, complete information about your health and to use the services appropriately and in line with these terms.'
                  : 'Te angajezi să oferi informații corecte și complete despre starea de sănătate și să folosești serviciile în mod adecvat și conform acestor termeni.'}
            </p>
          </Section>

          {/* Limitarea răspunderii */}
          <Section id="raspundere" title={ru ? 'Ограничение ответственности' : en ? 'Limitation of liability' : 'Limitarea răspunderii'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'В пределах, допускаемых законом, наша ответственность ограничивается оказанием описанных здесь услуг. Настоящие Условия не ограничивают ваши права как потребителя.'
                : en
                  ? 'Within the limits allowed by law, our liability relates to the provision of the services described here. These terms don’t limit the rights you have as a consumer.'
                  : 'În limitele permise de lege, răspunderea noastră se referă la prestarea serviciilor descrise aici. Acești termeni nu limitează drepturile pe care le ai în calitate de consumator.'}
            </p>
          </Section>

          {/* Proprietate intelectuală */}
          <Section id="proprietate" title={ru ? 'Интеллектуальная собственность' : en ? 'Intellectual property' : 'Proprietate intelectuală'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Содержимое сайта — тексты, руководства, меню и статьи — принадлежит нам и не может быть воспроизведено или распространено без нашего согласия.'
                : en
                  ? 'The site’s content — text, guides, menus, and articles — belongs to us and may not be reproduced or distributed without our consent.'
                  : 'Conținutul site-ului — texte, ghiduri, meniuri și articole — ne aparține și nu poate fi reprodus sau distribuit fără acordul nostru.'}
            </p>
          </Section>

          {/* Confidențialitate */}
          <Section id="confidentialitate" title={ru ? 'Конфиденциальность' : en ? 'Privacy' : 'Confidențialitate'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru ? (
                <>
                  Порядок обработки ваших данных описан в{' '}
                  <Link href="/gdpr" className={inlineLink}>
                    Политике конфиденциальности
                  </Link>
                  .
                </>
              ) : en ? (
                <>
                  How we process your data is described in our{' '}
                  <Link href="/gdpr" className={inlineLink}>
                    Privacy Policy
                  </Link>
                  .
                </>
              ) : (
                <>
                  Prelucrarea datelor tale este descrisă în{' '}
                  <Link href="/gdpr" className={inlineLink}>
                    Politica de confidențialitate
                  </Link>
                  .
                </>
              )}
            </p>
          </Section>

          {/* Modificarea termenilor */}
          <Section id="modificari" title={ru ? 'Изменение условий' : en ? 'Changes to these terms' : 'Modificarea termenilor'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Мы можем обновлять настоящие Условия. Дата последнего обновления указана в верхней части страницы.'
                : en
                  ? 'We may update these terms. The date of the latest update is shown at the top of the page.'
                  : 'Putem actualiza acești termeni. Data ultimei actualizări este afișată în partea de sus a paginii.'}
            </p>
          </Section>

          {/* Legea aplicabilă */}
          <Section id="lege" title={ru ? 'Применимое право' : en ? 'Governing law' : 'Legea aplicabilă'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {ru
                ? 'Настоящие Условия регулируются законодательством Республики Молдова. Возможные споры разрешаются согласно закону, без ущемления ваших прав как потребителя.'
                : en
                  ? 'These terms are governed by the law of the Republic of Moldova. Any disputes are resolved in accordance with the law, without affecting your rights as a consumer.'
                  : 'Acești termeni sunt guvernați de legislația Republicii Moldova. Eventualele litigii se soluționează conform legii, fără a afecta drepturile tale de consumator.'}
            </p>
          </Section>

          {/* Contact */}
          <Section id="contact" title={ru ? 'Контакты' : en ? 'Contact' : 'Contact'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
              {ru ? 'По вопросам, связанным с настоящими Условиями, напишите нам на ' : en ? 'For questions about these terms, write to us at ' : 'Pentru întrebări despre acești termeni, scrie-ne la '}
              <a href={`mailto:${META.email}`} className={inlineLink}>
                {META.email}
              </a>
              .
            </p>
          </Section>
        </div>
      </section>

      {/* 4 · CTA — question about the terms (olive band) */}
      <section className="bg-sage-deep text-cream">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[34rem]">
              <h2 className="serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.04] tracking-[-0.02em] text-cream text-balance">
                {ru ? (
                  <>
                    Вопрос об <span className="serif-it text-[var(--sage-soft)]">условиях?</span>
                  </>
                ) : en ? (
                  <>
                    A question about <span className="serif-it text-[var(--sage-soft)]">the terms?</span>
                  </>
                ) : (
                  <>
                    O întrebare despre <span className="serif-it text-[var(--sage-soft)]">condiții?</span>
                  </>
                )}
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/contact" className={creamPill}>
                  {ru ? 'Напишите нам' : en ? 'Contact us' : 'Scrie-ne'}
                </Link>
                <Link href="/gdpr" className={creamUnderline}>
                  {ru ? 'Читать политику конфиденциальности →' : en ? 'Read the privacy policy →' : 'Vezi politica de confidențialitate →'}
                </Link>
              </div>
            </div>
            <p className="max-w-[28ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {ru
                ? 'Настоящие Условия применяются, когда вы записываетесь на наши услуги или пользуетесь ими.'
                : en
                  ? 'These terms apply when you book or use our services.'
                  : 'Acești termeni se aplică atunci când programezi sau folosești serviciile noastre.'}
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
  tone = 'sage',
  children,
}: {
  label: string;
  tone?: 'sage' | 'danger';
  children: React.ReactNode;
}) {
  const labelColor = tone === 'danger' ? 'text-[var(--danger)]' : 'text-sage-text';
  return (
    <div className="mt-6 rounded-2xl border border-[var(--rule)] bg-paper p-6 md:p-8">
      <p className={`mono mb-3 text-[11px] uppercase tracking-[0.12em] ${labelColor}`}>
        {label}
      </p>
      <p className="max-w-[64ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
        {children}
      </p>
    </div>
  );
}
