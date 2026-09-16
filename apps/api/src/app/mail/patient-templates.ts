/**
 * What we write to a patient, in the language they wrote to us in.
 *
 * Plain text only. These messages carry medical content to a parent, and a
 * text body has no rendering to get wrong, no remote images to leak a read
 * receipt, and nothing for an HTML sanitizer to be responsible for.
 *
 * Every message has all three locales, the same rule page copy follows
 * (`AGENTS.md` R3). A locale the templates do not have falls back to `ro`,
 * which is also what an old row with no recorded locale reads as.
 */
import { Locale } from '@olesia/shared';

export interface PatientMessage {
  subject: string;
  lines: string[];
}

type Templates<Vars> = Record<Locale, (vars: Vars) => PatientMessage>;

/**
 * The locale to write in. Anything unrecognised — an old row, a value from a
 * database somebody edited by hand — is Romanian rather than an error: a
 * patient reading the wrong language still gets their answer.
 */
export function templateLocale(raw: string | null | undefined): Locale {
  return raw === Locale.En || raw === Locale.Ru ? raw : Locale.Ro;
}

export function render<Vars>(
  templates: Templates<Vars>,
  locale: string | null | undefined,
  vars: Vars,
): PatientMessage {
  return templates[templateLocale(locale)](vars);
}

const SIGNATURE: Record<Locale, string[]> = {
  [Locale.Ro]: ['', 'Cu drag,', 'Dr. Olesea Jalba'],
  [Locale.En]: ['', 'Warm regards,', 'Dr. Olesea Jalba'],
  [Locale.Ru]: ['', 'С теплом,', 'Др. Олеся Жалба'],
};

/* ------------------------- EXPRESS answer ------------------------- */

export interface AnswerVars {
  clientName: string;
  question: string;
  answer: string;
}

export const ANSWER_TEMPLATES: Templates<AnswerVars> = {
  [Locale.Ro]: (v) => ({
    subject: 'Răspunsul la întrebarea dumneavoastră',
    lines: [
      `Bună ziua, ${v.clientName},`,
      '',
      'Mai jos este răspunsul la întrebarea trimisă prin „Întrebare EXPRESS".',
      '',
      'Întrebarea dumneavoastră:',
      v.question,
      '',
      'Răspuns:',
      v.answer,
      '',
      'Dacă ceva a rămas neclar, puteți răspunde la acest email cu o rundă de clarificări.',
      ...SIGNATURE[Locale.Ro],
    ],
  }),
  [Locale.En]: (v) => ({
    subject: 'The answer to your question',
    lines: [
      `Hello ${v.clientName},`,
      '',
      'Below is the answer to the question you sent through "Quick question".',
      '',
      'Your question:',
      v.question,
      '',
      'Answer:',
      v.answer,
      '',
      'If anything is unclear, reply to this email and we will clarify once.',
      ...SIGNATURE[Locale.En],
    ],
  }),
  [Locale.Ru]: (v) => ({
    subject: 'Ответ на ваш вопрос',
    lines: [
      `Здравствуйте, ${v.clientName}!`,
      '',
      'Ниже — ответ на вопрос, отправленный через «Экспресс-вопрос».',
      '',
      'Ваш вопрос:',
      v.question,
      '',
      'Ответ:',
      v.answer,
      '',
      'Если что-то осталось непонятным, ответьте на это письмо — уточним один раз.',
      ...SIGNATURE[Locale.Ru],
    ],
  }),
};

/* ---------------------- Preparation instructions ---------------------- */

export interface PrepVars {
  clientName: string;
  serviceTitle: string;
  /** Already formatted in the practice's timezone. */
  startsAt: string;
  videoUrl: string | null;
  checklist: string;
}

const videoLine = (url: string | null, label: string): string[] =>
  url ? [`${label}: ${url}`] : [];

