import type {
  FaqCategory,
  FaqCategoryInput,
  FaqItem,
  FaqItemInput,
} from '@/features/faq/types';

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory, shaped like the real /faq endpoints.
 * A trimmed copy of the seeded content: enough to exercise ordering,
 * a hidden question, and a section with no Russian yet.
 * ------------------------------------------------------------------ */

let categories: FaqCategory[] = [
  {
    id: 'c1',
    slug: 'consultatii',
    titleRo: 'Consultații online',
    titleEn: 'Online consultations',
    titleRu: 'Онлайн-консультации',
    sortOrder: 1,
    active: true,
    items: [
      {
        id: 'i1',
        categoryId: 'c1',
        questionRo: 'Cum decurge o consultație online?',
        questionEn: 'How does an online consultation work?',
        questionRu: 'Как проходит онлайн-консультация?',
        answerRo:
          'Consultația are loc pe Google Meet, la ora programată — primești linkul în e-mailul de confirmare.',
        answerEn:
          'The consultation takes place on Google Meet at the scheduled time — the link arrives in your confirmation email.',
        answerRu:
          'Консультация проходит в Google Meet в назначенное время — ссылка придёт в письме-подтверждении.',
        sortOrder: 1,
        active: true,
      },
      {
        id: 'i2',
        categoryId: 'c1',
        questionRo: 'În ce limbi pot avea consultația?',
        questionEn: 'Which languages can I have the consultation in?',
        questionRu: 'На каких языках можно пройти консультацию?',
        answerRo: 'În română, rusă și engleză.',
        answerEn: 'Romanian, Russian, and English.',
        answerRu: 'На румынском, русском и английском.',
        sortOrder: 2,
        active: true,
      },
    ],
  },
  {
    id: 'c2',
    slug: 'plata',
    titleRo: 'Plată',
    titleEn: 'Payment',
    titleRu: null,
    sortOrder: 2,
    active: true,
    items: [
      {
        id: 'i3',
        categoryId: 'c2',
        questionRo: 'Cum se face plata?',
        questionEn: 'How do I pay?',
        questionRu: 'Как происходит оплата?',
        answerRo: 'Prin transfer bancar, după confirmarea programării.',
        answerEn: 'By bank transfer, once your booking is confirmed.',
        answerRu: 'Банковским переводом, после подтверждения записи.',
        sortOrder: 1,
        active: true,
      },
      {
        id: 'i4',
        categoryId: 'c2',
        questionRo: 'Există posibilitatea de rambursare?',
        questionEn: 'Are refunds possible?',
        questionRu: null,
        answerRo: 'Da, dacă anulezi în timp util, conform politicii de anulare.',
        answerEn: 'Yes, if you cancel in good time, per the cancellation policy.',
        answerRu: null,
        sortOrder: 2,
        active: false,
      },
    ],
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sorted = () =>
  categories
    .map((c) => ({
      ...c,
      items: c.items.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

export async function fetchFaq(): Promise<FaqCategory[]> {
  await delay(400);
  return sorted();
}

export async function createFaqCategory(
  input: FaqCategoryInput,
): Promise<FaqCategory> {
  await delay(400);
  const created: FaqCategory = {
    ...input,
    id: crypto.randomUUID(),
    // Rough stand-in for the server's slugify — good enough for the mock.
    slug: input.titleRo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    sortOrder: categories.reduce((max, c) => Math.max(max, c.sortOrder), 0) + 1,
    items: [],
  };
  categories = [...categories, created];
  return created;
}

export async function updateFaqCategory(
  id: string,
  input: Partial<FaqCategoryInput> & { sortOrder?: number },
): Promise<FaqCategory> {
  await delay(350);
  let updated: FaqCategory | undefined;
  categories = categories.map((c) => {
    if (c.id !== id) return c;
    updated = { ...c, ...input };
    return updated;
  });
  if (!updated) throw new Error(`Faq category ${id} not found`);
  return updated;
}

export async function deleteFaqCategory(id: string): Promise<void> {
  await delay(400);
  categories = categories.filter((c) => c.id !== id);
}

export async function createFaqItem(input: FaqItemInput): Promise<FaqItem> {
  await delay(400);
  const parent = categories.find((c) => c.id === input.categoryId);
  if (!parent) throw new Error(`Faq category ${input.categoryId} not found`);
  const created: FaqItem = {
    ...input,
    id: crypto.randomUUID(),
    sortOrder:
      parent.items.reduce((max, i) => Math.max(max, i.sortOrder), 0) + 1,
  };
  categories = categories.map((c) =>
    c.id === parent.id ? { ...c, items: [...c.items, created] } : c,
  );
  return created;
}

export async function updateFaqItem(
  id: string,
  input: Partial<FaqItemInput> & { sortOrder?: number },
): Promise<FaqItem> {
  await delay(350);
  const before = categories
    .flatMap((c) => c.items)
    .find((i) => i.id === id);
  if (!before) throw new Error(`Faq item ${id} not found`);
  const updated: FaqItem = { ...before, ...input };

  if (updated.categoryId !== before.categoryId) {
    // Moving a question to another section moves the row, not just its key.
    categories = categories.map((c) =>
      c.id === updated.categoryId
        ? { ...c, items: [...c.items, updated] }
        : { ...c, items: c.items.filter((i) => i.id !== id) },
    );
  } else {
    categories = categories.map((c) => ({
      ...c,
      items: c.items.map((i) => (i.id === id ? updated : i)),
    }));
  }
  return updated;
}

export async function deleteFaqItem(id: string): Promise<void> {
  await delay(400);
  categories = categories.map((c) => ({
    ...c,
    items: c.items.filter((i) => i.id !== id),
  }));
}
