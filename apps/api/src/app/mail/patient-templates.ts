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
