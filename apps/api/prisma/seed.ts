/**
 * Seed: bootstrap admin (closed registration needs one) + the 5 services.
 * Run: `pnpm exec tsx apps/api/prisma/seed.ts` with DATABASE_URL set.
 */
import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
});

const SERVICES = [
  {
    code: 'pediatric',
    group: 'A_booking',
    titleRo: 'Consultație pediatrică',
    titleEn: 'Pediatric consultation',
    descriptionRo: 'Evaluare completă a stării de sănătate a copilului.',
    descriptionEn: 'A comprehensive assessment of the child’s health.',
    durationMin: 50,
    price: 600,
    priceLabelRo: null,
    priceLabelEn: null,
    calendlyEventTypeUri: 'https://api.calendly.com/event_types/PEDIATRIC',
    sortOrder: 1,
    active: true,
  },
  {
    code: 'nutrition',
    group: 'A_booking',
    titleRo: 'Consultație nutrițională',
    titleEn: 'Nutrition consultation',
    descriptionRo: 'Plan alimentar adaptat vârstei și nevoilor copilului.',
    descriptionEn: 'A meal plan tailored to the child’s age and needs.',
    durationMin: 60,
    price: 700,
    priceLabelRo: null,
    priceLabelEn: null,
    calendlyEventTypeUri: 'https://api.calendly.com/event_types/NUTRITION',
    sortOrder: 2,
    active: true,
  },
  {
    code: 'integrative',
    group: 'A_booking',
    titleRo: 'Consultație integrativă & monitorizare',
    titleEn: 'Integrative consultation & monitoring',
    descriptionRo: 'Abordare integrativă a sănătății copilului.',
    descriptionEn: 'An integrative approach to the child’s health.',
    durationMin: 90,
    price: 1100,
    priceLabelRo: null,
    priceLabelEn: null,
    calendlyEventTypeUri: 'https://api.calendly.com/event_types/INTEGRATIVE',
    sortOrder: 3,
    active: true,
  },
  {
    code: 'monitoring',
    group: 'B_portal',
    titleRo: 'Monitorizare 3 luni',
    titleEn: '3-month monitoring',
    descriptionRo: 'Acompaniere timp de 3 luni: mesagerie și apeluri video.',
    descriptionEn: 'Three months of support: messaging and video calls.',
    durationMin: null,
    price: 2400,
    priceLabelRo: 'de la 2.400 lei / 3 luni',
    priceLabelEn: 'from 2,400 lei / 3 months',
    calendlyEventTypeUri: null,
    sortOrder: 4,
    active: true,
  },
  {
    code: 'quick_question',
    group: 'B_portal',
    titleRo: 'Întrebare rapidă',
    titleEn: 'Quick question',
    descriptionRo: 'Răspuns scris la o întrebare punctuală, în 48 de ore.',
    descriptionEn: 'A written answer to a specific question within 48 hours.',
    durationMin: null,
    price: 180,
    priceLabelRo: '48 h · răspuns scris',
    priceLabelEn: '48 h · written reply',
    calendlyEventTypeUri: null,
    sortOrder: 5,
    active: true,
  },
] as const;

