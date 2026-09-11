/**
 * Per-service "what's included" copy, keyed by service `code`.
 *
 * The descriptions used to live here too, and they shadowed the API's
 * (audit A6, F7): the doctor could rewrite a service in the back office and the
 * site kept showing the sentence compiled into the bundle. They are gone — the
 * description comes from `Service.description*` and nowhere else.
 *
 * These lists stay, and are copywriting rather than data: they are not fields
 * on `Service`, nothing in the back office edits them, and they are shared by
 * the homepage tile and the /pricing row so the two cannot drift. They move
 * into the catalog with `PLAN.md` step 8c, which is what gives them somewhere
 * to be edited from.
 *
 * Two exceptions are data, not copy, and are left as slots for the reader to
 * fill: `{slaInHours}` from `WorkingHours.expressSlaMinutes` (audit A6, F12)
 * and `{duration}` from the catalog's `durationMin` (audit A7, F2). Both are
 * numbers the client edits in the back office, and both were written out in
 * full here while she edited them somewhere else.
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

/** The three description fields, so a caller can pass a narrower object. */
export interface ServiceDescriptionFields {
  descriptionRo: string;
  descriptionEn: string;
  descriptionRu: string | null;
}

/**
 * The description the client wrote, in the reader's language.
 *
 * Same RU → RO fallback as `loc()`, with one difference that matters here: it
 * returns an empty string when there is nothing to say, so a service with no
 * description renders no paragraph rather than an empty one.
 */
export function serviceDescription(
  locale: string,
  service: ServiceDescriptionFields,
): string {
  const pick =
    locale === 'ru'
      ? service.descriptionRu
      : locale === 'en'
        ? service.descriptionEn
        : service.descriptionRo;
  return (pick?.trim() ? pick : service.descriptionRo).trim();
}

export const SERVICE_INCLUDED: Record<string, BiList> = {
  pediatric: {
    ro: [
      'Apel video · {duration}',
      'Analiza simptomelor, a istoricului și a documentelor trimise',
      'Evaluare clară și pașii următori',
      'Plan scris cu recomandări, în 24 de ore',
    ],
    en: [
      'Video call · {duration}',
      'Review of symptoms, history, and any documents you share',
      'A clear assessment and next steps',
      'Written summary with recommendations within 24 hours',
    ],
    ru: [
      'Видеозвонок · {duration}',
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
      'Apel video · {duration}',
      'Analiza obiceiurilor alimentare actuale',
      'Un plan alimentar personalizat',
      'Recomandări scrise după consultație',
    ],
    en: [
      'Video call · {duration}',
      'Analysis of current eating patterns',
      'A personalized nutrition plan',
      'Written recommendations after the call',
    ],
    ru: [
      'Видеозвонок · {duration}',
      'Анализ текущих привычек питания',
      'Персональный план питания',
      'Письменные рекомендации после консультации',
    ],
  },
  nutrition_copii: {
    ro: [
      'Apel video · {duration}',
      'Analiza obiceiurilor alimentare actuale ale copilului',
      'Un plan alimentar personalizat, adaptat vârstei',
      'Recomandări scrise după consultație',
    ],
    en: [
      'Video call · {duration}',
      'Analysis of the child’s current eating patterns',
      'A personalized, age-appropriate nutrition plan',
      'Written recommendations after the call',
    ],
    ru: [
      'Видеозвонок · {duration}',
      'Анализ текущих пищевых привычек ребёнка',
      'Персональный план питания по возрасту',
      'Письменные рекомендации после консультации',
    ],
  },
  nutrition_adulti: {
    ro: [
      'Apel video · {duration}',
      'Analiza obiceiurilor alimentare actuale',
      'Un plan alimentar personalizat',
      'Recomandări scrise după consultație',
    ],
    en: [
      'Video call · {duration}',
      'Analysis of current eating patterns',
      'A personalized nutrition plan',
      'Written recommendations after the call',
    ],
    ru: [
      'Видеозвонок · {duration}',
      'Анализ текущих привычек питания',
      'Персональный план питания',
      'Письменные рекомендации после консультации',
    ],
  },
  integrative: {
    ro: [
      'Apel video amănunțit · {duration}',
      'Evaluare pediatrică și nutrițională combinată',
      'Un plan de acțiune personalizat',
      'Prima urmărire / monitorizare inclusă',
    ],
    en: [
      'In-depth video call · {duration}',
      'Combined pediatric and nutrition assessment',
      'A tailored action plan',
      'Initial follow-up / monitoring included',
    ],
    ru: [
      'Подробный видеозвонок · {duration}',
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
      'Răspuns scris în {slaInHours}',
      'O rundă de clarificări',
    ],
    en: [
      'Submit your question (with photos or documents if needed)',
      'A written reply within {slaInHours}',
      'One round of clarification',
    ],
    ru: [
      'Отправляете вопрос (с фото или документами, если нужно)',
      'Письменный ответ в течение {slaInHours}',
      'Один круг уточнений',
    ],
  },
};

/**
 * The list a reader sees: the copy above with its `{duration}` and
 * `{slaInHours}` slots filled from the API.
 *
 * A slot the API has nothing for leaves the separator behind, so the dangling
 * " · " is trimmed rather than shown — `PRINCIPLES.md` asks for a missing value
 * to be rendered as missing, not as punctuation.
 */
export function fillIncluded(
  items: string[],
  facts: { duration: string | null; slaInHours: string },
): string[] {
  return items.map((item) =>
    item
      .split('{duration}')
      .join(facts.duration ?? '')
      .split('{slaInHours}')
      .join(facts.slaInHours)
      .replace(/\s*·\s*$/, '')
      .trim(),
  );
}
