/**
 * Reading the client's own contact details (`GET /contacts`).
 *
 * The footer and /contact carried her email, phone and three social links as
 * string constants until 2026-09-11 (audit A6, F12) — while the back office had
 * a `Contacte` page that edited a table nothing on the site read. Changing a
 * phone number there changed nothing a visitor could see.
 *
 * Nothing here invents a value. An entity the client has not entered is absent
 * from the response, and the block that would have shown it is not rendered.
 */

import type { PublicContactDto } from './api';

/** Contacts split by kind, each already sorted by the API's `sortOrder`. */
export interface ContactGroups {
  phones: PublicContactDto[];
  emails: PublicContactDto[];
  addresses: PublicContactDto[];
  socials: PublicContactDto[];
}

export function groupContacts(list: PublicContactDto[]): ContactGroups {
  return {
    phones: list.filter((c) => c.type === 'phone'),
    emails: list.filter((c) => c.type === 'email'),
    addresses: list.filter((c) => c.type === 'address'),
    socials: list.filter((c) => c.type === 'social'),
  };
}

/**
 * The `href` a contact should open.
 *
 * `tel:` cannot carry the spaces a readable phone number is written with, so
 * the displayed value and the link are two different strings from one field.
 * An address has nowhere to link to and returns null; the caller renders text.
 */
export function contactHref(contact: PublicContactDto): string | null {
  switch (contact.type) {
    case 'phone':
      return `tel:${contact.value.replace(/[^\d+]/g, '')}`;
    case 'email':
      return `mailto:${contact.value.trim()}`;
    case 'social':
    case 'other':
      return /^https?:\/\//i.test(contact.value.trim())
        ? contact.value.trim()
        : null;
    default:
      return null;
  }
}

export type SocialNetwork = 'instagram' | 'facebook' | 'telegram' | 'other';

/**
 * Which network a social link points at, read from the URL rather than from
 * the label: the label is the client's to write, and "Insta" should still get
 * the Instagram glyph.
 */
export function socialNetwork(url: string): SocialNetwork {
  const u = url.toLowerCase();
  if (u.includes('instagram.')) return 'instagram';
  if (u.includes('facebook.') || u.includes('fb.com')) return 'facebook';
  if (u.includes('t.me') || u.includes('telegram.')) return 'telegram';
  return 'other';
}
