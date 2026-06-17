import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';

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

const META = {
  provider: 'Dr. Olesea Jalba', // ⚠ confirm legal entity / provider name with client + lawyer
  email: 'contact@oleseajalba.md', // matches Footer; ⚠ confirm contact mailbox
  updatedRo: '17 iunie 2026', // ⚠ bump on every revision
  updatedEn: '17 June 2026',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  return {
    title: en
      ? 'Terms & Conditions | Dr. Olesea Jalba'
      : 'Termeni și condiții | Dr. Olesea Jalba',
    description: en
      ? 'Terms of use for online consultation services — booking, payment, cancellation, and the limits of the medical services.'
      : 'Condițiile de utilizare a serviciilor de consultații online — programare, plată, anulare și limitele serviciilor medicale.',
  };
}

interface TocItem {
  id: string;
  ro: string;
  en: string;
}

const TOC: TocItem[] = [
  { id: 'pe-scurt', ro: 'Pe scurt', en: 'In short' },
  { id: 'servicii', ro: 'Serviciile oferite', en: 'The services' },
  { id: 'utilizatori', ro: 'Cine poate folosi', en: 'Who can use them' },
  { id: 'programare', ro: 'Programare', en: 'Booking' },
  { id: 'plata', ro: 'Plată', en: 'Payment' },
  { id: 'anulare', ro: 'Anulare și rambursare', en: 'Cancellation & refunds' },
  { id: 'natura', ro: 'Natura serviciilor', en: 'Nature of the services' },
  { id: 'obligatii', ro: 'Obligațiile tale', en: 'Your obligations' },
  { id: 'raspundere', ro: 'Răspundere', en: 'Liability' },
  { id: 'proprietate', ro: 'Proprietate intelectuală', en: 'Intellectual property' },
  { id: 'confidentialitate', ro: 'Confidențialitate', en: 'Privacy' },
  { id: 'modificari', ro: 'Modificări', en: 'Changes' },
  { id: 'lege', ro: 'Legea aplicabilă', en: 'Governing law' },
  { id: 'contact', ro: 'Contact', en: 'Contact' },
];

type Bi = { ro: string; en: string };

const SUMMARY: Bi[] = [
  {
    ro: 'Acești termeni reglementează folosirea serviciilor noastre.',
    en: 'These terms govern how you use our services.',
  },
  {
    ro: 'Consultațiile online au limite și nu sunt pentru urgențe — în caz de urgență, sună la 112.',
    en: 'Online consultations have limits and aren’t for emergencies — in an emergency, call 112.',
  },
  {
    ro: 'Plata se face prin transfer bancar, înainte de consultație.',
    en: 'Payment is by bank transfer, before the consultation.',
  },
  {
    ro: 'Poți anula sau reprograma cu cel puțin 24 de ore înainte.',
    en: 'You can cancel or reschedule at least 24 hours in advance.',
  },
  {
    ro: 'Pentru copii, serviciile sunt solicitate de un părinte sau reprezentant legal.',
    en: 'For children, services are requested by a parent or legal guardian.',
  },
];

const NATURE: Bi[] = [
  {
    ro: 'Consultațiile online au limite și nu înlocuiesc o examinare fizică atunci când aceasta este necesară.',
    en: 'Online consultations have limits and don’t replace a physical examination when one is needed.',
  },
  {
    ro: 'Medicul poate stabili că situația necesită o consultație în persoană sau investigații suplimentare și te poate îndruma în acest sens.',
    en: 'The doctor may determine that the situation needs an in-person consultation or further tests, and will guide you accordingly.',
  },
  {
    ro: 'Nu garantăm un anumit rezultat medical.',
    en: 'We don’t guarantee any particular medical outcome.',
  },
  {
    ro: 'Materialele informative — ghiduri, meniuri, articole — au caracter general și nu reprezintă sfaturi medicale personalizate.',
    en: 'Informational materials — guides, menus, articles — are general in nature and aren’t personalised medical advice.',
  },
  {
    // ⚠ prescriptions: confirm MD telemedicine regulations with lawyer
    ro: 'Eliberarea rețetelor depinde de situație și de reglementările aplicabile.',
    en: 'Whether a prescription is issued depends on the situation and the applicable regulations.',
  },
];

