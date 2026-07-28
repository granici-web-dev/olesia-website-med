/**
 * Seed: bootstrap admin (closed registration needs one) + the 5 services.
 * Run: `pnpm exec tsx apps/api/prisma/seed.ts` with DATABASE_URL set.
 */
import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { FAQ_SECTIONS } from './seed-faq';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
});

const SERVICES = [
  {
    code: 'pediatric',
    group: 'A_booking',
    titleRo: 'Consultație pediatrică',
    titleEn: 'Pediatric consultation',
    titleRu: 'Педиатрическая консультация',
    descriptionRo: 'Evaluare completă a stării de sănătate a copilului.',
    descriptionEn: 'A comprehensive assessment of the child’s health.',
    descriptionRu: 'Полная оценка состояния здоровья ребёнка.',
    durationMin: 30,
    price: 28,
    priceLabelRo: null,
    priceLabelEn: null,
    priceLabelRu: null,
    calendlyEventTypeUri:
      'https://api.calendly.com/event_types/615c76de-63dd-4870-b3c5-141aef15a844',
    calendlySchedulingUrl:
      'https://calendly.com/designer-nefele/consulta-ie-pediatrica-clone',
    sortOrder: 1,
    active: true,
  },
  {
    code: 'nutrition',
    group: 'A_booking',
    titleRo: 'Consultație nutrițională',
    titleEn: 'Nutrition consultation',
    titleRu: 'Консультация по питанию',
    descriptionRo: 'Plan alimentar adaptat vârstei și nevoilor copilului.',
    descriptionEn: 'A meal plan tailored to the child’s age and needs.',
    descriptionRu: 'План питания с учётом возраста и потребностей ребёнка.',
    durationMin: 60,
    price: 38,
    priceLabelRo: null,
    priceLabelEn: null,
    priceLabelRu: null,
    calendlyEventTypeUri:
      'https://api.calendly.com/event_types/25950172-362c-43cf-aeea-323ac47d961c',
    calendlySchedulingUrl:
      'https://calendly.com/designer-nefele/consulta-ie-nutri-ionala-clone',
    sortOrder: 2,
    active: true,
  },
  {
    code: 'integrative',
    group: 'A_booking',
    titleRo: 'Consultație integrativă & monitorizare',
    titleEn: 'Integrative consultation & monitoring',
    titleRu: 'Интегративная консультация и наблюдение',
    descriptionRo: 'Abordare integrativă a sănătății copilului.',
    descriptionEn: 'An integrative approach to the child’s health.',
    descriptionRu: 'Интегративный подход к здоровью ребёнка.',
    durationMin: 90,
    price: 58,
    priceLabelRo: null,
    priceLabelEn: null,
    priceLabelRu: null,
    calendlyEventTypeUri:
      'https://api.calendly.com/event_types/02306705-7d03-4bfa-bdbd-b6548b519771',
    calendlySchedulingUrl:
      'https://calendly.com/designer-nefele/consulta-ie-integrativa-monitorizare-clone',
    sortOrder: 3,
    active: true,
  },
  {
    code: 'monitoring',
    group: 'B_portal',
    titleRo: 'Monitorizare 3 luni',
    titleEn: '3-month monitoring',
    titleRu: 'Наблюдение 3 месяца',
    descriptionRo: 'Acompaniere timp de 3 luni: mesagerie și apeluri video.',
    descriptionEn: 'Three months of support: messaging and video calls.',
    descriptionRu: 'Сопровождение 3 месяца: переписка и видеозвонки.',
    durationMin: null,
    price: 0,
    priceLabelRo: 'Preț la cerere',
    priceLabelEn: 'Price on request',
    priceLabelRu: 'Цена по запросу',
    calendlyEventTypeUri: null,
    calendlySchedulingUrl: null,
    sortOrder: 4,
    active: true,
  },
  {
    code: 'quick_question',
    group: 'B_portal',
    titleRo: 'Întrebare EXPRESS',
    titleEn: 'Express question',
    titleRu: 'Вопрос EXPRESS',
    descriptionRo: 'Răspuns scris la o întrebare punctuală, în ~1 oră în timpul programului de lucru.',
    descriptionEn: 'A written answer to a specific question, within ~1 hour during working hours.',
    descriptionRu:
      'Письменный ответ на конкретный вопрос примерно за 1 час в рабочее время.',
    durationMin: null,
    price: 8,
    priceLabelRo: '~1 h · răspuns scris',
    priceLabelEn: '~1 h · written reply',
    priceLabelRu: '~1 ч · письменный ответ',
    calendlyEventTypeUri: null,
    calendlySchedulingUrl: null,
    sortOrder: 5,
    active: true,
  },
  {
    // Free 30-min orientation call. Group A (Calendly) so bookings land in the
    // back office via the webhook, but `active: false` keeps it out of the
    // public pricing grid — it has its own dedicated section on the site.
    code: 'free_consult',
    group: 'A_booking',
    titleRo: 'Consultație gratuită',
    titleEn: 'Free consultation',
    titleRu: 'Бесплатная консультация',
    descriptionRo:
      'Discuție scurtă de orientare, fără cost — pentru a alege serviciul potrivit.',
    descriptionEn:
      'A short, no-cost orientation call — to help choose the right service.',
    descriptionRu:
      'Короткий ознакомительный разговор без оплаты — чтобы выбрать подходящую услугу.',
    durationMin: 30,
    price: 0,
    priceLabelRo: 'Gratuit · 30 min',
    priceLabelEn: 'Free · 30 min',
    priceLabelRu: 'Бесплатно · 30 мин',
    calendlyEventTypeUri:
      'https://api.calendly.com/event_types/02306705-7d03-4bfa-bdbd-b6548b519771',
    calendlySchedulingUrl:
      'https://calendly.com/designer-nefele/consulta-ie-integrativa-monitorizare-clone',
    sortOrder: 0,
    active: false,
  },
] as const;

