/**
 * Seed: bootstrap admin (closed registration needs one) + the service catalog.
 *
 * Two profiles, chosen by `SEED_PROFILE` (see `profile.ts`). `prod` writes only
 * what a live practice cannot open without — the administrator, the catalog,
 * the contact channels, the real media appearances and reviews, and a
 * provisional schedule. `dev` adds the interim About, FAQ and library copy,
 * which is drafted content the client has not approved and must never reach a
 * production database.
 *
 * Run in development: `pnpm exec tsx apps/api/src/seed/seed.ts`.
 * Run in the production image: `node seed.js`, with DATABASE_URL, ADMIN_EMAIL
 * and ADMIN_PASSWORD set.
 */
import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { PLACEHOLDER_DAYS } from '../app/working-hours/business-hours';
import { resolveSeedProfile, SeedConfigError, type SeedAdmin } from './profile';
import { FAQ_SECTIONS } from './seed-faq';
import { TESTIMONIALS } from './seed-testimonials';
import { MEDIA_APPEARANCES } from './seed-media';
import { MATERIAL_CATEGORIES, MATERIALS } from './seed-materials';

/** Both singletons live under this fixed primary key. See the schema. */
const SINGLETON_ID = 'singleton';

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
      'https://api.calendly.com/event_types/2c590066-eeb1-4f68-a306-c53a0cb71073',
    calendlySchedulingUrl: 'https://calendly.com/designer-nefele/30min',
    sortOrder: 1,
    active: true,
  },
  // Every URI and scheduling URL below was READ FROM THE CALENDLY API
  // (`GET /appointments/calendly/event-types`), not typed by hand — hand-typing
  // is how `pediatric` ended up pointing at the children's-nutrition event and
  // `integrative` at the free call. Note the test account's slugs do not match
  // their own event names (a clone artifact): the URI and the event name are
  // authoritative, the slug means nothing.
  {
    code: 'nutrition_copii',
    group: 'A_booking',
    titleRo: 'Consultație nutrițională pentru copii',
    titleEn: 'Nutrition consultation for children',
    titleRu: 'Консультация по питанию для детей',
    descriptionRo: 'Plan alimentar adaptat vârstei și nevoilor copilului.',
    descriptionEn: 'A meal plan tailored to the child’s age and needs.',
    descriptionRu: 'План питания с учётом возраста и потребностей ребёнка.',
    durationMin: 60,
    price: 38,
    priceLabelRo: null,
    priceLabelEn: null,
    priceLabelRu: null,
    calendlyEventTypeUri:
      'https://api.calendly.com/event_types/615c76de-63dd-4870-b3c5-141aef15a844',
    calendlySchedulingUrl:
      'https://calendly.com/designer-nefele/consultatie-nutritionala-pentru-copii',
    sortOrder: 2,
    active: true,
  },
  {
    code: 'nutrition_adulti',
    group: 'A_booking',
    titleRo: 'Consultație nutrițională pentru adulți',
    titleEn: 'Nutrition consultation for adults',
    titleRu: 'Консультация по питанию для взрослых',
    descriptionRo:
      'Plan alimentar personalizat, pe bază de dovezi, pentru adulți.',
    descriptionEn: 'A personalized, evidence-based meal plan for adults.',
    descriptionRu:
      'Персональный план питания для взрослых на основе доказательной медицины.',
    durationMin: 60,
    price: 38,
    priceLabelRo: null,
    priceLabelEn: null,
    priceLabelRu: null,
    calendlyEventTypeUri:
      'https://api.calendly.com/event_types/326c883f-ab35-41b3-917e-28b7a33c33a9',
    calendlySchedulingUrl:
      'https://calendly.com/designer-nefele/consultatie-nutritionala-pentru-adulti',
    sortOrder: 3,
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
      'https://api.calendly.com/event_types/25950172-362c-43cf-aeea-323ac47d961c',
    calendlySchedulingUrl:
      'https://calendly.com/designer-nefele/consulta-ie-nutri-ionala-clone',
    sortOrder: 4,
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
    sortOrder: 5,
    active: true,
  },
  {
    code: 'quick_question',
    group: 'B_portal',
    titleRo: 'Întrebare EXPRESS',
    titleEn: 'Express question',
    titleRu: 'Вопрос EXPRESS',
    descriptionRo:
      'Răspuns scris la o întrebare punctuală, în ~1 oră în timpul programului de lucru.',
    descriptionEn:
      'A written answer to a specific question, within ~1 hour during working hours.',
    descriptionRu:
      'Письменный ответ на конкретный вопрос примерно за 1 час в рабочее время.',
    durationMin: null,
    price: 8,
    // Left null on purpose: a price label replaces the number on the public
    // page, and these three said "~1 h" — the SLA, not the price, which made
    // /pricing show a duration where 8 € belongs. The "~1 hour during working
    // hours" promise lives in the description and on the EXPRESS page.
    priceLabelRo: null,
    priceLabelEn: null,
    priceLabelRu: null,
    calendlyEventTypeUri: null,
    calendlySchedulingUrl: null,
    sortOrder: 6,
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
 * Default contact channels for the public site. Seeded only when no Contact
 * rows exist yet, so it never overwrites values edited in the back office.
 *
 * These are the channels the client confirmed in the brief. They were string
 * constants in the footer and on /contact until 2026-09-11, where she could not
 * change them (audit A6, F12); the site reads this table now, so the seed has
 * to carry what the site used to carry.
 */
const CONTACTS = [
  {
    type: 'email',
    labelRo: 'Email',
    labelEn: 'Email',
    labelRu: 'Email',
    value: 'oleseajalba@gmail.com',
    sortOrder: 1,
    active: true,
  },
  {
    type: 'phone',
    labelRo: 'Telefon',
    labelEn: 'Phone',
    labelRu: 'Телефон',
    value: '+373 68837774',
    sortOrder: 2,
    active: true,
  },
  {
    type: 'social',
    labelRo: 'Instagram',
    labelEn: 'Instagram',
    labelRu: 'Instagram',
    value: 'https://www.instagram.com/dr.olesea_jalba_pediatru',
    sortOrder: 3,
    active: true,
  },
  {
    type: 'social',
    labelRo: 'Facebook',
    labelEn: 'Facebook',
    labelRu: 'Facebook',
    value: 'https://www.facebook.com/olesea.jalba.2025',
    sortOrder: 4,
    active: true,
  },
  {
    type: 'social',
    labelRo: 'Telegram',
    labelEn: 'Telegram',
    labelRu: 'Telegram',
    value: 'https://t.me/dr_olesea_jalba_official',
    sortOrder: 5,
    active: true,
  },
] as const;

/**
 * The About page's own content.
 *
 * This was hand-written on `apps/frontend/app/[locale]/about/page.tsx` until
 * 2026-09-11: a six-section CV the client could not touch, next to a back-office
 * `Despre noi` page editing a row nothing rendered (audit A6, F12). The site
 * reads this row now, so the seed carries her real CV rather than a sample.
 *
 * ⚠ The WHO line in `Formare continuă` is the CLIENT'S OWN wording, copied
 * verbatim from `docs/despre.md` — do not rephrase it, and do not "improve" it
 * with the certificate. The certificate she sent (WHO Basic Emergency Care
 * Provider, 2026) states that the recipient agrees not to use it *or their
 * participation* for promotional, publicity or commercial purposes, and that it
 * implies no WHO endorsement. **Never publish the scan, the certificate number,
 * or the WHO logo anywhere on the site.** Whether the text mention itself stays
 * is her call — asked in `docs/questions_v3.md` §4.2, together with the fact
 * that her line says "cursuri" (plural, no year) while the evidence is one
 * course in 2026.
 */
const ABOUT = {
  titleRo: 'Experiență și acreditare',
  titleEn: 'Background & credentials',
  titleRu: 'Опыт и аккредитация',
  contentRo: `## Experiență

Lucrez ca medic pediatru la Spitalul Clinic Municipal de Copii „Valentin Ignatenco” și la clinica Harper Medklinic din Chișinău.

Înainte de a deveni medic, am lucrat opt ani ca asistentă medicală în secția de gastroenterologie a Institutului Mamei și Copilului — de aici vine și interesul meu pentru sănătatea digestivă a copiilor.

## Studii

- Master în Sănătate Publică – Nutriție Umană, USMF „Nicolae Testemițanu” (2025)
- Rezidențiat în Pediatrie, USMF „Nicolae Testemițanu” (2018)
- Studii superioare în Medicină Generală, USMF „Nicolae Testemițanu” (2014)

## Formare continuă

Particip constant la congrese și cursuri de specialitate, în Moldova și peste hotare. Printre cele mai recente:

- Programe dedicate dificultăților de hrănire la copii (2026)
- Congresul de Gastroenterologie, Hepatologie și Nutriție Pediatrică, Sibiu (2025)
- Cursuri de urgențe pediatrice ale Organizației Mondiale a Sănătății

## Activitate științifică

Cercetarea mea s-a concentrat pe afecțiunile digestive la copii, inclusiv bolile inflamatorii intestinale. Am publicat articole despre diareea și constipația la copii și despre rinita alergică la copii.

## Limbi

Consultațiile pot avea loc în română, rusă și engleză.`,
  contentEn: `## Experience

I work as a pediatrician at the “Valentin Ignatenco” Municipal Children’s Clinical Hospital and at the Harper Medklinic clinic in Chișinău.

Before becoming a doctor, I worked for eight years as a nurse in the gastroenterology department of the Mother and Child Institute — that’s where my interest in children’s digestive health comes from.

## Education

- MSc in Public Health – Human Nutrition, USMF “Nicolae Testemițanu” (2025)
- Residency in Pediatrics, USMF “Nicolae Testemițanu” (2018)
- Degree in General Medicine, USMF “Nicolae Testemițanu” (2014)

## Continuing education

I regularly take part in congresses and specialty courses, in Moldova and abroad. Among the most recent:

- Programs on feeding difficulties in children (2026)
- Congress of Pediatric Gastroenterology, Hepatology and Nutrition, Sibiu (2025)
- WHO pediatric emergency courses

## Research

My research focused on digestive conditions in children, including inflammatory bowel disease. I’ve published articles on diarrhea and constipation in children and on allergic rhinitis in children.

## Languages

Consultations can take place in Romanian, Russian, and English.`,
  contentRu: `## Опыт

Работаю врачом-педиатром в Муниципальной клинической детской больнице имени Валентина Игнатенко и в клинике Harper Medklinic в Кишинёве.

До того как стать врачом, я восемь лет работала медсестрой в отделении гастроэнтерологии Института матери и ребёнка — отсюда и мой интерес к детскому пищеварению.

## Образование

- Магистратура по общественному здоровью – питание человека, USMF «Nicolae Testemițanu» (2025)
- Ординатура по педиатрии, USMF «Nicolae Testemițanu» (2018)
- Диплом по общей медицине, USMF «Nicolae Testemițanu» (2014)

## Непрерывное образование

Постоянно участвую в конгрессах и профильных курсах — в Молдове и за рубежом. Из недавнего:

- Программы по трудностям с кормлением у детей (2026)
- Конгресс по детской гастроэнтерологии, гепатологии и питанию, Сибиу (2025)
- Курсы ВОЗ по неотложной педиатрической помощи

## Научная деятельность

Я исследовала заболевания пищеварения у детей, в том числе воспалительные заболевания кишечника. Опубликовала статьи о диарее и запорах, а также об аллергическом рините у детей.

## Языки

Консультирую на румынском, русском и английском.`,
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
      value: 'RO · RU · EN',
      labelRo: 'limbi de comunicare',
      labelEn: 'languages',
      labelRu: 'языки общения',
    },
  ],
  credentials: [
    {
      ro: 'Membră a Societății Române de Pediatrie',
      en: 'Member of the Romanian Society of Pediatrics',
      ru: 'Член Румынского общества педиатрии',
    },
    {
      ro: 'Categorie de calificare confirmată de Ministerul Sănătății al Republicii Moldova',
      en: 'Qualification category confirmed by the Ministry of Health of the Republic of Moldova',
      ru: 'Квалификационная категория подтверждена Министерством здравоохранения Республики Молдова',
    },
  ],
};

