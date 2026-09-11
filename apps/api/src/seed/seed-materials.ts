/**
 * Biblioteca digitală — the catalog that was live on /guides, moved out of
 * `apps/frontend/lib/placeholder-materials.ts`.
 *
 * ⚠️ This is an INTERIM catalog: titles and descriptions were drafted from the
 * doctor's stated topics, and the page counts and prices are placeholders. No
 * PDF exists for any of it yet — every material is seeded with `fileUrl: null`,
 * which the storefront renders as "în curând" rather than a dead download.
 * The client owns all of it from the back office the moment she sends files.
 */

export interface SeedMaterialCategory {
  slug: string;
  nameRo: string;
  nameEn: string;
  nameRu: string;
}

export interface SeedMaterial {
  slug: string;
  categorySlug: string;
  ageKeys: string[];
  titleRo: string;
  titleEn: string;
  titleRu: string;
  descriptionRo: string;
  descriptionEn: string;
  descriptionRu: string;
  pageCount: number | null;
  access: 'free' | 'paid';
  /** Whole EUR, paid materials only. */
  price: number | null;
  flags: ('recommended' | 'popular' | 'new')[];
}

export const MATERIAL_CATEGORIES: SeedMaterialCategory[] = [
  {
    slug: 'pediatrie',
    nameRo: 'Pediatrie',
    nameEn: 'Pediatrics',
    nameRu: 'Педиатрия',
  },
  {
    slug: 'urgente',
    nameRo: 'Urgențe și prim ajutor',
    nameEn: 'Emergencies & first aid',
    nameRu: 'Неотложная помощь',
  },
  {
    slug: 'nutritie-copii',
    nameRo: 'Nutriție copii',
    nameEn: 'Child nutrition',
    nameRu: 'Питание детей',
  },
  {
    slug: 'nutritie-adulti',
    nameRo: 'Nutriție adolescenți și adulți',
    nameEn: 'Teen & adult nutrition',
    nameRu: 'Питание подростков и взрослых',
  },
  {
    slug: 'diversificare',
    nameRo: 'Alimentație complementară',
    nameEn: 'Complementary feeding',
    nameRu: 'Прикорм',
  },
  {
    slug: 'alergii',
    nameRo: 'Alergii și intoleranțe',
    nameEn: 'Allergies & intolerances',
    nameRu: 'Аллергии и непереносимости',
  },
  {
    slug: 'dezvoltare',
    nameRo: 'Dezvoltarea copilului',
    nameEn: 'Child development',
    nameRu: 'Развитие ребёнка',
  },
  {
    slug: 'parenting',
    nameRo: 'Sănătate emoțională și parenting',
    nameEn: 'Emotional health & parenting',
    nameRu: 'Эмоциональное здоровье и воспитание',
  },
  {
    slug: 'checklist',
    nameRo: 'Ghiduri practice și checklist-uri',
    nameEn: 'Practical guides & checklists',
    nameRu: 'Практичные гайды и чек-листы',
  },
];

