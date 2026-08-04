/**
 * Shared per-service marketing copy (descriptions + "what's included"), keyed
 * by service `code`. Single source of truth so the wording stays identical on
 * the homepage Services section, the /services page, and the /pricing page.
 * (→ move into the content API / back office later.)
 */

export interface BiList {
  ro: string[];
  en: string[];
  ru: string[];
}
export interface Bi {
  ro: string;
  en: string;
  ru: string;
}

/** Price (large) + duration/qualifier (small) per service, mirroring the
 *  homepage Services section so /pricing renders them the same way. */
export const SERVICE_PRICE_META: Record<string, { price: Bi; duration: Bi }> = {
  pediatric: {
    price: { ro: '28 €', en: '28 €', ru: '28 €' },
    duration: { ro: '30 min · video', en: '30 min · video', ru: '30 мин · видео' },
  },
  // Same price and length for both audiences — the difference is who the plan
  // is built for, and which calendar the booking lands in.
  nutrition_copii: {
    price: { ro: '38 €', en: '38 €', ru: '38 €' },
    duration: { ro: '60 min · video', en: '60 min · video', ru: '60 мин · видео' },
  },
  nutrition_adulti: {
    price: { ro: '38 €', en: '38 €', ru: '38 €' },
    duration: { ro: '60 min · video', en: '60 min · video', ru: '60 мин · видео' },
  },
  integrative: {
    price: { ro: '58 €', en: '58 €', ru: '58 €' },
    duration: { ro: '90 min · video', en: '90 min · video', ru: '90 мин · видео' },
  },
  monitoring: {
    price: { ro: 'la cerere', en: 'on request', ru: 'по запросу' },
    duration: { ro: '1–6 luni', en: '1–6 months', ru: '1–6 месяцев' },
  },
  quick_question: {
    price: { ro: '8 €', en: '8 €', ru: '8 €' },
    duration: { ro: '~1h · scris', en: '~1h · written', ru: '~1ч · письменно' },
  },
};

export const SERVICE_DESCRIPTIONS: Record<string, Bi> = {
  pediatric: {
    ro: 'O consultație video dedicată sănătății copilului — simptome, creștere, dezvoltare sau o a doua opinie.',
    en: "A focused video visit for your child's health — symptoms, growth, development, or a second opinion.",
    ru: 'Видеоконсультация о здоровье ребёнка — симптомы, рост, развитие или второе мнение.',
  },
  nutrition_copii: {
    ro: 'O analiză personalizată a alimentației copilului, pe bază de dovezi — de la diversificare la vârsta școlară.',
    en: 'A personalized, evidence-based look at your child’s nutrition — from first foods to school age.',
    ru: 'Персональный анализ питания ребёнка на основе доказательной медицины — от прикорма до школьного возраста.',
  },
  nutrition_adulti: {
    ro: 'O analiză personalizată a alimentației, pe bază de dovezi, pentru adulți — inclusiv în sarcină și alăptare.',
    en: 'A personalized, evidence-based look at nutrition for adults — including pregnancy and breastfeeding.',
    ru: 'Персональный анализ питания для взрослых на основе доказательной медицины — включая беременность и грудное вскармливание.',
  },
  integrative: {
    ro: 'O consultație amănunțită care îmbină pediatria și nutriția, cu un plan de urmat în timp.',
    en: 'An in-depth visit that combines pediatric and nutrition expertise, with a plan to follow over time.',
    ru: 'Подробная консультация, объединяющая педиатрию и нутрициологию, с планом на будущее.',
  },
  monitoring: {
    ro: 'Monitorizare și suport continuu — 4 tipuri de abonament, pe 1, 2, 3 sau 6 luni. Durata și prețul le stabilim individual cu medicul.',
    en: 'Continuous monitoring and support — 4 subscription types, over 1, 2, 3, or 6 months. Duration and price are set individually with the doctor.',
    ru: 'Постоянное наблюдение и поддержка — 4 типа абонемента на 1, 2, 3 или 6 месяцев. Длительность и цену врач согласует индивидуально.',
  },
  quick_question: {
    ro: 'Ai o singură întrebare? Primești un răspuns scris de la medic în ~1 oră în timpul programului de lucru.',
    en: 'Have one question? Get a written answer from the doctor within ~1 hour during working hours.',
    ru: 'Есть один вопрос? Получите письменный ответ от врача в течение ~1 часа в рабочее время.',
  },
};