const creamPill =
  'inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-soft)]';
const creamUnderline =
  'inline-block cursor-pointer border-b border-[var(--sage-soft)] pb-0.5 text-sm text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage-soft)]';
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
  const en = locale === 'en';
  const lc = (b: Bi) => (en ? b.en : b.ro);

  return (
    <main className="bg-cream text-ink">
      {/* 1 · Hero — title + provider meta */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {en ? 'Terms' : 'Termeni'}
          </p>
          <div className="grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 lg:gap-20">
            <h1 className="serif max-w-[15ch] text-[clamp(2.5rem,5.6vw,5rem)] leading-[1.04] tracking-[-0.015em] text-balance">
              {en ? (
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
                {en
                  ? 'The terms for using our online consultation services — booking, payment, cancellation, and the limits of the medical services.'
                  : 'Condițiile de utilizare a serviciilor noastre de consultații online — programare, plată, anulare și limitele serviciilor medicale.'}
              </p>
              <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[0.9375rem]">
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {en ? 'Provider' : 'Furnizor'}
                </dt>
                <dd className="text-ink">{META.provider}</dd>
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {en ? 'Updated' : 'Actualizat'}
                </dt>
                <dd className="text-ink">{en ? META.updatedEn : META.updatedRo}</dd>
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {en ? 'Contact' : 'Contact'}
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
            {en ? 'In short' : 'Pe scurt'}
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
          aria-label={en ? 'Sections' : 'Secțiuni'}
          className="min-w-0 md:sticky md:top-28 md:self-start"
        >
          <p className="eyebrow mb-4">{en ? 'Contents' : 'Cuprins'}</p>
          <ul className="flex flex-wrap gap-2 md:flex-col md:flex-nowrap md:gap-1">
            {TOC.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="mono inline-block whitespace-nowrap rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:rounded-none md:border-0 md:border-l md:px-3 md:py-1.5 md:text-[12px] md:normal-case md:tracking-normal"
                >
                  {en ? item.en : item.ro}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          {/* Serviciile oferite */}
          <Section id="servicii" title={en ? 'The services we offer' : 'Serviciile oferite'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en ? (
                <>
                  We offer video consultations — pediatric, nutrition, and integrative —
                  and portal-based services: “Ask the doctor” and 3-month monitoring. The
                  details and duration of each service are described on the{' '}
                  <Link href="/services" className={inlineLink}>
                    Services
                  </Link>{' '}
                  page.
                </>
              ) : (
                <>
                  Oferim consultații video — pediatrică, de nutriție și integrativă — și
                  servicii prin portal: „Întreabă medicul” și monitorizare de 3 luni.
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
          <Section id="utilizatori" title={en ? 'Who can use the services' : 'Cine poate folosi serviciile'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'For services intended for children, booking and acceptance of these terms are done by a parent or legal guardian, who confirms they have the right to act on the child’s behalf.'
                : 'Pentru serviciile destinate copiilor, programarea și acceptarea acestor termeni se fac de către un părinte sau reprezentantul legal, care confirmă că are dreptul să acționeze în numele copilului.'}
            </p>
          </Section>

          {/* Programare și confirmare */}
          <Section id="programare" title={en ? 'Booking & confirmation' : 'Programare și confirmare'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'You book video consultations through Calendly and receive a confirmation of the time you chose. For portal-based services, you send a request or a question.'
                : 'Programarea consultațiilor video se face prin Calendly; vei primi o confirmare a orei alese. Pentru serviciile prin portal, trimiți o solicitare sau o întrebare.'}
            </p>
          </Section>

          {/* Plată */}
          <Section id="plata" title={en ? 'Payment' : 'Plată'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en ? (
                <>
                  Payment is made exclusively by bank transfer — there is no online payment —
                  and is due before the consultation, once the booking is confirmed. Prices
                  are shown for each service and on the{' '}
                  <Link href="/pricing" className={inlineLink}>
                    Pricing
                  </Link>{' '}
                  page. You receive a payment confirmation by email.
                </>
              ) : (
                <>
                  Plata se face exclusiv prin transfer bancar — nu există plată online — și se
                  achită înainte de consultație, după confirmarea programării. Prețurile sunt
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
            title={en ? 'Cancellation, rescheduling & refunds' : 'Anulare, reprogramare și rambursare'}
          >
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'You can cancel or reschedule a consultation at least 24 hours before the scheduled time, from your confirmation link. Refunds are made if you cancel within this window, per the cancellation policy. If you’re too late for the consultation to take place, we can reschedule it.'
                : 'Poți anula sau reprograma o consultație cu cel puțin 24 de ore înainte de ora programată, din linkul de confirmare. Rambursările se fac dacă anulezi în acest interval, conform politicii de anulare. Dacă întârzii prea mult pentru a desfășura consultația, o putem reprograma.'}
            </p>
          </Section>

          {/* Natura serviciilor medicale și limitele lor — CORE */}
          <Section
            id="natura"
            title={en ? 'The nature of the medical services & their limits' : 'Natura serviciilor medicale și limitele lor'}
          >
            <Callout
              tone="danger"
              label={en ? 'Not for emergencies' : 'Nu pentru urgențe'}
            >
              {en
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
          <Section id="obligatii" title={en ? 'Your obligations' : 'Obligațiile tale'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'You agree to give accurate, complete information about your health and to use the services appropriately and in line with these terms.'
                : 'Te angajezi să oferi informații corecte și complete despre starea de sănătate și să folosești serviciile în mod adecvat și conform acestor termeni.'}
            </p>
          </Section>

          {/* Limitarea răspunderii */}
          <Section id="raspundere" title={en ? 'Limitation of liability' : 'Limitarea răspunderii'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'Within the limits allowed by law, our liability relates to the provision of the services described here. These terms don’t limit the rights you have as a consumer.'
                : 'În limitele permise de lege, răspunderea noastră se referă la prestarea serviciilor descrise aici. Acești termeni nu limitează drepturile pe care le ai în calitate de consumator.'}
            </p>
          </Section>

          {/* Proprietate intelectuală */}
          <Section id="proprietate" title={en ? 'Intellectual property' : 'Proprietate intelectuală'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'The site’s content — text, guides, menus, and articles — belongs to us and may not be reproduced or distributed without our consent.'
                : 'Conținutul site-ului — texte, ghiduri, meniuri și articole — ne aparține și nu poate fi reprodus sau distribuit fără acordul nostru.'}
            </p>
          </Section>

          {/* Confidențialitate */}
          <Section id="confidentialitate" title={en ? 'Privacy' : 'Confidențialitate'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en ? (
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
          <Section id="modificari" title={en ? 'Changes to these terms' : 'Modificarea termenilor'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'We may update these terms. The date of the latest update is shown at the top of the page.'
                : 'Putem actualiza acești termeni. Data ultimei actualizări este afișată în partea de sus a paginii.'}
            </p>
          </Section>

          {/* Legea aplicabilă */}
          <Section id="lege" title={en ? 'Governing law' : 'Legea aplicabilă'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'These terms are governed by the law of the Republic of Moldova. Any disputes are resolved in accordance with the law, without affecting your rights as a consumer.'
                : 'Acești termeni sunt guvernați de legislația Republicii Moldova. Eventualele litigii se soluționează conform legii, fără a afecta drepturile tale de consumator.'}
            </p>
          </Section>

          {/* Contact */}
          <Section id="contact" title={en ? 'Contact' : 'Contact'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
              {en ? 'For questions about these terms, write to us at ' : 'Pentru întrebări despre acești termeni, scrie-ne la '}
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
                {en ? (
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
                  {en ? 'Contact us' : 'Scrie-ne'}
                </Link>
                <Link href="/gdpr" className={creamUnderline}>
                  {en ? 'Read the privacy policy →' : 'Vezi politica de confidențialitate →'}
                </Link>
              </div>
            </div>
            <p className="max-w-[28ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {en
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
      <h2 className="serif text-[clamp(1.7rem,3vw,2.4rem)] leading-tight tracking-[-0.02em] text-balance">
        {title}
      </h2>
      {children}
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
