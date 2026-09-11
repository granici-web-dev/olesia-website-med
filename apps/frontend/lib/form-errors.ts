/**
 * Wording for a failed public-form submission, in the three site languages.
 *
 * Every form used to answer every failure with the same "something went wrong"
 * (audit A6, F14): a rate limit, a rejected captcha and an unreachable API read
 * identically, so the one action that would actually help — wait a minute, or
 * write to us instead — was never on screen. These two functions are the whole
 * mapping, and they are pure so the wording can be pinned by a test.
 *
 * `status` is the HTTP status, or 0 when the request never reached the API.
 * `code` is the API's machine code (`captcha_failed`, `file_too_large`, …),
 * empty when there was none.
 */

type Locale = string;

interface Tri {
  ro: string;
  en: string;
  ru: string;
}

const pick = (t: Tri, locale: Locale): string =>
  locale === 'ru' ? t.ru : locale === 'en' ? t.en : t.ro;

const GENERIC: Tri = {
  ro: 'Ceva nu a funcționat. Încearcă din nou sau scrie-ne direct.',
  en: 'Something went wrong. Try again, or write to us directly.',
  ru: 'Что-то пошло не так. Попробуйте ещё раз или напишите нам напрямую.',
};

const OFFLINE: Tri = {
  ro: 'Nu am putut trimite formularul. Verifică conexiunea la internet și încearcă din nou.',
  en: 'We could not send the form. Check your internet connection and try again.',
  ru: 'Не удалось отправить форму. Проверьте подключение к интернету и попробуйте ещё раз.',
};

const TOO_MANY: Tri = {
  ro: 'Ai trimis prea multe mesaje. Așteaptă un minut și încearcă din nou.',
  en: 'That is too many messages in a row. Wait a minute and try again.',
  ru: 'Слишком много отправок подряд. Подождите минуту и попробуйте ещё раз.',
};

/**
 * reCAPTCHA scored the submission as a bot. Worth its own wording: the visitor
 * is a person, the form is fine, and reloading the page mints a fresh token —
 * which is the only thing that helps and is unguessable from "try again".
 */
const CAPTCHA: Tri = {
  ro: 'Verificarea anti-spam nu a trecut. Reîncarcă pagina și trimite din nou.',
  en: 'The anti-spam check did not pass. Reload the page and send again.',
  ru: 'Проверка на спам не пройдена. Перезагрузите страницу и отправьте ещё раз.',
};

const INVALID: Tri = {
  ro: 'Unele date nu au fost acceptate. Verifică adresa de email și textul, apoi încearcă din nou.',
  en: 'Some of the details were not accepted. Check your email address and the text, then try again.',
  ru: 'Часть данных не принята. Проверьте адрес email и текст, затем попробуйте ещё раз.',
};

const UNAVAILABLE: Tri = {
  ro: 'Serviciul este temporar indisponibil. Încearcă din nou în câteva minute.',
  en: 'The service is temporarily unavailable. Try again in a few minutes.',
  ru: 'Сервис временно недоступен. Попробуйте ещё раз через несколько минут.',
};

/**
 * Online payment is switched off because the practice's registered entity is
 * not configured yet — the checkout refuses rather than taking money on behalf
 * of a company that is not named anywhere (`legal_entity_missing`).
 *
 * Its own wording because the visitor did nothing wrong and trying again will
 * not help, which is what every other sentence here implies. It points at the
 * thing that still works: writing to us.
 */
const PAYMENT_OFF: Tri = {
  ro: 'Plata online este temporar indisponibilă. Scrie-ne direct și îți răspundem.',
  en: 'Online payment is temporarily unavailable. Write to us directly and we will answer.',
  ru: 'Онлайн-оплата временно недоступна. Напишите нам напрямую — мы ответим.',
};

export function describeLeadError(
  status: number,
  code: string,
  locale: Locale,
): string {
  if (code === 'captcha_failed') return pick(CAPTCHA, locale);
  if (code === 'legal_entity_missing') return pick(PAYMENT_OFF, locale);
  if (status === 0) return pick(OFFLINE, locale);
  if (status === 429) return pick(TOO_MANY, locale);
  if (status === 400) return pick(INVALID, locale);
  if (status >= 500) return pick(UNAVAILABLE, locale);
  return pick(GENERIC, locale);
}

const LINK_GONE: Tri = {
  ro: 'Linkul nu mai este valabil. Scrie-ne și îți trimitem unul nou.',
  en: 'This link is no longer valid. Write to us and we will send a new one.',
  ru: 'Ссылка больше не действует. Напишите нам — пришлём новую.',
};

const TOO_LARGE: Tri = {
  ro: 'Fișierul este prea mare.',
  en: 'That file is too large.',
  ru: 'Файл слишком большой.',
};

const WRONG_TYPE: Tri = {
  ro: 'Acest tip de fișier nu este acceptat. Trimite un PDF, un document Word sau o fotografie.',
  en: 'That file type is not accepted. Send a PDF, a Word document or a photo.',
  ru: 'Такой тип файла не принимается. Пришлите PDF, документ Word или фотографию.',
};

const TOO_MANY_FILES: Tri = {
  ro: 'Ai atins numărul maxim de fișiere. Șterge unul înainte de a trimite altul.',
  en: 'You have reached the maximum number of files. Remove one before sending another.',
  ru: 'Достигнут лимит файлов. Удалите один, прежде чем отправлять следующий.',
};

const CONSENT_REQUIRED: Tri = {
  ro: 'Reîncarcă pagina și confirmă acordul înainte de a trimite fișiere.',
  en: 'Reload the page and confirm your consent before sending files.',
  ru: 'Перезагрузите страницу и подтвердите согласие, прежде чем отправлять файлы.',
};

const UPLOAD_OFFLINE: Tri = {
  ro: 'Nu am putut trimite fișierul. Verifică conexiunea la internet și încearcă din nou.',
  en: 'We could not send the file. Check your internet connection and try again.',
  ru: 'Не удалось отправить файл. Проверьте подключение к интернету и попробуйте ещё раз.',
};

const UPLOAD_GENERIC: Tri = {
  ro: 'Nu am putut trimite fișierul. Încearcă din nou.',
  en: 'We could not send the file. Please try again.',
  ru: 'Не удалось отправить файл. Попробуйте ещё раз.',
};

/**
 * Wording for a failed patient upload.
 *
 * 413 is the one status that arrives without a body worth reading: Multer
 * aborts an oversized upload inside the interceptor chain, and the API's
 * `file-too-large.filter.ts` answers `file_too_large` — but a proxy in front of
 * it may answer 413 on its own, with HTML. Both mean the same thing here.
 */
export function describeUploadError(
  status: number,
  code: string,
  locale: Locale,
): string {
  if (code === 'file_too_large' || status === 413)
    return pick(TOO_LARGE, locale);
  if (code === 'unsupported_file_type') return pick(WRONG_TYPE, locale);
  if (code === 'too_many_files') return pick(TOO_MANY_FILES, locale);
  if (status === 0) return pick(UPLOAD_OFFLINE, locale);
  if (status === 404) return pick(LINK_GONE, locale);
  if (status === 403) return pick(CONSENT_REQUIRED, locale);
  if (status === 429) return pick(TOO_MANY, locale);
  return pick(UPLOAD_GENERIC, locale);
}
