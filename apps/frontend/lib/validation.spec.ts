import { describe, expect, it } from 'vitest';

import { isEmailLike } from './validation';

/**
 * Four regexes checked the email on four forms, and two of them were
 * unanchored (audit A6, F10). This file exists so the one that replaced them
 * cannot quietly drift back: the cases below are the ones the unanchored pair
 * got wrong, and each of them is a submission the API would have refused after
 * the form had already called it valid.
 */
describe('isEmailLike', () => {
  it('accepts an ordinary address', () => {
    expect(isEmailLike('ana@example.md')).toBe(true);
  });

  it('accepts an address with a plus tag and a subdomain', () => {
    expect(isEmailLike('ana+guides@mail.example.co.uk')).toBe(true);
  });

  it('ignores the whitespace a paste leaves behind', () => {
    expect(isEmailLike('  ana@example.md  ')).toBe(true);
  });

  it('refuses an address buried in a sentence', () => {
    expect(isEmailLike('write to ana@example.md please')).toBe(false);
  });

  it('refuses an address with no dot in the domain', () => {
    expect(isEmailLike('ana@localhost')).toBe(false);
  });

  it('refuses an address with no local part', () => {
    expect(isEmailLike('@example.md')).toBe(false);
  });

  it('refuses an empty field', () => {
    expect(isEmailLike('')).toBe(false);
    expect(isEmailLike('   ')).toBe(false);
  });
});
