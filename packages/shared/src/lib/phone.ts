/**
 * A Moldovan phone number in E.164, or nothing.
 *
 * maib rejects the whole checkout session with error 42005 when `payerInfo.phone`
 * is not E.164 (docs/payments-maib-checkout.md §18), so a person who typed
 * "069 123 456 (Viber)" would be refused a purchase over a field the bank does
 * not need. Returning null rather than throwing is the point: the caller omits
 * the field and the sale goes through.
 *
 * Moldova only, because that is who buys here and because a guess at another
 * country's trunk prefix is a wrong number, not a convenience. Anything that is
 * not recognisably an MD number is null.
 */

/** Moldova: country code 373, nine significant digits after it. */
const COUNTRY_CODE = '373';
const NATIONAL_DIGITS = 8;

export function toE164(
  raw: string | null | undefined,
  region: 'MD',
): string | null {
  if (!raw) return null;

  // Everything a person puts between the digits: spaces, dashes, dots,
  // parentheses, a leading plus. A letter is not punctuation — "(Viber)" means
  // the field holds more than a number and we should not guess which part.
  if (/[a-zA-Z]/.test(raw)) return null;

  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;

  const national = digits.startsWith('00' + COUNTRY_CODE)
    ? digits.slice(2 + COUNTRY_CODE.length)
    : digits.startsWith(COUNTRY_CODE)
      ? digits.slice(COUNTRY_CODE.length)
      : digits.startsWith('0')
        ? digits.slice(1)
        : digits;

  if (national.length !== NATIONAL_DIGITS) return null;
  return `+${COUNTRY_CODE}${national}`;
}
