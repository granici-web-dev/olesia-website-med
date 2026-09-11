import {
  Phone,
  Mail,
  MapPin,
  Share2,
  Link as LinkIcon,
  type LucideIcon,
} from 'lucide-react';

import type { Contact, ContactType } from '@/features/contacts/types';

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
