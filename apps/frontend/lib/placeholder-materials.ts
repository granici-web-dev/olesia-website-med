/**
 * Digital Library (Biblioteca Digitală) — placeholder catalog (brief §6a).
 * Nine categories, free + paid materials, child-age tagging, and merchandising
 * flags (recommended / popular / new). Content lives here as local trilingual
 * data so the storefront renders fully before the back-office `materials`
 * module exists (→ CMS later). File paths and prices are interim; real PDFs and
 * the paid-download flow land in the backend pass.
 */

import type { Bi } from './age-taxonomy';

export type { Bi };

export type MaterialFlag = 'recommended' | 'popular' | 'new';

export interface MaterialCategory {
  key: string;
  label: Bi;
}

export interface Material {
  slug: string;
  categoryKey: string;
  /** Age groups this material targets (keys from AGE_GROUPS). Empty = all ages. */
  ageKeys: string[];
  title: Bi;
  description: Bi;
  /** Card meta, e.g. "PDF · 12 pag.". */
  format: Bi;
  access: 'free' | 'paid';
  /** Display price for paid materials, e.g. "12 €". */
  price?: string;
  flags?: MaterialFlag[];
  /** Direct download for free materials; '' = file not wired yet ("în curând"). */
  fileHref?: string;
}

/* Nine launch categories (brief §6a). */
export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  { key: 'pediatrie', label: { ro: 'Pediatrie', en: 'Pediatrics', ru: 'Педиатрия' } },
  { key: 'urgente', label: { ro: 'Urgențe și prim ajutor', en: 'Emergencies & first aid', ru: 'Неотложная помощь' } },
  { key: 'nutritie-copii', label: { ro: 'Nutriție copii', en: 'Child nutrition', ru: 'Питание детей' } },
  { key: 'nutritie-adulti', label: { ro: 'Nutriție adolescenți și adulți', en: 'Teen & adult nutrition', ru: 'Питание подростков и взрослых' } },
  { key: 'diversificare', label: { ro: 'Alimentație complementară', en: 'Complementary feeding', ru: 'Прикорм' } },
  { key: 'alergii', label: { ro: 'Alergii și intoleranțe', en: 'Allergies & intolerances', ru: 'Аллергии и непереносимости' } },
  { key: 'dezvoltare', label: { ro: 'Dezvoltarea copilului', en: 'Child development', ru: 'Развитие ребёнка' } },
  { key: 'parenting', label: { ro: 'Sănătate emoțională și parenting', en: 'Emotional health & parenting', ru: 'Эмоциональное здоровье и воспитание' } },
  { key: 'checklist', label: { ro: 'Ghiduri practice și checklist-uri', en: 'Practical guides & checklists', ru: 'Практичные гайды и чек-листы' } },
];

const pdf = (n: number, lang = 'RO'): Bi => ({
  ro: `PDF · ${n} pag. · ${lang}`,
  en: `PDF · ${n} pp. · ${lang}`,
  ru: `PDF · ${n} стр. · ${lang}`,
});

/* ⚠ Interim catalog — drawn from the doctor's stated topics. PDFs/prices are
   placeholders; the back office will own these later. */
