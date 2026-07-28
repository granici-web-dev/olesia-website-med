import type {
  Testimonial,
  TestimonialInput,
} from '@/features/testimonials/types';

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory, shaped like the real endpoints.
 *
 * These are the two reviews the client actually sent (`docs/testemonials.md`),
 * shortened here. ⚠️ Do not pad this list with invented reviews to make the UI
 * look fuller: placeholder testimonials have twice escaped into production.
 * ------------------------------------------------------------------ */

let store: Testimonial[] = [
  {
    id: 't1',
    quoteRo:
      'Mulțumesc mult doamnei doctor pentru tratamentul competent al copilului. Doctorul a fost foarte atent și mi-a explicat pe înțeles schema de tratament.',
    quoteEn:
      'Thank you so much for the competent care of our child. The doctor was very attentive and explained the treatment plan in plain language.',
    quoteRu:
      'Спасибо большое доктору за грамотное лечение ребёнка. Доктор был очень внимателен и доступно объяснил курс лечения.',
    author: null,
    roleRo: 'copil tratat de pneumonie',
    roleEn: 'child treated for pneumonia',
    roleRu: 'ребёнок лечился от пневмонии',
    source: null,
    sortOrder: 1,
    active: true,
  },
  {
    id: 't2',
    quoteRo:
      'Mulțumesc că mi-ați calmat fricile și mi-ați sugerat soluțiile potrivite situației noastre! 🙏🌸',
    quoteEn:
      'Thank you for calming my fears and suggesting the right solutions for our situation! 🙏🌸',
    quoteRu:
      'Спасибо, что успокоили мои страхи и подсказали решения, подходящие нашей ситуации! 🙏🌸',
    author: 'Cociu Felicia',
    roleRo: null,
    roleEn: null,
    roleRu: null,
    source: null,
    sortOrder: 2,
    active: true,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchTestimonials(): Promise<Testimonial[]> {
  await delay(400);
  return store.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createTestimonial(
  input: TestimonialInput,
): Promise<Testimonial> {
  await delay(400);
  const created: Testimonial = {
    ...input,
    id: crypto.randomUUID(),
    sortOrder: store.reduce((max, t) => Math.max(max, t.sortOrder), 0) + 1,
  };
  store = [...store, created];
  return created;
}

export async function updateTestimonial(
  id: string,
  input: Partial<TestimonialInput> & { sortOrder?: number },
): Promise<Testimonial> {
  await delay(350);
  let updated: Testimonial | undefined;
  store = store.map((t) => {
    if (t.id !== id) return t;
    updated = { ...t, ...input };
    return updated;
  });
  if (!updated) throw new Error(`Testimonial ${id} not found`);
  return updated;
}

export async function deleteTestimonial(id: string): Promise<void> {
  await delay(400);
  store = store.filter((t) => t.id !== id);
}
