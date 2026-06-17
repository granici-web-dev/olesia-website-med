import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';

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

const META = {
  operator: 'Dr. Olesea Jalba', // ⚠ confirm legal entity / operator name with client + lawyer
  email: 'contact@oleseajalba.md', // matches Footer; ⚠ confirm dedicated data-protection mailbox
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
      ? 'Privacy Policy | Dr. Olesea Jalba'
      : 'Politica de confidențialitate | Dr. Olesea Jalba',
    description: en
      ? 'How we collect, use, and protect your data — including health data and data about your child — and the rights you have.'
      : 'Cum colectăm, folosim și protejăm datele tale, inclusiv datele despre sănătate și despre copil, și drepturile pe care le ai.',
  };
}

interface TocItem {
  id: string;
  ro: string;
  en: string;
}

const TOC: TocItem[] = [
  { id: 'pe-scurt', ro: 'Pe scurt', en: 'In short' },
  { id: 'date', ro: 'Ce date colectăm', en: 'What we collect' },
  { id: 'temei', ro: 'Temeiul prelucrării', en: 'Why & legal basis' },
  { id: 'transfer', ro: 'Cui transmitem datele', en: 'Who we share with' },
  { id: 'pastrare', ro: 'Cât timp păstrăm', en: 'How long we keep it' },
  { id: 'drepturi', ro: 'Drepturile tale', en: 'Your rights' },
  { id: 'copii', ro: 'Datele copiilor', en: 'Children’s data' },
  { id: 'securitate', ro: 'Securitate', en: 'Security' },
  { id: 'cookies', ro: 'Cookie-uri', en: 'Cookies' },
  { id: 'modificari', ro: 'Modificări', en: 'Changes' },
  { id: 'contact', ro: 'Contact', en: 'Contact' },
];

type Bi = { ro: string; en: string };

const SUMMARY: Bi[] = [
  {
    ro: 'Colectăm doar datele necesare pentru a-ți oferi consultații și a răspunde întrebărilor tale.',
    en: 'We collect only the data needed to offer consultations and answer your questions.',
  },
  {
    ro: 'Unele date sunt despre sănătate și despre copilul tău — le tratăm cu grijă deosebită.',
    en: 'Some data is about health and about your child — we treat it with special care.',
  },
  {
    ro: 'Nu vindem datele tale și nu le folosim pentru marketingul terților.',
    en: 'We don’t sell your data or use it for third-party marketing.',
  },
  {
    ro: 'Ai dreptul să le accesezi, corectezi sau ștergi oricând.',
    en: 'You can access, correct, or delete it at any time.',
  },
  {
    ro: 'Pentru orice întrebare despre date, ne poți scrie la ' + META.email + '.',
    en: 'For any question about your data, write to us at ' + META.email + '.',
  },
];

const DATA: { term: Bi; desc: Bi }[] = [
  {
    term: { ro: 'Date de identificare și contact', en: 'Identity & contact data' },
    desc: {
      ro: 'nume, e-mail, telefon — la programare, prin formularul de contact sau la „Întreabă medicul”.',
      en: 'name, email, phone — when booking, via the contact form, or through “Ask the doctor”.',
    },
  },
  {
    term: { ro: 'Date despre sănătate', en: 'Health data' },
    desc: {
      ro: 'simptome, istoric, documente sau poze încărcate, conținutul consultațiilor și datele de monitorizare.',
      en: 'symptoms, history, uploaded documents or photos, the content of consultations, and monitoring data.',
    },
  },
  {
    term: { ro: 'Date despre copil', en: 'Data about your child' },
    desc: {
      ro: 'furnizate de părinte sau de reprezentantul legal.',
      en: 'provided by the parent or legal guardian.',
    },
  },
  {
    term: { ro: 'Date de programare', en: 'Booking data' },
    desc: {
      ro: 'gestionate prin Calendly, la rezervarea unei consultații video.',
      en: 'handled through Calendly when you book a video consultation.',
    },
  },
  {
    term: { ro: 'Date de plată', en: 'Payment data' },
    desc: {
      ro: 'nume și detaliile transferului bancar. Nu colectăm date de card — nu există plată online.',
      en: 'name and bank-transfer details. We don’t collect card data — there is no online payment.',
    },
  },
  {
    term: { ro: 'Date tehnice', en: 'Technical data' },
    desc: {
      ro: 'cookie-uri, adresă IP și statistici de utilizare a site-ului.',
      en: 'cookies, IP address, and site-usage statistics.',
    },
  },
];