/**
 * Default contact channels for the public Contact page. Seeded only when no
 * Contact rows exist yet, so it never overwrites values edited in the back
 * office. Add phone / social channels there as needed.
 */
const CONTACTS = [
  {
    type: 'email',
    labelRo: 'Email',
    labelEn: 'Email',
    labelRu: 'Email',
    value: 'contact@olesiajalba.md',
    sortOrder: 1,
    active: true,
  },
] as const;

const ABOUT = {
  titleRo: 'Despre Olesia',
  titleEn: 'About Olesia',
  titleRu: 'Об Олесе',
  contentRo: `## Cine sunt

Sunt medic pediatru cu o abordare **integrativă**, axată pe nutriție și pe dezvoltarea armonioasă a copilului.

Cred că fiecare familie merită sprijin clar, fără presiune și fără mituri. Lucrez alături de părinți pentru decizii informate și liniștite.

> Sănătatea copilului începe cu încredere și informație de calitate.`,
  contentEn: `## Who I am

I am a pediatrician with an **integrative** approach, focused on nutrition and the harmonious development of the child.

I believe every family deserves clear support, without pressure and without myths. I work alongside parents toward informed, calm decisions.

> A child's health begins with trust and quality information.`,
  contentRu: `## Кто я

Я педиатр с **интегративным** подходом, с акцентом на питание и гармоничное развитие ребёнка.

Считаю, что каждая семья заслуживает понятной поддержки — без давления и мифов. Работаю вместе с родителями ради спокойных и осознанных решений.

> Здоровье ребёнка начинается с доверия и качественной информации.`,
  images: [] as string[],
  stats: [
    {
      value: '12+',
      labelRo: 'ani de practică',
      labelEn: 'years in practice',
      labelRu: 'лет практики',
    },
    {
      value: '24h',
      labelRo: 'timp de răspuns',
      labelEn: 'response time',
      labelRu: 'время ответа',
    },
    {
      value: '100%',
      labelRo: 'consultații online',
      labelEn: 'online consultations',
      labelRu: 'онлайн-консультаций',
    },
    {
      value: 'RO · EN',
      labelRo: 'limbi de comunicare',
      labelEn: 'languages',
      labelRu: 'языки общения',
    },
  ],
  credentials: [
    {
      ro: 'Medic pediatru, diplomă USMF',
      en: 'Pediatrician, USMF degree',
      ru: 'Врач-педиатр, диплом USMF',
    },
    {
      ro: 'Formare în nutriție pediatrică',
      en: 'Pediatric nutrition training',
      ru: 'Обучение детской нутрициологии',
    },
    {
      ro: 'Abordare integrativă & monitorizare',
      en: 'Integrative approach & monitoring',
      ru: 'Интегративный подход и наблюдение',
    },
  ],
  testimonials: [
    {
      quoteRo:
        'Am plecat de la consultație cu un plan clar și fără anxietate. Bebelușul doarme mult mai bine.',
      quoteEn:
        'I left the consultation with a clear plan and no anxiety. Our baby sleeps much better now.',
      quoteRu:
        'После консультации у меня был чёткий план и никакой тревоги. Малыш стал спать намного лучше.',
      author: 'Maria I.',
      roleRo: 'mamă, Chișinău',
      roleEn: 'mother, Chișinău',
      roleRu: 'мама, Кишинёв',
    },
    {
      quoteRo:
        'Explică pe înțelesul tuturor, cu răbdare. Diversificarea a devenit simplă.',
      quoteEn:
        'Explains everything clearly and patiently. Weaning finally became simple.',
      quoteRu:
        'Объясняет понятно и терпеливо. Введение прикорма наконец стало простым.',
      author: 'Andrei P.',
      roleRo: 'tată',
      roleEn: 'father',
      roleRu: 'папа',
    },
    {
      quoteRo:
        'Răspuns rapid la întrebări și recomandări exact pe nevoile noastre.',
      quoteEn:
        'Quick answers to questions and advice tailored exactly to our needs.',
      quoteRu:
        'Быстрые ответы на вопросы и рекомендации точно под наши нужды.',
      author: 'Elena R.',
      roleRo: 'mamă',
      roleEn: 'mother',
      roleRu: 'мама',
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
    patch.titleRu = ABOUT.titleRu;
    patch.contentRo = ABOUT.contentRo;
    patch.contentEn = ABOUT.contentEn;
    patch.contentRu = ABOUT.contentRu;
  }
  // Rows seeded before the RU locale existed keep their RO/EN text but have no
  // Russian at all — backfill each field on its own, so a partially translated
  // page never loses the half the client already wrote.
  if (!patch.titleRu && !existing.titleRu?.trim()) patch.titleRu = ABOUT.titleRu;
  if (!patch.contentRu && !existing.contentRu?.trim())
    patch.contentRu = ABOUT.contentRu;
  if (len(existing.stats) === 0) patch.stats = ABOUT.stats;
  if (len(existing.credentials) === 0) patch.credentials = ABOUT.credentials;
  if (len(existing.testimonials) === 0)
    patch.testimonials = ABOUT.testimonials;

  if (Object.keys(patch).length > 0) {
    await prisma.aboutPage.update({ where: { id: existing.id }, data: patch });
    console.log(`✓ about page backfilled (${Object.keys(patch).join(', ')})`);
  } else {
    console.log('• about page already populated — left untouched');
  }
}

/**
 * Seed the FAQ. All-or-nothing on purpose: once a single section exists, the
 * doctor owns the page and a re-run must not push our copy back into it. To
 * restore the defaults, delete the sections in the back office and re-seed.
 */
async function seedFaq() {
  if ((await prisma.faqCategory.count()) > 0) {
    console.log('• faq already present — skipped (edit in back office)');
    return;
  }
  for (const [index, section] of FAQ_SECTIONS.entries()) {
    await prisma.faqCategory.create({
      data: {
        slug: section.slug,
        titleRo: section.titleRo,
        titleEn: section.titleEn,
        titleRu: section.titleRu,
        sortOrder: index + 1,
        items: {
          create: section.items.map((item, i) => ({
            ...item,
            sortOrder: i + 1,
          })),
        },
      },
    });
  }
  const questions = FAQ_SECTIONS.reduce((n, s) => n + s.items.length, 0);
  console.log(
    `✓ seeded ${FAQ_SECTIONS.length} faq sections (${questions} questions)`,
  );
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
    const existing = await prisma.service.findUnique({ where: { code: s.code } });
    if (!existing) {
      await prisma.service.create({ data: s });
      continue;
    }
    // Rows seeded before the RU locale existed carry no Russian at all. Fill
    // only what is still empty — RO/EN copy edited in the back office is never
    // touched, which is why this is not a blanket upsert.
    const patch: Record<string, string> = {};
    if (!existing.titleRu?.trim()) patch.titleRu = s.titleRu;
    if (!existing.descriptionRu?.trim()) patch.descriptionRu = s.descriptionRu;
    if (s.priceLabelRu && !existing.priceLabelRu?.trim())
      patch.priceLabelRu = s.priceLabelRu;
    if (Object.keys(patch).length > 0) {
      await prisma.service.update({ where: { id: existing.id }, data: patch });
    }
  }
  console.log(`✓ seeded ${SERVICES.length} services`);

  if ((await prisma.contact.count()) === 0) {
    await prisma.contact.createMany({ data: [...CONTACTS] });
    console.log(`✓ seeded ${CONTACTS.length} contact channel(s)`);
  } else {
    console.log('• contacts already present — skipped (edit in back office)');
  }

  await seedAbout();
  await seedFaq();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
