/**
 * The terms a buyer accepts at checkout.
 *
 * Same shape and same reason as `patient-consent.ts`: the version and the
 * wording only mean something together. `Payment` records nothing here, but the
 * checkout route refuses a body whose `termsAcceptedVersion` is not the current
 * one, so a page cached from before a wording change cannot sell under terms
 * nobody has read.
 *
 * **Bump the version whenever /terms changes materially.** Everyone with the
 * old page open is then asked to reload before they can buy.
 */

export const TERMS_VERSION = '2026-09-11';

export type TermsLocale = 'ro' | 'en' | 'ru';

/**
 * The sentence next to the checkbox. It points at /terms rather than restating
 * it: the full text is a page, and a summary that drifts from the page is worse
 * than no summary.
 */
export const TERMS_ACCEPT_TEXT: Record<TermsLocale, string> = {
  ro: 'Am citit și accept Termenii și condițiile, inclusiv politica de rambursare.',
  en: 'I have read and accept the Terms and conditions, including the refund policy.',
  ru: 'Я прочитал(а) и принимаю Условия использования, включая политику возврата.',
};

/**
 * What a card issued in MDL is actually charged. maib settles in the currency
 * of the profile; the buyer's bank converts at its own rate, so a Moldovan card
 * paying an 8 € consultation sees lei on the statement and a number that is not
 * 8 × today's official rate. Saying so before the redirect is the one thing
 * that stops that from reading as an overcharge.
 */
export const CURRENCY_NOTICE: Record<TermsLocale, string> = {
  ro: 'Prețul este în euro. Dacă plătiți cu un card în lei, banca dumneavoastră face conversia la cursul ei, iar suma debitată poate diferi ușor.',
  en: 'The price is in euro. If you pay with a card held in another currency, your bank converts at its own rate, so the amount debited may differ slightly.',
  ru: 'Цена указана в евро. Если вы платите картой в леях, банк конвертирует сумму по своему курсу, поэтому списание может немного отличаться.',
};