const BASIS: Bi[] = [
  {
    ro: 'Pentru a-ți presta serviciul — programări, consultații și răspunsuri (executarea contractului).',
    en: 'To deliver the service — bookings, consultations, and answers (performance of the contract).',
  },
  {
    ro: 'Pentru datele despre sănătate — pe baza consimțământului tău explicit și a prestării de servicii de sănătate.',
    en: 'For health data — based on your explicit consent and the provision of healthcare services.',
  },
  {
    ro: 'Pentru obligații legale — păstrarea documentației medicale impusă de lege.',
    en: 'For legal obligations — keeping medical records as required by law.',
  },
  {
    ro: 'Pe baza consimțământului — pentru newsletter sau ghiduri, dacă te abonezi.',
    en: 'Based on consent — for newsletter or guides, if you subscribe.',
  },
];

const SHARE: Bi[] = [
  {
    ro: 'Calendly — pentru programări (poate implica transferul datelor în afara Moldovei).',
    en: 'Calendly — for bookings (may involve transferring data outside Moldova).',
  },
  {
    ro: 'Furnizorul de găzduire — pentru a rula site-ul.',
    en: 'Our hosting provider — to run the website.',
  },
  {
    ro: 'Furnizorul de e-mail — pentru confirmări și corespondență.',
    en: 'Our email provider — for confirmations and correspondence.',
  },
  {
    ro: 'Banca — pentru plata prin transfer.',
    en: 'The bank — for payment by transfer.',
  },
];

const RIGHTS: { term: Bi; desc: Bi }[] = [
  {
    term: { ro: 'Acces', en: 'Access' },
    desc: { ro: 'să afli ce date avem despre tine', en: 'find out what data we hold about you' },
  },
  {
    term: { ro: 'Rectificare', en: 'Rectification' },
    desc: { ro: 'să corectezi date inexacte', en: 'correct inaccurate data' },
  },
  {
    term: { ro: 'Ștergere', en: 'Erasure' },
    desc: { ro: 'să ceri ștergerea datelor', en: 'request deletion of your data' },
  },
  {
    term: { ro: 'Restricționare', en: 'Restriction' },
    desc: { ro: 'să limitezi prelucrarea', en: 'limit how we process it' },
  },
  {
    term: { ro: 'Portabilitate', en: 'Portability' },
    desc: { ro: 'să primești datele într-un format uzual', en: 'receive your data in a common format' },
  },
  {
    term: { ro: 'Opoziție', en: 'Objection' },
    desc: { ro: 'să te opui anumitor prelucrări', en: 'object to certain processing' },
  },
  {
    term: { ro: 'Retragerea consimțământului', en: 'Withdraw consent' },
    desc: {
      ro: 'oricând, fără a afecta prelucrarea anterioară',
      en: 'at any time, without affecting prior processing',
    },
  },
];

const creamPill =
  'inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-soft)]';