export const PREP_TEMPLATES: Templates<PrepVars> = {
  [Locale.Ro]: (v) => ({
    subject: `Pregătirea pentru consultație — ${v.serviceTitle}`,
    lines: [
      `Bună ziua, ${v.clientName},`,
      '',
      `Consultația „${v.serviceTitle}" are loc pe ${v.startsAt}.`,
      ...videoLine(v.videoUrl, 'Link video'),
      '',
      'Ca discuția să fie cât mai utilă, pregătiți vă rog:',
      v.checklist,
      ...SIGNATURE[Locale.Ro],
    ],
  }),
  [Locale.En]: (v) => ({
    subject: `Preparing for your consultation — ${v.serviceTitle}`,
    lines: [
      `Hello ${v.clientName},`,
      '',
      `Your "${v.serviceTitle}" consultation takes place on ${v.startsAt}.`,
      ...videoLine(v.videoUrl, 'Video link'),
      '',
      'To make the most of it, please prepare:',
      v.checklist,
      ...SIGNATURE[Locale.En],
    ],
  }),
  [Locale.Ru]: (v) => ({
    subject: `Подготовка к консультации — ${v.serviceTitle}`,
    lines: [
      `Здравствуйте, ${v.clientName}!`,
      '',
      `Консультация «${v.serviceTitle}» состоится ${v.startsAt}.`,
      ...videoLine(v.videoUrl, 'Ссылка на видео'),
      '',
      'Чтобы встреча прошла с максимальной пользой, подготовьте, пожалуйста:',
      v.checklist,
      ...SIGNATURE[Locale.Ru],
    ],
  }),
};

/* -------------------------- Upload link -------------------------- */

export interface UploadLinkVars {
  clientName: string;
  url: string;
  /** Already formatted in the practice's timezone. */
  expiresAt: string;
}

export const UPLOAD_LINK_TEMPLATES: Templates<UploadLinkVars> = {
  [Locale.Ro]: (v) => ({
    subject: 'Încărcarea analizelor înainte de consultație',
    lines: [
      `Bună ziua, ${v.clientName},`,
      '',
      'Pentru ca discuția noastră să fie cât mai utilă, puteți trimite în avans analizele, investigațiile și documentele medicale relevante:',
      v.url,
      '',
      `Linkul este personal și expiră la ${v.expiresAt}.`,
      ...SIGNATURE[Locale.Ro],
    ],
  }),
  [Locale.En]: (v) => ({
    subject: 'Sending your test results before the consultation',
    lines: [
      `Hello ${v.clientName},`,
      '',
      'So that our conversation is as useful as possible, you can send your test results, investigations and relevant medical documents in advance:',
      v.url,
      '',
      `The link is personal and expires on ${v.expiresAt}.`,
      ...SIGNATURE[Locale.En],
    ],
  }),
  [Locale.Ru]: (v) => ({
    subject: 'Загрузка анализов перед консультацией',
    lines: [
      `Здравствуйте, ${v.clientName}!`,
      '',
      'Чтобы разговор был максимально полезным, вы можете заранее прислать анализы, обследования и другие медицинские документы:',
      v.url,
      '',
      `Ссылка персональная и действует до ${v.expiresAt}.`,
      ...SIGNATURE[Locale.Ru],
    ],
  }),
};

/* -------------------------- Payment receipt -------------------------- */

/**
 * The confirmation maib's go-live checklist requires after every payment
 * (docs/payments-maib-checkout.md §8).
 *
 * It names the merchant and carries the order reference, the amount and the
 * date, because those are what a person needs when a line on their card
 * statement does not look like anything they remember buying. The legal entity
 * comes from the environment, so this reads "the practice" until the client's
 * incorporation lands rather than naming a company that does not exist yet.
 */
export interface PaymentReceiptVars {
  clientName: string;
  orderId: string;
  /** What was bought, in Romanian as the catalog names it. */
  description: string;
  /** Already formatted with its currency. */
  amount: string;
  /** Already formatted in the practice's timezone. */
  paidAt: string;
  /** Registered entity, or an empty string while it is still missing. */
  merchant: string;
  /**
   * What the buyer can do now, for the two purchases that hand something over
   * the moment they are paid: a group-C order gets the link it sends its
   * documents through, a paid material gets the file. Absent for the rest, and
   * the block then does not render.
   */
  nextStep?: ReceiptNextStep;
}

/**
 * The "what you can do now" block. `expiresAt` is already formatted in the
 * practice's timezone; `downloads` is how many times the file may still be
 * fetched, and is present only for a material.
 */
export interface ReceiptNextStep {
  kind: 'order_documents' | 'material_download';
  url: string;
  expiresAt: string;
  downloads?: number;
}

