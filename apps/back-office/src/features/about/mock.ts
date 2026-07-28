import type { AboutPage, AboutInput } from '@/features/about/types';

const dateTimeFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

/* ------------------------------------------------------------------ *
 * Mock data layer — single in-memory document.
 * TODO(api): replace with GET /about (public) and PATCH /about
 * (admin/editor). See module_calendly.md §10.
 * ------------------------------------------------------------------ */

let about: AboutPage = {
  id: 'about',
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
  images: [
    'https://picsum.photos/seed/olesia-about-1/640/420',
    'https://picsum.photos/seed/olesia-about-2/640/420',
  ],
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
  ],
  updatedAt: '2026-06-03T12:00:00+03:00',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchAbout(): Promise<AboutPage> {
  await delay(450);
  return about;
}

export async function updateAbout(input: AboutInput): Promise<AboutPage> {
  await delay(600);
  about = { ...about, ...input, updatedAt: new Date().toISOString() };
  return about;
}

/** Mock upload: read the file as a data URL (no backend). */
export async function uploadImage(file: File): Promise<string> {
  await delay(400);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
