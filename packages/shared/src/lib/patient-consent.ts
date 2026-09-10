/**
 * The consent a patient gives before sending medical documents
 * (client answers v2 §11.14).
 *
 * Wording and version live in one place because they only mean something
 * together: `UploadLink.consentVersion` records what somebody agreed to, and a
 * version that can drift from the text it names records nothing. The API reads
 * the version, the public page reads the text, both from here.
 *
 * **Bump the version whenever the wording changes.** Links consented under the
 * old text are then asked again before they may send another file.
 */

export const CONSENT_VERSION = '2026-08-04';

export type ConsentLocale = 'ro' | 'en' | 'ru';

export const PATIENT_CONSENT_TEXT: Record<ConsentLocale, string> = {
  ro: 'Sunt de acord ca documentele medicale trimise aici să fie stocate și consultate de medic pentru pregătirea consultației mele. Pot cere oricând ștergerea lor.',
  en: 'I agree that the medical documents I send here are stored and read by the doctor in order to prepare my consultation. I can ask for them to be deleted at any time.',
  ru: 'Я согласен(на), что присланные здесь медицинские документы будут сохранены и просмотрены врачом для подготовки моей консультации. Я могу в любой момент попросить их удалить.',
};