export const SERVICE_INCLUDED: Record<string, BiList> = {
  pediatric: {
    ro: [
      'Apel video de 30 de minute',
      'Analiza simptomelor, a istoricului și a documentelor trimise',
      'Evaluare clară și pașii următori',
      'Plan scris cu recomandări, în 24 de ore',
    ],
    en: [
      '30-minute video call',
      'Review of symptoms, history, and any documents you share',
      'A clear assessment and next steps',
      'Written summary with recommendations within 24 hours',
    ],
    ru: [
      'Видеозвонок 30 минут',
      'Разбор симптомов, истории болезни и присланных документов',
      'Понятное заключение и дальнейшие шаги',
      'Письменный план с рекомендациями в течение 24 часов',
    ],
  },
  /**
   * Audience-neutral list for the surfaces that summarise nutrition as one
   * offering — the homepage tile and the /services row, both of which lead to
   * the single /nutrition page and offer both booking links. The catalog
   * itself is split; only these two summaries are not, because two tiles
   * differing by one word read as a duplicate rather than a choice.
   */
  nutrition: {
    ro: [
      'Apel video de 60 de minute',
      'Analiza obiceiurilor alimentare actuale',
      'Un plan alimentar personalizat',
      'Recomandări scrise după consultație',
    ],
    en: [
      '60-minute video call',
      'Analysis of current eating patterns',
      'A personalized nutrition plan',
      'Written recommendations after the call',
    ],
    ru: [
      'Видеозвонок 60 минут',
      'Анализ текущих привычек питания',
      'Персональный план питания',
      'Письменные рекомендации после консультации',
    ],
  },
  nutrition_copii: {
    ro: [
      'Apel video de 60 de minute',
      'Analiza obiceiurilor alimentare actuale ale copilului',
      'Un plan alimentar personalizat, adaptat vârstei',
      'Recomandări scrise după consultație',
    ],
    en: [
      '60-minute video call',
      'Analysis of the child’s current eating patterns',
      'A personalized, age-appropriate nutrition plan',
      'Written recommendations after the call',
    ],
    ru: [
      'Видеозвонок 60 минут',
      'Анализ текущих пищевых привычек ребёнка',
      'Персональный план питания по возрасту',
      'Письменные рекомендации после консультации',
    ],
  },
  nutrition_adulti: {
    ro: [
      'Apel video de 60 de minute',
      'Analiza obiceiurilor alimentare actuale',
      'Un plan alimentar personalizat',
      'Recomandări scrise după consultație',
    ],
    en: [
      '60-minute video call',
      'Analysis of current eating patterns',
      'A personalized nutrition plan',
      'Written recommendations after the call',
    ],
    ru: [
      'Видеозвонок 60 минут',
      'Анализ текущих привычек питания',
      'Персональный план питания',
      'Письменные рекомендации после консультации',
    ],
  },
  integrative: {
    ro: [
      'Apel video amănunțit de 90 de minute',
      'Evaluare pediatrică și nutrițională combinată',
      'Un plan de acțiune personalizat',
      'Prima urmărire / monitorizare inclusă',
    ],
    en: [
      '90-minute in-depth video call',
      'Combined pediatric and nutrition assessment',
      'A tailored action plan',
      'Initial follow-up / monitoring included',
    ],
    ru: [
      'Подробный видеозвонок 90 минут',
      'Совместная педиатрическая и нутрициологическая оценка',
      'Индивидуальный план действий',
      'Первичное наблюдение / мониторинг включены',
    ],
  },
  monitoring: {
    ro: [
      'Monitorizare periodică (greutate, creștere, alimentație, analize)',
      'Ajustarea planului medical sau alimentar pe parcurs',
      'Comunicare directă cu medicul (email/WhatsApp)',
      'Prioritate la programarea consultațiilor',
    ],
    en: [
      'Periodic monitoring (weight, growth, diet, lab results)',
      'Adjusting the medical or nutrition plan over time',
      'Direct communication with the doctor (email/WhatsApp)',
      'Priority when booking consultations',
    ],
    ru: [
      'Периодическое наблюдение (вес, рост, питание, анализы)',
      'Корректировка медицинского или пищевого плана',
      'Прямая связь с врачом (email/WhatsApp)',
      'Приоритет при записи на консультации',
    ],
  },
  quick_question: {
    ro: [
      'Trimiți întrebarea (cu poze sau documente, dacă e cazul)',
      'Răspuns scris în ~1 oră în timpul programului de lucru',
      'O rundă de clarificări',
    ],
    en: [
      'Submit your question (with photos or documents if needed)',
      'A written reply within ~1 hour during working hours',
      'One round of clarification',
    ],
    ru: [
      'Отправляете вопрос (с фото или документами, если нужно)',
      'Письменный ответ в течение ~1 часа в рабочее время',
      'Один круг уточнений',
    ],
  },
};