export const MATERIALS: SeedMaterial[] = [
  {
    slug: 'diversificarea-alimentatiei',
    categorySlug: 'diversificare',
    ageKeys: ['6-12m'],
    titleRo: 'Diversificarea alimentației — primii pași',
    titleEn: 'Starting solids — the first steps',
    titleRu: 'Введение прикорма — первые шаги',
    descriptionRo:
      'Când și cum începi diversificarea, în siguranță și fără stres.',
    descriptionEn: 'When and how to start solids, safely and without stress.',
    descriptionRu: 'Когда и как начинать прикорм — безопасно и без стресса.',
    pageCount: 16,
    access: 'free',
    price: null,
    flags: ['recommended', 'popular'],
  },
  {
    slug: 'meniu-blw-prima-saptamana',
    categorySlug: 'diversificare',
    ageKeys: ['6-12m'],
    titleRo: 'Meniu BLW — prima săptămână',
    titleEn: 'BLW menu — the first week',
    titleRu: 'BLW-меню — первая неделя',
    descriptionRo:
      'Idei de mese pe zile pentru începutul diversificării autocondusă.',
    descriptionEn: 'Day-by-day meal ideas to start baby-led weaning.',
    descriptionRu: 'Идеи блюд по дням для старта педагогического прикорма.',
    pageCount: 10,
    access: 'paid',
    price: 9,
    flags: ['new'],
  },
  {
    slug: 'copilul-mofturos',
    categorySlug: 'nutritie-copii',
    ageKeys: ['1-3y', '3-6y'],
    titleRo: 'Copilul mofturos: dificultăți de hrănire',
    titleEn: 'The picky eater: feeding difficulties',
    titleRu: 'Привередливый ребёнок: трудности с кормлением',
    descriptionRo:
      'Strategii practice pentru mesele dificile și refuzul mâncării.',
    descriptionEn: 'Practical strategies for hard meals and food refusal.',
    descriptionRu:
      'Практичные стратегии для сложных приёмов пищи и отказа от еды.',
    pageCount: 12,
    access: 'free',
    price: null,
    flags: ['popular'],
  },
  {
    slug: 'farfuria-echilibrata-scolar',
    categorySlug: 'nutritie-copii',
    ageKeys: ['6-12y'],
    titleRo: 'Farfuria echilibrată a școlarului',
    titleEn: 'A balanced plate for school age',
    titleRu: 'Сбалансированная тарелка школьника',
    descriptionRo:
      'Cum compui mese echilibrate pentru copilul de vârstă școlară.',
    descriptionEn: 'How to build balanced meals for a school-age child.',
    descriptionRu: 'Как составить сбалансированные приёмы пищи для школьника.',
    pageCount: 14,
    access: 'paid',
    price: 12,
    flags: [],
  },
  {
    slug: 'nutritie-adolescent',
    categorySlug: 'nutritie-adulti',
    ageKeys: ['adolescent'],
    titleRo: 'Nutriția adolescentului',
    titleEn: 'Teen nutrition',
    titleRu: 'Питание подростка',
    descriptionRo:
      'Nevoile nutriționale în adolescență și capcanele frecvente.',
    descriptionEn: 'Nutritional needs in adolescence and common pitfalls.',
    descriptionRu:
      'Потребности в питании в подростковом возрасте и частые ошибки.',
    pageCount: 18,
    access: 'free',
    price: null,
    flags: [],
  },
  {
    slug: 'copilul-care-se-imbolnaveste-des',
    categorySlug: 'pediatrie',
    ageKeys: ['1-3y', '3-6y'],
    titleRo: 'Copilul care se îmbolnăvește des',
    titleEn: 'The child who gets sick often',
    titleRu: 'Часто болеющий ребёнок',
    descriptionRo:
      'Ce e normal, când să te îngrijorezi și cum susții imunitatea.',
    descriptionEn: "What's normal, when to worry, and how to support immunity.",
    descriptionRu:
      'Что нормально, когда стоит беспокоиться и как поддержать иммунитет.',
    pageCount: 14,
    access: 'free',
    price: null,
    flags: ['recommended'],
  },
  {
    slug: 'trusa-de-prim-ajutor',
    categorySlug: 'urgente',
    ageKeys: [],
    titleRo: 'Trusa de prim ajutor pentru acasă',
    titleEn: 'A home first-aid kit',
    titleRu: 'Домашняя аптечка первой помощи',
    descriptionRo: 'Lista esențială și ce faci în primele minute la o urgență.',
    descriptionEn:
      'The essential list and what to do in the first minutes of an emergency.',
    descriptionRu:
      'Список необходимого и что делать в первые минуты при неотложной ситуации.',
    pageCount: 8,
    access: 'free',
    price: null,
    flags: ['new'],
  },
  {
    slug: 'febra-la-copii',
    categorySlug: 'urgente',
    ageKeys: ['0-6m', '6-12m', '1-3y'],
    titleRo: 'Febra la copii — ghid pas cu pas',
    titleEn: 'Fever in children — a step-by-step guide',
    titleRu: 'Температура у детей — пошаговый гайд',
    descriptionRo:
      'Cum măsori corect, când dai antitermice și când suni medicul.',
    descriptionEn:
      'How to measure correctly, when to give antipyretics, when to call the doctor.',
    descriptionRu:
      'Как правильно измерять, когда давать жаропонижающее и когда звонить врачу.',
    pageCount: 10,
    access: 'paid',
    price: 7,
    flags: ['popular'],
  },
  {
    slug: 'alergiile-la-copii',
    categorySlug: 'alergii',
    ageKeys: ['6-12m', '1-3y'],
    titleRo: 'Alergiile la copii: ce trebuie să știi',
    titleEn: 'Allergies in children: what to know',
    titleRu: 'Аллергии у детей: что нужно знать',
    descriptionRo: 'Recunoașterea alergiilor alimentare și pașii corecți.',
    descriptionEn: 'Recognizing food allergies and the right steps to take.',
    descriptionRu: 'Как распознать пищевую аллергию и какие шаги предпринять.',
    pageCount: 18,
    access: 'free',
    price: null,
    flags: [],
  },
  {
    slug: 'dezvoltarea-copilului-pe-etape',
    categorySlug: 'dezvoltare',
    ageKeys: ['0-6m', '6-12m', '1-3y'],
    titleRo: 'Dezvoltarea copilului pe etape',
    titleEn: 'Child development, stage by stage',
    titleRu: 'Развитие ребёнка по этапам',
    descriptionRo: 'Reperele de dezvoltare de la naștere la vârsta preșcolară.',
    descriptionEn: 'Developmental milestones from birth to preschool age.',
    descriptionRu: 'Этапы развития от рождения до дошкольного возраста.',
    pageCount: 20,
    access: 'free',
    price: null,
    flags: ['recommended'],
  },
  {
    slug: 'somnul-si-emotiile',
    categorySlug: 'parenting',
    ageKeys: ['1-3y', '3-6y'],
    titleRo: 'Somnul, emoțiile și rutina copilului',
    titleEn: 'Sleep, emotions and the child’s routine',
    titleRu: 'Сон, эмоции и режим ребёнка',
    descriptionRo: 'Rutine calme și sprijin emoțional pentru zile mai line.',
    descriptionEn: 'Calm routines and emotional support for smoother days.',
    descriptionRu:
      'Спокойные ритуалы и эмоциональная поддержка для более лёгких дней.',
    pageCount: 12,
    access: 'paid',
    price: 9,
    flags: [],
  },
  {
    slug: 'checklist-vizita-medicala',
    categorySlug: 'checklist',
    ageKeys: [],
    titleRo: 'Checklist: pregătirea pentru vizita medicală',
    titleEn: 'Checklist: preparing for the medical visit',
    titleRu: 'Чек-лист: подготовка к приёму врача',
    descriptionRo:
      'Ce pregătești și ce întrebări notezi înainte de consultație.',
    descriptionEn:
      'What to prepare and which questions to note before the consultation.',
    descriptionRu:
      'Что подготовить и какие вопросы записать перед консультацией.',
    pageCount: 4,
    access: 'free',
    price: null,
    flags: ['new'],
  },
];
