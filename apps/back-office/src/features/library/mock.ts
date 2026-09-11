import type {
  Material,
  MaterialCategory,
  MaterialCategoryInput,
  MaterialInput,
  UploadedFileInfo,
} from '@/features/library/types';

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory, shaped like the real endpoints.
 * A slice of the seeded catalog, including one material with no file, which
 * is the normal state right now: the client has not sent any PDFs yet.
 * ------------------------------------------------------------------ */

let categories: MaterialCategory[] = [
  {
    id: 'c1',
    slug: 'diversificare',
    nameRo: 'Alimentație complementară',
    nameEn: 'Complementary feeding',
    nameRu: 'Прикорм',
    sortOrder: 1,
  },
  {
    id: 'c2',
    slug: 'urgente',
    nameRo: 'Urgențe și prim ajutor',
    nameEn: 'Emergencies & first aid',
    nameRu: 'Неотложная помощь',
    sortOrder: 2,
  },
];

let store: Material[] = [
  {
    id: 'm1',
    slug: 'diversificarea-alimentatiei',
    categoryId: 'c1',
    categorySlug: 'diversificare',
    ageKeys: ['6-12m'],
    titleRo: 'Diversificarea alimentației — primii pași',
    titleEn: 'Starting solids — the first steps',
    titleRu: 'Введение прикорма — первые шаги',
    descriptionRo: 'Când și cum începi diversificarea, în siguranță.',
    descriptionEn: 'When and how to start solids, safely.',
    descriptionRu: 'Когда и как начинать прикорм — безопасно.',
    pageCount: 16,
    fileLang: 'RO',
    access: 'free',
    price: null,
    flags: ['recommended', 'popular'],
    fileUrl: null,
    fileKey: null,
    fileName: null,
    sortOrder: 1,
    active: true,
  },
  {
    id: 'm2',
    slug: 'febra-la-copii',
    categoryId: 'c2',
    categorySlug: 'urgente',
    ageKeys: ['0-6m', '6-12m', '1-3y'],
    titleRo: 'Febra la copii — ghid pas cu pas',
    titleEn: 'Fever in children — a step-by-step guide',
    titleRu: 'Температура у детей — пошаговый гайд',
    descriptionRo: 'Cum măsori corect și când suni medicul.',
    descriptionEn: 'How to measure correctly and when to call the doctor.',
    descriptionRu: 'Как правильно измерять и когда звонить врачу.',
    pageCount: 10,
    fileLang: 'RO',
    access: 'paid',
    price: 7,
    flags: ['popular'],
    fileUrl: null,
    fileKey: null,
    fileName: null,
    sortOrder: 2,
    active: true,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchMaterials(): Promise<Material[]> {
  await delay(400);
  return store.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchMaterialCategories(): Promise<MaterialCategory[]> {
  await delay(250);
  return categories.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createMaterial(input: MaterialInput): Promise<Material> {
  await delay(400);
  const category = categories.find((c) => c.id === input.categoryId);
  const created: Material = {
    ...input,
    id: crypto.randomUUID(),
    categorySlug: category?.slug ?? '',
    sortOrder: store.reduce((max, m) => Math.max(max, m.sortOrder), 0) + 1,
  };
  store = [...store, created];
  return created;
}

export async function updateMaterial(
  id: string,
  input: Partial<MaterialInput> & { sortOrder?: number },
): Promise<Material> {
  await delay(350);
  let updated: Material | undefined;
  store = store.map((m) => {
    if (m.id !== id) return m;
    const categorySlug = input.categoryId
      ? (categories.find((c) => c.id === input.categoryId)?.slug ??
        m.categorySlug)
      : m.categorySlug;
    updated = { ...m, ...input, categorySlug };
    return updated;
  });
  if (!updated) throw new Error(`Material ${id} not found`);
  return updated;
}

export async function deleteMaterial(id: string): Promise<void> {
  await delay(400);
  store = store.filter((m) => m.id !== id);
}

export async function createMaterialCategory(
  input: MaterialCategoryInput,
): Promise<MaterialCategory> {
  await delay(350);
  const created: MaterialCategory = {
    ...input,
    id: crypto.randomUUID(),
    slug: input.nameRo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    sortOrder: categories.reduce((max, c) => Math.max(max, c.sortOrder), 0) + 1,
  };
  categories = [...categories, created];
  return created;
}

export async function updateMaterialCategory(
  id: string,
  input: Partial<MaterialCategoryInput>,
): Promise<MaterialCategory> {
  await delay(300);
  let updated: MaterialCategory | undefined;
  categories = categories.map((c) => {
    if (c.id !== id) return c;
    updated = { ...c, ...input };
    return updated;
  });
  if (!updated) throw new Error(`Material category ${id} not found`);
  return updated;
}

export async function deleteMaterialCategory(id: string): Promise<void> {
  await delay(350);
  if (store.some((m) => m.categoryId === id)) {
    throw new Error('material_category_in_use');
  }
  categories = categories.filter((c) => c.id !== id);
}

export async function uploadMaterialFile(
  file: File,
): Promise<UploadedFileInfo> {
  await delay(700);
  return { url: URL.createObjectURL(file), name: file.name };
}

/**
 * A key rather than a URL, because that is what the real endpoint answers —
 * a paid file has no public address, which is the whole point of the second
 * endpoint existing.
 */
export async function uploadPrivateMaterialFile(
  file: File,
): Promise<UploadedFileInfo> {
  await delay(700);
  return { key: `${crypto.randomUUID()}.pdf`, name: file.name };
}