const merchantLine = (merchant: string, label: string): string[] =>
  merchant ? [`${label}: ${merchant}`] : [];

/**
 * The next-step block, in one language. Written once per locale rather than
 * assembled from fragments: these are four sentences a parent reads, and a
 * sentence stitched from clauses reads like one.
 */
const NEXT_STEP_BLOCK: Record<Locale, (s: ReceiptNextStep) => string[]> = {
  [Locale.Ro]: (s) =>
    s.kind === 'order_documents'
      ? [
          '',
          'Ce urmează: trimiteți documentele de care avem nevoie (analize, investigații, jurnal alimentar) prin linkul personal de mai jos.',
          s.url,
          `Linkul este valabil până la ${s.expiresAt}.`,
        ]
      : [
          '',
          'Materialul dumneavoastră se descarcă de aici:',
          s.url,
          `Linkul este personal, este valabil până la ${s.expiresAt} și permite ${s.downloads} descărcări.`,
        ],
  [Locale.En]: (s) =>
    s.kind === 'order_documents'
      ? [
          '',
          'What happens next: send us the documents we need (test results, investigations, a food diary) through your personal link below.',
          s.url,
          `The link works until ${s.expiresAt}.`,
        ]
      : [
          '',
          'Your material downloads from here:',
          s.url,
          `The link is personal, works until ${s.expiresAt} and allows ${s.downloads} downloads.`,
        ],
  [Locale.Ru]: (s) =>
    s.kind === 'order_documents'
      ? [
          '',
          'Что дальше: пришлите нужные нам документы (анализы, обследования, пищевой дневник) по личной ссылке ниже.',
          s.url,
          `Ссылка действует до ${s.expiresAt}.`,
        ]
      : [
          '',
          'Ваш материал можно скачать здесь:',
          s.url,
          `Ссылка персональная, действует до ${s.expiresAt} и допускает ${s.downloads} скачиваний.`,
        ],
};

const nextStepLines = (locale: Locale, step?: ReceiptNextStep): string[] =>
  step ? NEXT_STEP_BLOCK[locale](step) : [];

export const PAYMENT_RECEIPT_TEMPLATES: Templates<PaymentReceiptVars> = {
  [Locale.Ro]: (v) => ({
    subject: `Confirmarea plății — comanda ${v.orderId}`,
    lines: [
      `Bună ziua, ${v.clientName},`,
      '',
      'Am primit plata dumneavoastră. Detaliile comenzii:',
      '',
      `Comanda: ${v.orderId}`,
      `Serviciu: ${v.description}`,
      `Sumă: ${v.amount}`,
      `Data plății: ${v.paidAt}`,
      ...merchantLine(v.merchant, 'Prestator'),
      ...nextStepLines(Locale.Ro, v.nextStep),
      '',
      'Păstrați acest email: conține referința comenzii, utilă dacă aveți întrebări despre plată.',
      ...SIGNATURE[Locale.Ro],
    ],
  }),
  [Locale.En]: (v) => ({
    subject: `Payment confirmation — order ${v.orderId}`,
    lines: [
      `Hello ${v.clientName},`,
      '',
      'We have received your payment. The order details:',
      '',
      `Order: ${v.orderId}`,
      `Service: ${v.description}`,
      `Amount: ${v.amount}`,
      `Paid on: ${v.paidAt}`,
      ...merchantLine(v.merchant, 'Provider'),
      ...nextStepLines(Locale.En, v.nextStep),
      '',
      'Keep this email: it carries the order reference, which is what to quote if you have a question about the payment.',
      ...SIGNATURE[Locale.En],
    ],
  }),
  [Locale.Ru]: (v) => ({
    subject: `Подтверждение оплаты — заказ ${v.orderId}`,
    lines: [
      `Здравствуйте, ${v.clientName}!`,
      '',
      'Мы получили вашу оплату. Детали заказа:',
      '',
      `Заказ: ${v.orderId}`,
      `Услуга: ${v.description}`,
      `Сумма: ${v.amount}`,
      `Дата оплаты: ${v.paidAt}`,
      ...merchantLine(v.merchant, 'Исполнитель'),
      ...nextStepLines(Locale.Ru, v.nextStep),
      '',
      'Сохраните это письмо: в нём номер заказа, который пригодится при любом вопросе об оплате.',
      ...SIGNATURE[Locale.Ru],
    ],
  }),
};

