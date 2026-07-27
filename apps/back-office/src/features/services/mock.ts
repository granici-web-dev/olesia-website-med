import type {
  Service,
  ServiceCode,
  ServiceGroup,
  ServiceInput,
} from '@/features/services/types';

/** Fixed catalog of service codes → group + default duration (group A). */
export const CODE_META: Record<
  ServiceCode,
  { group: ServiceGroup; defaultDuration: number | null }
> = {
  pediatric: { group: 'A_booking', defaultDuration: 30 },
  nutrition: { group: 'A_booking', defaultDuration: 60 },
  integrative: { group: 'A_booking', defaultDuration: 90 },
  monitoring: { group: 'B_portal', defaultDuration: null },
  quick_question: { group: 'B_portal', defaultDuration: null },
  free_consult: { group: 'A_booking', defaultDuration: 30 },
};

export const ALL_CODES = Object.keys(CODE_META) as ServiceCode[];

export function groupForCode(code: ServiceCode): ServiceGroup {
  return CODE_META[code].group;
}

const priceFmt = new Intl.NumberFormat('ro-RO');

export function formatPrice(eur: number): string {
  return `${priceFmt.format(eur)} €`;
}

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory CRUD, shaped like the eventual REST API.
 * TODO(api): replace with HTTP calls to /services (GET public,
 * POST/PATCH/DELETE admin/editor). See module_calendly.md §6.
 * ------------------------------------------------------------------ */

let store: Service[] = [
  {
    id: 's1',
    code: 'pediatric',
    group: 'A_booking',
    titleRo: 'Consultație pediatrică',
    titleEn: 'Pediatric consultation',
    titleRu: 'Педиатрическая консультация',
    descriptionRo:
      'Evaluare completă a stării de sănătate a copilului, cu recomandări personalizate.',
    descriptionEn:
      'Comprehensive assessment of the child’s health, with personalized recommendations.',
    descriptionRu:
      'Полная оценка состояния здоровья ребёнка с персональными рекомендациями.',
    durationMin: 30,
    price: 28,
    priceLabelRo: null,
    priceLabelEn: null,
    priceLabelRu: null,
    calendlyEventTypeUri: 'https://api.calendly.com/event_types/PEDIATRIC',
    calendlySchedulingUrl:
      'https://calendly.com/designer-nefele/consulta-ie-pediatrica-clone',
    sortOrder: 1,
    active: true,
  },
  {
    id: 's2',
    code: 'nutrition',
    group: 'A_booking',
    titleRo: 'Consultație nutrițională',
    titleEn: 'Nutrition consultation',
    titleRu: 'Консультация по питанию',
    descriptionRo:
      'Plan alimentar adaptat vârstei și nevoilor copilului, cu obiective clare.',
    descriptionEn:
      'A meal plan tailored to the child’s age and needs, with clear goals.',
    descriptionRu:
      'План питания с учётом возраста и потребностей ребёнка, с чёткими целями.',
    durationMin: 60,
    price: 38,
    priceLabelRo: null,
    priceLabelEn: null,
    priceLabelRu: null,
    calendlyEventTypeUri: 'https://api.calendly.com/event_types/NUTRITION',
    calendlySchedulingUrl:
      'https://calendly.com/designer-nefele/consulta-ie-nutri-ionala-clone',
    sortOrder: 2,
    active: true,
  },
  {
    id: 's3',
    code: 'integrative',
    group: 'A_booking',
    titleRo: 'Consultație integrativă & monitorizare',
    titleEn: 'Integrative consultation & monitoring',
    titleRu: 'Интегративная консультация и наблюдение',
    descriptionRo:
      'Abordare integrativă a sănătății copilului, cu monitorizare pe parcurs.',
    descriptionEn:
      'An integrative approach to the child’s health, with ongoing monitoring.',
    descriptionRu:
      'Интегративный подход к здоровью ребёнка с наблюдением в динамике.',
    durationMin: 90,
    price: 58,
    priceLabelRo: null,
    priceLabelEn: null,
    priceLabelRu: null,
    calendlyEventTypeUri: 'https://api.calendly.com/event_types/INTEGRATIVE',
    calendlySchedulingUrl:
      'https://calendly.com/designer-nefele/consulta-ie-integrativa-monitorizare-clone',
    sortOrder: 3,
    active: true,
  },
  {
    id: 's4',
    code: 'monitoring',
    group: 'B_portal',
    titleRo: 'Monitorizare 3 luni',
    titleEn: '3-month monitoring',
    titleRu: 'Наблюдение 3 месяца',
    descriptionRo:
      'Acompaniere timp de 3 luni: mesagerie, ajustări și 2 apeluri video pe lună.',
    descriptionEn:
      'Three months of support: messaging, adjustments and 2 video calls per month.',
    descriptionRu:
      'Сопровождение в течение 3 месяцев: переписка, корректировки и 2 видеозвонка в месяц.',
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
    id: 's5',
    code: 'quick_question',
    group: 'B_portal',
    titleRo: 'Întrebare EXPRESS',
    titleEn: 'Express question',
    titleRu: 'Вопрос EXPRESS',
    descriptionRo:
      'Răspuns scris la o întrebare punctuală, în ~1 oră în timpul programului de lucru.',
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
    active: false,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchServices(): Promise<Service[]> {
  await delay(500);
  return store.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createService(input: ServiceInput): Promise<Service> {
  await delay(500);
  const created: Service = { ...input, id: crypto.randomUUID() };
  store = [...store, created];
  return created;
}

export async function updateService(
  id: string,
  input: ServiceInput,
): Promise<Service> {
  await delay(500);
  let updated: Service | undefined;
  store = store.map((s) => {
    if (s.id !== id) return s;
    updated = { ...input, id };
    return updated;
  });
  if (!updated) throw new Error(`Service ${id} not found`);
  return updated;
}

export async function deleteService(id: string): Promise<void> {
  await delay(450);
  store = store.filter((s) => s.id !== id);
}

export async function setServiceActive(
  id: string,
  active: boolean,
): Promise<Service> {
  await delay(300);
  let updated: Service | undefined;
  store = store.map((s) => {
    if (s.id !== id) return s;
    updated = { ...s, active };
    return updated;
  });
  if (!updated) throw new Error(`Service ${id} not found`);
  return updated;
}
