import {
  Phone,
  Mail,
  MapPin,
  Share2,
  Link as LinkIcon,
  type LucideIcon,
} from 'lucide-react';

import type {
  Contact,
  ContactInput,
  ContactType,
} from '@/features/contacts/types';

export const CONTACT_TYPES: ContactType[] = [
  'phone',
  'email',
  'address',
  'social',
  'other',
];

export const contactTypeIcon: Record<ContactType, LucideIcon> = {
  phone: Phone,
  email: Mail,
  address: MapPin,
  social: Share2,
  other: LinkIcon,
};

/** Clickable target for a contact value, or null when it isn't a link. */
export function contactHref(contact: Contact): string | null {
  switch (contact.type) {
    case 'phone':
      return `tel:${contact.value.replace(/\s+/g, '')}`;
    case 'email':
      return `mailto:${contact.value}`;
    case 'social':
      return contact.value;
    case 'other':
      return /^https?:\/\//i.test(contact.value) ? contact.value : null;
    case 'address':
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory CRUD, shaped like the real REST API.
 * See module_calendly.md §9.
 * ------------------------------------------------------------------ */

let store: Contact[] = [
  {
    id: 'ct1',
    type: 'phone',
    labelRo: 'Recepție',
    labelEn: 'Reception',
    labelRu: 'Регистратура',
    value: '+373 60 123 456',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'ct2',
    type: 'phone',
    labelRo: 'WhatsApp',
    labelEn: 'WhatsApp',
    labelRu: 'WhatsApp',
    value: '+373 69 000 111',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'ct3',
    type: 'email',
    labelRo: 'Programări',
    labelEn: 'Bookings',
    labelRu: 'Запись',
    value: 'contact@olesia.md',
    sortOrder: 3,
    active: true,
  },
  {
    id: 'ct4',
    type: 'address',
    labelRo: 'Cabinet',
    labelEn: 'Office',
    labelRu: 'Кабинет',
    value: 'str. Ștefan cel Mare 12, Chișinău',
    sortOrder: 4,
    active: true,
  },
  {
    id: 'ct5',
    type: 'social',
    labelRo: 'Instagram',
    labelEn: 'Instagram',
    labelRu: 'Instagram',
    value: 'https://instagram.com/olesia.pediatru',
    sortOrder: 5,
    active: true,
  },
  {
    id: 'ct6',
    type: 'social',
    labelRo: 'Facebook',
    labelEn: 'Facebook',
    labelRu: 'Facebook',
    value: 'https://facebook.com/olesia.pediatru',
    sortOrder: 6,
    active: true,
  },
  {
    id: 'ct7',
    type: 'other',
    labelRo: 'Program',
    labelEn: 'Schedule',
    labelRu: 'График работы',
    value: 'Luni–Vineri, 9:00–18:00',
    sortOrder: 7,
    active: false,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchContacts(): Promise<Contact[]> {
  await delay(500);
  return store.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createContact(input: ContactInput): Promise<Contact> {
  await delay(500);
  const created: Contact = { ...input, id: crypto.randomUUID() };
  store = [...store, created];
  return created;
}

export async function updateContact(
  id: string,
  input: ContactInput,
): Promise<Contact> {
  await delay(500);
  let updated: Contact | undefined;
  store = store.map((c) => {
    if (c.id !== id) return c;
    updated = { ...input, id };
    return updated;
  });
  if (!updated) throw new Error(`Contact ${id} not found`);
  return updated;
}

export async function deleteContact(id: string): Promise<void> {
  await delay(450);
  store = store.filter((c) => c.id !== id);
}

export async function setContactActive(
  id: string,
  active: boolean,
): Promise<Contact> {
  await delay(300);
  let updated: Contact | undefined;
  store = store.map((c) => {
    if (c.id !== id) return c;
    updated = { ...c, active };
    return updated;
  });
  if (!updated) throw new Error(`Contact ${id} not found`);
  return updated;
}