/* --------------------- Prescription and document --------------------- */

/*
 * Sent by the doctor from the dossier (docs/shape-send-prescription.md). The
 * greeting carries no name: a dossier is often the child's, and the address
 * the parent's, so "Hello Maria" would be written to her mother.
 */

export interface PrescriptionVars {
  title: string | null;
  /** The entry's text as she wrote it; markdown goes out as typed. Null when
   * the prescription is only a file. */
  body: string | null;
  /** Whether the prescription's file goes with the message
   * (docs/shape-prescription-file.md). */
  attached: boolean;
}

const titleLines = (title: string | null): string[] =>
  title ? [title, ''] : [];

/*
 * Three shapes from one template: text only (the step 19 message, line for
 * line), text and file (plus a line naming the attachment), file only (an
 * intro that says it is attached, and no empty body). The email makes no claim
 * about what the file is worth at a pharmacy: that is the client's to say
 * (docs/questions_v3.md §8.4).
 */
const prescriptionBody = (
  v: PrescriptionVars,
  attachedAlsoLine: string,
): string[] => [
  ...titleLines(v.title),
  ...(v.body === null ? [] : [v.body, '']),
  ...(v.body !== null && v.attached ? [attachedAlsoLine, ''] : []),
];

export const PRESCRIPTION_TEMPLATES: Templates<PrescriptionVars> = {
  [Locale.Ro]: (v) => ({
    subject: 'Rețeta dumneavoastră',
    lines: [
      'Bună ziua,',
      '',
      v.body === null
        ? 'Rețeta de la Dr. Olesea Jalba este atașată la acest email.'
        : 'Mai jos este rețeta de la Dr. Olesea Jalba.',
      '',
      ...prescriptionBody(
        v,
        'Rețeta este atașată și ca fișier la acest email.',
      ),
      'Dacă aveți întrebări despre administrare, răspundeți la acest email.',
      ...SIGNATURE[Locale.Ro],
    ],
  }),
  [Locale.En]: (v) => ({
    subject: 'Your prescription',
    lines: [
      'Hello,',
      '',
      v.body === null
        ? 'Your prescription from Dr. Olesea Jalba is attached to this email.'
        : 'Below is your prescription from Dr. Olesea Jalba.',
      '',
      ...prescriptionBody(
        v,
        'The prescription is also attached to this email as a file.',
      ),
      'If you have questions about how to take it, reply to this email.',
      ...SIGNATURE[Locale.En],
    ],
  }),
  [Locale.Ru]: (v) => ({
    subject: 'Ваш рецепт',
    lines: [
      'Здравствуйте!',
      '',
      v.body === null
        ? 'Рецепт от доктора Олеси Жалбы во вложении к этому письму.'
        : 'Ниже рецепт от доктора Олеси Жалбы.',
      '',
      ...prescriptionBody(v, 'Рецепт также приложен к письму файлом.'),
      'Если есть вопросы о приёме, ответьте на это письмо.',
      ...SIGNATURE[Locale.Ru],
    ],
  }),
};

export interface DocumentVars {
  /** The entry's title, or the file's name when it has none. */
  title: string;
}

export const DOCUMENT_TEMPLATES: Templates<DocumentVars> = {
  [Locale.Ro]: (v) => ({
    subject: 'Un document medical pentru dumneavoastră',
    lines: [
      'Bună ziua,',
      '',
      `Vă trimit documentul „${v.title}". Îl găsiți atașat la acest email.`,
      '',
      'Dacă aveți întrebări, răspundeți la acest email.',
      ...SIGNATURE[Locale.Ro],
    ],
  }),
  [Locale.En]: (v) => ({
    subject: 'A medical document for you',
    lines: [
      'Hello,',
      '',
      `Please find the document "${v.title}" attached to this email.`,
      '',
      'If you have any questions, reply to this email.',
      ...SIGNATURE[Locale.En],
    ],
  }),
  [Locale.Ru]: (v) => ({
    subject: 'Медицинский документ для вас',
    lines: [
      'Здравствуйте!',
      '',
      `Отправляю документ «${v.title}», он во вложении к этому письму.`,
      '',
      'Если есть вопросы, ответьте на это письмо.',
      ...SIGNATURE[Locale.Ru],
    ],
  }),
};