const creamUnderline =
  'inline-block cursor-pointer border-b border-[var(--sage-soft)] pb-0.5 text-sm text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage-soft)]';

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
  const lc = (b: Bi) => (en ? b.en : b.ro);

  return (
    <main className="bg-cream text-ink">
      {/* 1 · Hero — title + operator meta */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-20 md:py-28">
          <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span className="size-1.5 rounded-full bg-sage" aria-hidden="true" />
            {en ? 'Privacy' : 'Confidențialitate'}
          </p>
          <div className="grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 lg:gap-20">
            <h1 className="serif max-w-[15ch] text-[clamp(2.5rem,5.6vw,5rem)] leading-[1.04] tracking-[-0.015em] text-balance">
              {en ? (
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
                {en
                  ? 'How we collect, use, and protect your data — including health data and data about your child.'
                  : 'Cum colectăm, folosim și protejăm datele tale — inclusiv datele despre sănătate și despre copilul tău.'}
              </p>
              <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[0.9375rem]">
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {en ? 'Operator' : 'Operator'}
                </dt>
                <dd className="text-ink">{META.operator}</dd>
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {en ? 'Updated' : 'Actualizat'}
                </dt>
                <dd className="text-ink">{en ? META.updatedEn : META.updatedRo}</dd>
                <dt className="mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {en ? 'Contact' : 'Contact'}
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
            {en ? 'In short' : 'Pe scurt'}
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
          {/* Ce date colectăm */}
          <Section id="date" title={en ? 'What we collect' : 'Ce date colectăm'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
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
              label={en ? 'Special category' : 'Categorie specială de date'}
            >
              {en
                ? 'Health data and children’s data are special categories with extra protection. We process them only on the basis of your explicit consent and to provide healthcare services.'
                : 'Datele despre sănătate și datele copiilor sunt categorii speciale, protejate suplimentar. Le prelucrăm doar pe baza consimțământului tău explicit și pentru a-ți oferi servicii de sănătate.'}
            </Callout>
          </Section>

          {/* Temeiul prelucrării */}
          <Section
            id="temei"
            title={en ? 'Why we process data & on what basis' : 'De ce prelucrăm datele și pe ce temei'}
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
          <Section id="transfer" title={en ? 'Who we share data with' : 'Cui transmitem datele'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
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
              {en
                ? 'We don’t sell your data and don’t pass it on for third parties’ marketing. Some transfers may take place outside Moldova; where they do, we apply the safeguards required by law.'
                : 'Nu vindem datele tale și nu le transmitem în scopuri de marketing ale terților. Unele transferuri pot avea loc în afara Moldovei; atunci aplicăm garanțiile cerute de lege.'}
            </p>
          </Section>

          {/* Cât timp păstrăm */}
          <Section id="pastrare" title={en ? 'How long we keep it' : 'Cât timp păstrăm datele'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'We keep your data only as long as needed for the purposes described here and for the periods required by law for medical records. After that, we delete or anonymise it.'
                : 'Păstrăm datele doar atât timp cât este necesar pentru scopurile descrise aici și pentru termenele impuse de lege în cazul documentației medicale. După aceea, le ștergem sau le anonimizăm.'}
            </p>
          </Section>

          {/* Drepturile tale */}
          <Section id="drepturi" title={en ? 'Your rights' : 'Drepturile tale'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en ? 'You have the right to:' : 'Ai dreptul la:'}
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
              {en
                ? 'You can also lodge a complaint with the National Centre for Personal Data Protection (CNPDCP).'
                : 'Poți depune o plângere la Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP).'}
            </p>
            <p className="mt-4 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
              {en ? 'To exercise your rights, write to us at ' : 'Pentru a-ți exercita drepturile, scrie-ne la '}
              <a
                href={`mailto:${META.email}`}
                className="text-sage-text underline decoration-[var(--sage-soft)] underline-offset-4 transition-colors hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                {META.email}
              </a>
              {en ? ' or via the ' : ' sau prin pagina de '}
              <Link
                href="/contact"
                className="text-sage-text underline decoration-[var(--sage-soft)] underline-offset-4 transition-colors hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                {en ? 'Contact page' : 'Contact'}
              </Link>
              .
            </p>
          </Section>

          {/* Datele copiilor — emphasised */}
          <Section id="copii" title={en ? 'Children’s data' : 'Datele copiilor'}>
            <div className="mt-6 rounded-2xl border border-[var(--rule)] bg-paper p-6 md:p-8">
              <p className="mono mb-3 text-[11px] uppercase tracking-[0.12em] text-sage-text">
                {en ? 'Handled with special care' : 'Tratate cu grijă deosebită'}
              </p>
              <p className="max-w-[64ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
                {en
                  ? 'Our services often concern children. Data about a child is provided by the parent or legal guardian, who confirms they have the right to provide it. We use this data only for the consultation and ongoing care.'
                  : 'Serviciile noastre privesc adesea copii. Datele despre un copil sunt furnizate de părinte sau de reprezentantul legal, care confirmă că are dreptul să le ofere. Folosim aceste date doar pentru consultație și îngrijire.'}
              </p>
            </div>
          </Section>

          {/* Securitate */}
          <Section id="securitate" title={en ? 'Data security' : 'Securitatea datelor'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'We apply technical and organisational measures to protect your data: restricted access, secure storage, and encrypted transmission. No system is perfect, but we treat data protection as a priority.'
                : 'Aplicăm măsuri tehnice și organizatorice pentru a-ți proteja datele: acces restricționat, stocare securizată și transmitere criptată. Niciun sistem nu este perfect, dar tratăm protecția datelor ca pe o prioritate.'}
            </p>
          </Section>

          {/* Cookie-uri */}
          <Section id="cookies" title={en ? 'Cookies' : 'Cookie-uri'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'We use cookies for the site to function and, if you accept, for usage statistics. You can manage your preferences at any time.'
                : 'Folosim cookie-uri pentru funcționarea site-ului și, dacă accepți, pentru statistici de utilizare. Îți poți gestiona preferințele în orice moment.'}
            </p>
          </Section>

          {/* Modificări */}
          <Section id="modificari" title={en ? 'Changes' : 'Modificări'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              {en
                ? 'We may update this policy. The date of the latest update is shown at the top of the page.'
                : 'Putem actualiza această politică. Data ultimei actualizări este afișată în partea de sus a paginii.'}
            </p>
          </Section>

          {/* Contact */}
          <Section id="contact" title={en ? 'Contact' : 'Contact'}>
            <p className="mt-5 max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink text-pretty">
              {en
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
                {en ? (
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
                  {en ? 'Contact us' : 'Scrie-ne'}
                </Link>
                <a href={`mailto:${META.email}`} className={creamUnderline}>
                  {META.email} →
                </a>
              </div>
            </div>
            <p className="max-w-[28ch] text-sm leading-[1.7] text-[var(--sage-soft)] text-pretty md:text-right">
              {en
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