/**
 * Seed the About singleton. Only writes defaults when the row is missing or
 * still empty, so re-running never clobbers content the client has edited.
 */
async function seedAbout() {
  const existing = await prisma.aboutPage.findUnique({
    where: { id: SINGLETON_ID },
  });
  if (!existing) {
    await prisma.aboutPage.create({ data: { id: SINGLETON_ID, ...ABOUT } });
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
  if (!patch.titleRu && !existing.titleRu?.trim())
    patch.titleRu = ABOUT.titleRu;
  if (!patch.contentRu && !existing.contentRu?.trim())
    patch.contentRu = ABOUT.contentRu;
  if (len(existing.stats) === 0) patch.stats = ABOUT.stats;
  if (len(existing.credentials) === 0) patch.credentials = ABOUT.credentials;

  if (Object.keys(patch).length > 0) {
    await prisma.aboutPage.update({ where: { id: SINGLETON_ID }, data: patch });
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

/**
 * Seed the parent reviews. All-or-nothing, like the FAQ: once a review exists
 * the client owns the list, and a re-run must not re-add one she deleted.
 */
async function seedTestimonials() {
  if ((await prisma.testimonial.count()) > 0) {
    console.log(
      '• testimonials already present — skipped (edit in back office)',
    );
    return;
  }
  await prisma.testimonial.createMany({
    data: TESTIMONIALS.map((t, i) => ({ ...t, sortOrder: i + 1 })),
  });
  console.log(`✓ seeded ${TESTIMONIALS.length} testimonials`);
}

/**
 * Seed the /media appearances. All-or-nothing, like FAQ and testimonials.
 */
async function seedMedia() {
  if ((await prisma.mediaAppearance.count()) > 0) {
    console.log(
      '• media appearances already present — skipped (edit in back office)',
    );
    return;
  }
  await prisma.mediaAppearance.createMany({
    data: MEDIA_APPEARANCES.map((m, i) => ({
      ...m,
      date: m.date ? new Date(m.date) : null,
      sortOrder: i + 1,
    })),
  });
  console.log(`✓ seeded ${MEDIA_APPEARANCES.length} media appearances`);
}

/**
 * Seed the digital library. All-or-nothing, like the other content modules.
 * Every material starts without a file — none exist yet.
 */
async function seedMaterials() {
  if ((await prisma.materialCategory.count()) > 0) {
    console.log('• library already present — skipped (edit in back office)');
    return;
  }
  const byslug = new Map<string, string>();
  for (const [index, c] of MATERIAL_CATEGORIES.entries()) {
    const created = await prisma.materialCategory.create({
      data: { ...c, sortOrder: index + 1 },
    });
    byslug.set(created.slug, created.id);
  }
  for (const [index, m] of MATERIALS.entries()) {
    const categoryId = byslug.get(m.categorySlug);
    if (!categoryId) {
      console.warn(`  ! unknown category ${m.categorySlug} for ${m.slug}`);
      continue;
    }
    const { categorySlug: _drop, ...rest } = m;
    await prisma.material.create({
      data: {
        ...rest,
        categoryId,
        // Romanian is the only language the PDFs will be written in for now.
        fileLang: 'RO',
        sortOrder: index + 1,
      },
    });
  }
  console.log(
    `✓ seeded ${MATERIAL_CATEGORIES.length} library categories, ${MATERIALS.length} materials (no files yet)`,
  );
}

/**
 * The schedule row. The service creates one lazily on first read, but a
 * production database that has never been read has no working hours at all,
 * and the EXPRESS deadline is quoted to patients before anyone opens the back
 * office.
 */
async function seedWorkingHours() {
  if ((await prisma.workingHours.count()) > 0) {
    console.log(
      '• working hours already present — skipped (edit in back office)',
    );
    return;
  }
  await prisma.workingHours.create({
    data: {
      id: SINGLETON_ID,
      days: PLACEHOLDER_DAYS as unknown as object,
      isPlaceholder: true,
    },
  });
  console.log('✓ working hours seeded Mon–Fri 09:00–17:00 (provisional)');
}

const DEV_ADMIN: SeedAdmin = {
  email: 'admin@olesia.md',
  password: 'admin12345',
};

async function seedAdmin(admin: SeedAdmin, mustChangePassword: boolean) {
  const created = await prisma.user.upsert({
    where: { email: admin.email },
    update: {},
    create: {
      email: admin.email,
      name: 'Administrator',
      role: 'admin',
      passwordHash: await argon2.hash(admin.password),
      mustChangePassword,
    },
  });
  console.log(`✓ admin ready: ${created.email}`);
}

async function seedServices() {
  for (const s of SERVICES) {
    const existing = await prisma.service.findUnique({
      where: { code: s.code },
    });
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
}

async function seedContacts() {
  if ((await prisma.contact.count()) > 0) {
    console.log('• contacts already present — skipped (edit in back office)');
    return;
  }
  await prisma.contact.createMany({ data: [...CONTACTS] });
  console.log(`✓ seeded ${CONTACTS.length} contact channel(s)`);
}

async function main() {
  const { profile, admin } = resolveSeedProfile(process.env);
  console.log(`seeding with profile: ${profile}`);

  await seedAdmin(admin ?? DEV_ADMIN, profile === 'prod');
  await seedServices();
  await seedContacts();
  await seedTestimonials();
  await seedMedia();
  await seedWorkingHours();

  if (profile === 'prod') {
    console.log(
      '• about, faq and library skipped — drafted copy, not client-approved',
    );
    return;
  }

  await seedAbout();
  await seedFaq();
  await seedMaterials();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    // A wrong SEED_PROFILE or a missing password is the operator's to fix, and
    // a stack trace buries the one line that says how.
    console.error(err instanceof SeedConfigError ? err.message : err);
    await prisma.$disconnect();
    process.exit(1);
  });
