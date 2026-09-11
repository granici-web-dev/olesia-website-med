/**
 * maib refuses a whole checkout session with error 42005 when the payer phone
 * is not E.164 (docs/payments-maib-checkout.md §18), so what this function
 * returns decides whether a sale happens. The cases that matter are the shapes
 * a Moldovan actually types into a form, and the two ways of being unparseable:
 * a number from somewhere else, and a field that holds more than a number.
 */
import { toE164 } from './phone';

describe('toE164(raw, MD)', () => {
  it('expands a national number to E.164', () => {
    expect(toE164('069123456', 'MD')).toBe('+37369123456');
  });

  it('ignores the spaces people type between groups', () => {
    expect(toE164('+373 69 123 456', 'MD')).toBe('+37369123456');
    expect(toE164('069 123 456', 'MD')).toBe('+37369123456');
    expect(toE164('(069) 123-456', 'MD')).toBe('+37369123456');
  });

  it('reads the 00 international prefix as +', () => {
    expect(toE164('0037369123456', 'MD')).toBe('+37369123456');
  });

  it('leaves an already-normalised number alone', () => {
    expect(toE164('+37369123456', 'MD')).toBe('+37369123456');
  });

  it('refuses a field carrying more than a number', () => {
    expect(toE164('069 123 456 (Viber)', 'MD')).toBeNull();
  });

  it('refuses a number that is not Moldovan', () => {
    expect(toE164('+1', 'MD')).toBeNull();
    expect(toE164('+1 202 555 0143', 'MD')).toBeNull();
  });

  it('refuses the right number of digits typed wrong', () => {
    expect(toE164('06912345', 'MD')).toBeNull();
    expect(toE164('0691234567', 'MD')).toBeNull();
  });

  it('answers null for nothing, rather than throwing', () => {
    expect(toE164('', 'MD')).toBeNull();
    expect(toE164(null, 'MD')).toBeNull();
    expect(toE164(undefined, 'MD')).toBeNull();
    expect(toE164('   ', 'MD')).toBeNull();
  });
});
