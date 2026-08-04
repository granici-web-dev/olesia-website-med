import type {
  Category,
  CategoryInput,
  Post,
  PostInput,
} from '@/features/blog/types';

/** Mock upload: read the file as a data URL (no backend). */
export async function uploadImage(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** URL-safe slug, with Romanian diacritics folded to ASCII. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ă|â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș|ş/g, 's')
    .replace(/ț|ţ/g, 't')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const dateFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatDate(iso: string | null): string {
  return iso ? dateFmt.format(new Date(iso)) : '—';
}

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory CRUD for posts + categories, shaped like
 * the eventual REST API.
 * TODO(api): replace with HTTP calls to /blog/posts and /blog/categories
 * (+ POST /blog/upload for images). See module_calendly.md §7.
 * ------------------------------------------------------------------ */

let categories: Category[] = [
  { id: 'c1', slug: 'nutritie', nameRo: 'Nutriție', nameEn: 'Nutrition', nameRu: 'Питание' },
  { id: 'c2', slug: 'somn', nameRo: 'Somn', nameEn: 'Sleep', nameRu: 'Сон' },
  {
    id: 'c3',
    slug: 'dezvoltare',
    nameRo: 'Dezvoltare',
    nameEn: 'Development',
    nameRu: 'Развитие',
  },
  {
    id: 'c4',
    slug: 'alaptare',
    nameRo: 'Alăptare',
    nameEn: 'Breastfeeding',
    nameRu: 'Грудное вскармливание',
  },
];

const sampleRo = `## De ce contează diversificarea

Diversificarea alimentației este un **moment cheie** în primul an de viață.
Introducerea treptată a alimentelor solide susține:

- dezvoltarea gustului;
- maturizarea sistemului digestiv;
- autonomia la masă.

> Recomandarea generală este să începi în jurul vârstei de 6 luni, urmărind semnele de pregătire ale copilului.

Pentru un plan personalizat, programează o [consultație nutrițională](/servicii).`;

const sampleEn = `## Why diversification matters

Food diversification is a **key milestone** in the first year of life.
Gradually introducing solid foods supports:

- taste development;
- digestive system maturation;
- mealtime autonomy.

> The general recommendation is to start around 6 months of age, watching for the child's readiness signs.

For a personalized plan, book a [nutrition consultation](/services).`;

const sampleRu = `## Почему важен прикорм

Введение прикорма — **ключевой этап** первого года жизни.
Постепенное знакомство с твёрдой пищей поддерживает:

- развитие вкуса;
- созревание пищеварительной системы;
- самостоятельность за столом.

> Обычно рекомендуют начинать около 6 месяцев, ориентируясь на признаки готовности ребёнка.

Для персонального плана запишитесь на [консультацию по питанию](/servicii).`;

