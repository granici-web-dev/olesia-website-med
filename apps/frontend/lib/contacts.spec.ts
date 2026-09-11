import { describe, expect, it } from 'vitest';
import type { PublicContactDto } from '@olesia/shared';

import { contactHref, groupContacts, socialNetwork } from './contacts';

/**
 * The site linked five hardcoded channels and the back office edited a table
 * nobody read (audit A6, F12). What is worth pinning about the replacement is
 * the one transformation in it: a phone number is written for a human and
 * dialled by a machine, and those are two different strings.
 */
const contact = (
  type: PublicContactDto['type'],
  value: string,
  id = value,
): PublicContactDto => ({
  id,
  type,
  labelRo: 'Etichetă',
  labelEn: 'Label',
  labelRu: null,
  value,
  sortOrder: 1,
  active: true,
});

describe('contactHref', () => {
  it('strips a readable phone number down to something dialable', () => {
    expect(contactHref(contact('phone', '+373 688 37 774'))).toBe(
      'tel:+37368837774',
    );
  });

  it('builds a mailto for an address', () => {
    expect(contactHref(contact('email', ' ana@example.md '))).toBe(
      'mailto:ana@example.md',
    );
  });

  it('links a social channel only when it is a URL', () => {
    expect(contactHref(contact('social', 'https://t.me/olesea'))).toBe(
      'https://t.me/olesea',
    );
    expect(contactHref(contact('social', '@olesea'))).toBeNull();
  });

  it('has nowhere to send an address', () => {
    expect(contactHref(contact('address', 'str. Ion Creangă 1'))).toBeNull();
  });
});

describe('socialNetwork', () => {
  it('reads the network from the URL, not from the label', () => {
    expect(socialNetwork('https://www.instagram.com/dr.olesea')).toBe(
      'instagram',
    );
    expect(socialNetwork('https://www.facebook.com/olesea')).toBe('facebook');
    expect(socialNetwork('https://t.me/olesea')).toBe('telegram');
    expect(socialNetwork('https://example.com/olesea')).toBe('other');
  });
});

describe('groupContacts', () => {
  it('splits by kind and keeps the order the API sent within each', () => {
    const groups = groupContacts([
      contact('email', 'a@example.md'),
      contact('phone', '+373 1'),
      contact('social', 'https://t.me/a'),
      contact('phone', '+373 2'),
      contact('address', 'Chișinău'),
    ]);
    expect(groups.emails).toHaveLength(1);
    expect(groups.phones.map((c) => c.value)).toEqual(['+373 1', '+373 2']);
    expect(groups.socials).toHaveLength(1);
    expect(groups.addresses).toHaveLength(1);
  });
});