const ABOUT = {
  titleRo: 'Despre Olesia',
  titleEn: 'About Olesia',
  contentRo: `## Cine sunt

Sunt medic pediatru cu o abordare **integrativă**, axată pe nutriție și pe dezvoltarea armonioasă a copilului.

Cred că fiecare familie merită sprijin clar, fără presiune și fără mituri. Lucrez alături de părinți pentru decizii informate și liniștite.

> Sănătatea copilului începe cu încredere și informație de calitate.`,
  contentEn: `## Who I am

I am a pediatrician with an **integrative** approach, focused on nutrition and the harmonious development of the child.

I believe every family deserves clear support, without pressure and without myths. I work alongside parents toward informed, calm decisions.

> A child's health begins with trust and quality information.`,
  images: [] as string[],
  stats: [
    { value: '12+', labelRo: 'ani de practică', labelEn: 'years in practice' },
    { value: '24h', labelRo: 'timp de răspuns', labelEn: 'response time' },
    { value: '100%', labelRo: 'consultații online', labelEn: 'online consultations' },
    { value: 'RO · EN', labelRo: 'limbi de comunicare', labelEn: 'languages' },
  ],
  credentials: [
    { ro: 'Medic pediatru, diplomă USMF', en: 'Pediatrician, USMF degree' },
    { ro: 'Formare în nutriție pediatrică', en: 'Pediatric nutrition training' },
    {
      ro: 'Abordare integrativă & monitorizare',
      en: 'Integrative approach & monitoring',
    },
  ],
  testimonials: [
    {
      quoteRo:
        'Am plecat de la consultație cu un plan clar și fără anxietate. Bebelușul doarme mult mai bine.',
      quoteEn:
        'I left the consultation with a clear plan and no anxiety. Our baby sleeps much better now.',
      author: 'Maria I.',
      roleRo: 'mamă, Chișinău',
      roleEn: 'mother, Chișinău',
    },
    {
      quoteRo:
        'Explică pe înțelesul tuturor, cu răbdare. Diversificarea a devenit simplă.',
      quoteEn:
        'Explains everything clearly and patiently. Weaning finally became simple.',
      author: 'Andrei P.',
      roleRo: 'tată',
      roleEn: 'father',
    },
    {
      quoteRo:
        'Răspuns rapid la întrebări și recomandări exact pe nevoile noastre.',
      quoteEn:
        'Quick answers to questions and advice tailored exactly to our needs.',
      author: 'Elena R.',
      roleRo: 'mamă',
      roleEn: 'mother',
    },
  ],
  faq: [
    {
      qRo: 'Cum decurge o consultație online?',
      qEn: 'How does an online consultation work?',
      aRo: 'Pe apel video, prin link-ul primit după rezervare. Discutăm situația, iar după consultație primești un plan scris.',
      aEn: 'Over a video call, via the link you receive after booking. We discuss the situation and you get a written plan afterwards.',
    },
    {
      qRo: 'Cât durează și cât costă?',
      qEn: 'How long and how much?',
      aRo: 'Între 50 și 90 de minute, în funcție de serviciu. Tarifele sunt afișate transparent pe pagina Tarife.',
      aEn: 'Between 50 and 90 minutes depending on the service. Prices are listed transparently on the Pricing page.',
    },
    {
      qRo: 'Cum se face plata?',
      qEn: 'How is payment handled?',
      aRo: 'Plata se confirmă manual după programare, prin transfer. Primești instrucțiunile la rezervare.',
      aEn: 'Payment is confirmed manually after booking, by transfer. You receive the details when you book.',
    },
    {
      qRo: 'Pot pune o singură întrebare, fără consultație?',
      qEn: 'Can I ask just one question, without a consultation?',
      aRo: 'Da — serviciul „Întrebare rapidă" îți oferă un răspuns scris în maximum 48 de ore.',
      aEn: 'Yes — the "Quick question" service gives you a written answer within 48 hours.',
    },
    {
      qRo: 'Prima discuție chiar este gratuită?',
      qEn: 'Is the first call really free?',
      aRo: 'Da, 15 minute de orientare pentru a alege serviciul potrivit, fără obligații.',
      aEn: 'Yes, 15 minutes of orientation to choose the right service, with no obligations.',
    },
    {
      qRo: 'Lucrezi în română și engleză?',
      qEn: 'Do you work in Romanian and English?',
      aRo: 'Da, consultațiile și materialele sunt disponibile în ambele limbi.',
      aEn: 'Yes, consultations and materials are available in both languages.',
    },
  ],
};

/**
 * Seed the About singleton. Only writes defaults when the row is missing or
 * still empty, so re-running never clobbers content the client has edited.
 */
async function seedAbout() {
  const existing = await prisma.aboutPage.findFirst();
  if (!existing) {
    await prisma.aboutPage.create({ data: ABOUT });
    console.log('✓ about page created');
    return;
  }
  const len = (v: unknown) => (Array.isArray(v) ? v.length : 0);
  // Backfill only the blocks that are still empty — never clobber edited text.
  const patch: Record<string, unknown> = {};
  if (!existing.contentRo.trim()) {
    patch.titleRo = ABOUT.titleRo;
    patch.titleEn = ABOUT.titleEn;
    patch.contentRo = ABOUT.contentRo;
    patch.contentEn = ABOUT.contentEn;
  }
  if (len(existing.stats) === 0) patch.stats = ABOUT.stats;
  if (len(existing.credentials) === 0) patch.credentials = ABOUT.credentials;
  if (len(existing.testimonials) === 0)
    patch.testimonials = ABOUT.testimonials;
  if (len(existing.faq) === 0) patch.faq = ABOUT.faq;

  if (Object.keys(patch).length > 0) {
    await prisma.aboutPage.update({ where: { id: existing.id }, data: patch });
    console.log(`✓ about page backfilled (${Object.keys(patch).join(', ')})`);
  } else {
    console.log('• about page already populated — left untouched');
  }
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@olesia.md').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'admin12345';

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Administrator',
      role: 'admin',
      passwordHash: await argon2.hash(password),
    },
  });
  console.log(`✓ admin ready: ${admin.email}`);

  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
  }
  console.log(`✓ seeded ${SERVICES.length} services`);

  await seedAbout();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