let posts: Post[] = [
  {
    id: 'p1',
    slug: 'diversificarea-alimentatiei',
    titleRo: 'Diversificarea alimentației: ghid pentru părinți',
    titleEn: 'Food diversification: a guide for parents',
    titleRu: 'Введение прикорма: руководство для родителей',
    excerptRo:
      'Când și cum introducem alimentele solide, fără stres și fără mituri.',
    excerptEn: 'When and how to introduce solid foods, without stress or myths.',
    excerptRu:
      'Когда и как вводить твёрдую пищу — без стресса и мифов.',
    contentRo: sampleRo,
    contentEn: sampleEn,
    contentRu: sampleRu,
    coverImageUrl: 'https://picsum.photos/seed/olesia-food/640/400',
    ageKeys: ['6-12m', '1-3y'],
    status: 'published',
    publishedAt: '2026-06-02T08:00:00+03:00',
    categoryIds: ['c1'],
    authorName: 'Olesia',
    createdAt: '2026-06-01T10:00:00+03:00',
    updatedAt: '2026-06-02T08:00:00+03:00',
  },
  {
    id: 'p2',
    slug: 'rutina-de-somn-a-bebelusului',
    titleRo: 'Rutina de somn a bebelușului',
    titleEn: 'Your baby’s sleep routine',
    titleRu: 'Режим сна малыша',
    excerptRo: 'Ritualuri simple care ajută copilul să adoarmă mai ușor.',
    excerptEn: 'Simple rituals that help your child fall asleep more easily.',
    excerptRu: 'Простые ритуалы, которые помогают ребёнку легче засыпать.',
    contentRo:
      '## Un somn liniștit\n\nO rutină **predictibilă** îi oferă copilului siguranță. Câțiva pași utili:\n\n1. lumină scăzută cu o oră înainte de culcare;\n2. o baie caldă;\n3. o poveste scurtă.\n\nConsecvența este mai importantă decât perfecțiunea.',
    contentEn:
      '## A calm sleep\n\nA **predictable** routine gives the child a sense of security. A few useful steps:\n\n1. dim the lights an hour before bedtime;\n2. a warm bath;\n3. a short story.\n\nConsistency matters more than perfection.',
    contentRu:
      '## Спокойный сон\n\n**Предсказуемый** режим даёт ребёнку чувство безопасности. Несколько полезных шагов:\n\n1. приглушённый свет за час до сна;\n2. тёплая ванна;\n3. короткая сказка.\n\nПостоянство важнее идеальности.',
    coverImageUrl: 'https://picsum.photos/seed/olesia-sleep/640/400',
    ageKeys: ['0-6m', '6-12m'],
    status: 'published',
    publishedAt: '2026-05-28T09:30:00+03:00',
    categoryIds: ['c2', 'c3'],
    authorName: 'Olesia',
    createdAt: '2026-05-27T12:00:00+03:00',
    updatedAt: '2026-05-28T09:30:00+03:00',
  },
  {
    id: 'p3',
    slug: 'mituri-despre-alaptare',
    titleRo: 'Mituri despre alăptare',
    titleEn: 'Myths about breastfeeding',
    titleRu: 'Мифы о грудном вскармливании',
    excerptRo: 'Separăm faptele de zvonuri, cu blândețe și fără judecată.',
    excerptEn: 'Separating facts from rumors, gently and without judgment.',
    excerptRu: 'Отделяем факты от слухов — мягко и без осуждения.',
    contentRo:
      '## Ce spune știința\n\nMulte temeri legate de alăptare pornesc din *mituri*. Le clarificăm pe rând într-un articol în lucru.',
    contentEn:
      '## What science says\n\nMany breastfeeding fears stem from *myths*. We clarify them one by one in an upcoming article.',
    contentRu:
      '## Что говорит наука\n\nМногие страхи вокруг грудного вскармливания рождаются из *мифов*. Разбираем их по очереди в готовящейся статье.',
    coverImageUrl: null,
    ageKeys: [],
    status: 'draft',
    publishedAt: null,
    categoryIds: ['c4'],
    authorName: 'Olesia',
    createdAt: '2026-06-08T14:00:00+03:00',
    updatedAt: '2026-06-09T11:15:00+03:00',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();

/* ------------------------------- posts ------------------------------- */

export async function fetchPosts(): Promise<Post[]> {
  await delay(550);
  return posts.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function fetchPost(id: string): Promise<Post> {
  await delay(350);
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error(`Post ${id} not found`);
  return post;
}

export async function createPost(input: PostInput): Promise<Post> {
  await delay(550);
  const ts = now();
  const created: Post = {
    ...input,
    id: crypto.randomUUID(),
    authorName: 'Olesia',
    createdAt: ts,
    updatedAt: ts,
  };
  posts = [created, ...posts];
  return created;
}

export async function updatePost(id: string, input: PostInput): Promise<Post> {
  await delay(550);
  let updated: Post | undefined;
  posts = posts.map((p) => {
    if (p.id !== id) return p;
    updated = { ...p, ...input, updatedAt: now() };
    return updated;
  });
  if (!updated) throw new Error(`Post ${id} not found`);
  return updated;
}

export async function deletePost(id: string): Promise<void> {
  await delay(450);
  posts = posts.filter((p) => p.id !== id);
}

/* ----------------------------- categories ---------------------------- */

export async function fetchCategories(): Promise<Category[]> {
  await delay(300);
  return categories.slice().sort((a, b) => a.nameRo.localeCompare(b.nameRo));
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  await delay(350);
  const created: Category = { ...input, id: crypto.randomUUID() };
  categories = [...categories, created];
  return created;
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<Category> {
  await delay(350);
  let updated: Category | undefined;
  categories = categories.map((c) => {
    if (c.id !== id) return c;
    updated = { ...input, id };
    return updated;
  });
  if (!updated) throw new Error(`Category ${id} not found`);
  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  await delay(350);
  categories = categories.filter((c) => c.id !== id);
  // Detach from posts (mock cascade).
  posts = posts.map((p) =>
    p.categoryIds.includes(id)
      ? { ...p, categoryIds: p.categoryIds.filter((cid) => cid !== id) }
      : p,
  );
}

/** Count of posts referencing a category — for delete warnings. */
export function postCountForCategory(id: string): number {
  return posts.filter((p) => p.categoryIds.includes(id)).length;
}