export const MATERIALS: Material[] = [
  {
    slug: 'diversificarea-alimentatiei',
    categoryKey: 'diversificare',
    ageKeys: ['6-12m'],
    title: { ro: 'Diversificarea alimentației — primii pași', en: 'Starting solids — the first steps', ru: 'Введение прикорма — первые шаги' },
    description: { ro: 'Când și cum începi diversificarea, în siguranță și fără stres.', en: 'When and how to start solids, safely and without stress.', ru: 'Когда и как начинать прикорм — безопасно и без стресса.' },
    format: pdf(16),
    access: 'free',
    flags: ['recommended', 'popular'],
    fileHref: '',
  },
  {
    slug: 'meniu-blw-prima-saptamana',
    categoryKey: 'diversificare',
    ageKeys: ['6-12m'],
    title: { ro: 'Meniu BLW — prima săptămână', en: 'BLW menu — the first week', ru: 'BLW-меню — первая неделя' },
    description: { ro: 'Idei de mese pe zile pentru începutul diversificării autocondusă.', en: 'Day-by-day meal ideas to start baby-led weaning.', ru: 'Идеи блюд по дням для старта педагогического прикорма.' },
    format: pdf(10),
    access: 'paid',
    price: '9 €',
    flags: ['new'],
  },
  {
    slug: 'copilul-mofturos',
    categoryKey: 'nutritie-copii',
    ageKeys: ['1-3y', '3-6y'],
    title: { ro: 'Copilul mofturos: dificultăți de hrănire', en: 'The picky eater: feeding difficulties', ru: 'Привередливый ребёнок: трудности с кормлением' },
    description: { ro: 'Strategii practice pentru mesele dificile și refuzul mâncării.', en: 'Practical strategies for hard meals and food refusal.', ru: 'Практичные стратегии для сложных приёмов пищи и отказа от еды.' },
    format: pdf(12),
    access: 'free',
    flags: ['popular'],
    fileHref: '',
  },
  {
    slug: 'farfuria-echilibrata-scolar',
    categoryKey: 'nutritie-copii',
    ageKeys: ['6-12y'],
    title: { ro: 'Farfuria echilibrată a școlarului', en: 'A balanced plate for school age', ru: 'Сбалансированная тарелка школьника' },
    description: { ro: 'Cum compui mese echilibrate pentru copilul de vârstă școlară.', en: 'How to build balanced meals for a school-age child.', ru: 'Как составить сбалансированные приёмы пищи для школьника.' },
    format: pdf(14),
    access: 'paid',
    price: '12 €',
  },
  {
    slug: 'nutritie-adolescent',
    categoryKey: 'nutritie-adulti',
    ageKeys: ['adolescent'],
    title: { ro: 'Nutriția adolescentului', en: 'Teen nutrition', ru: 'Питание подростка' },
    description: { ro: 'Nevoile nutriționale în adolescență și capcanele frecvente.', en: 'Nutritional needs in adolescence and common pitfalls.', ru: 'Потребности в питании в подростковом возрасте и частые ошибки.' },
    format: pdf(18),
    access: 'free',
    fileHref: '',
  },
  {
    slug: 'copilul-care-se-imbolnaveste-des',
    categoryKey: 'pediatrie',
    ageKeys: ['1-3y', '3-6y'],
    title: { ro: 'Copilul care se îmbolnăvește des', en: 'The child who gets sick often', ru: 'Часто болеющий ребёнок' },
    description: { ro: 'Ce e normal, când să te îngrijorezi și cum susții imunitatea.', en: "What's normal, when to worry, and how to support immunity.", ru: 'Что нормально, когда стоит беспокоиться и как поддержать иммунитет.' },
    format: pdf(14),
    access: 'free',
    flags: ['recommended'],
    fileHref: '',
  },
  {
    slug: 'trusa-de-prim-ajutor',
    categoryKey: 'urgente',
    ageKeys: [],
    title: { ro: 'Trusa de prim ajutor pentru acasă', en: 'A home first-aid kit', ru: 'Домашняя аптечка первой помощи' },
    description: { ro: 'Lista esențială și ce faci în primele minute la o urgență.', en: 'The essential list and what to do in the first minutes of an emergency.', ru: 'Список необходимого и что делать в первые минуты при неотложной ситуации.' },
    format: pdf(8),
    access: 'free',
    flags: ['new'],
    fileHref: '',
  },
  {
    slug: 'febra-la-copii',
    categoryKey: 'urgente',
    ageKeys: ['0-6m', '6-12m', '1-3y'],
    title: { ro: 'Febra la copii — ghid pas cu pas', en: 'Fever in children — a step-by-step guide', ru: 'Температура у детей — пошаговый гайд' },
    description: { ro: 'Cum măsori corect, când dai antitermice și când suni medicul.', en: 'How to measure correctly, when to give antipyretics, when to call the doctor.', ru: 'Как правильно измерять, когда давать жаропонижающее и когда звонить врачу.' },
    format: pdf(10),
    access: 'paid',
    price: '7 €',
    flags: ['popular'],
  },
  {
    slug: 'alergiile-la-copii',
    categoryKey: 'alergii',
    ageKeys: ['6-12m', '1-3y'],
    title: { ro: 'Alergiile la copii: ce trebuie să știi', en: 'Allergies in children: what to know', ru: 'Аллергии у детей: что нужно знать' },
    description: { ro: 'Recunoașterea alergiilor alimentare și pașii corecți.', en: 'Recognizing food allergies and the right steps to take.', ru: 'Как распознать пищевую аллергию и какие шаги предпринять.' },
    format: pdf(18),
    access: 'free',
    fileHref: '',
  },
  {
    slug: 'dezvoltarea-copilului-pe-etape',
    categoryKey: 'dezvoltare',
    ageKeys: ['0-6m', '6-12m', '1-3y'],
    title: { ro: 'Dezvoltarea copilului pe etape', en: 'Child development, stage by stage', ru: 'Развитие ребёнка по этапам' },
    description: { ro: 'Reperele de dezvoltare de la naștere la vârsta preșcolară.', en: 'Developmental milestones from birth to preschool age.', ru: 'Этапы развития от рождения до дошкольного возраста.' },
    format: pdf(20),
    access: 'free',
    flags: ['recommended'],
    fileHref: '',
  },
  {
    slug: 'somnul-si-emotiile',
    categoryKey: 'parenting',
    ageKeys: ['1-3y', '3-6y'],
    title: { ro: 'Somnul, emoțiile și rutina copilului', en: 'Sleep, emotions and the child’s routine', ru: 'Сон, эмоции и режим ребёнка' },
    description: { ro: 'Rutine calme și sprijin emoțional pentru zile mai line.', en: 'Calm routines and emotional support for smoother days.', ru: 'Спокойные ритуалы и эмоциональная поддержка для более лёгких дней.' },
    format: pdf(12),
    access: 'paid',
    price: '9 €',
  },
  {
    slug: 'checklist-vizita-medicala',
    categoryKey: 'checklist',
    ageKeys: [],
    title: { ro: 'Checklist: pregătirea pentru vizita medicală', en: 'Checklist: preparing for the medical visit', ru: 'Чек-лист: подготовка к приёму врача' },
    description: { ro: 'Ce pregătești și ce întrebări notezi înainte de consultație.', en: 'What to prepare and which questions to note before the consultation.', ru: 'Что подготовить и какие вопросы записать перед консультацией.' },
    format: pdf(4),
    access: 'free',
    flags: ['new'],
    fileHref: '',
  },
];
