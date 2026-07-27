import type { ContactDto } from '@olesia/shared';

import { http } from '@/api/http';
import type { Contact, ContactInput } from '@/features/contacts/types';

/** Real `contacts` endpoints (module_calendly.md §9). GET is public. */

function toView(d: ContactDto): Contact {
  return {
    id: d.id,
    type: d.type as Contact['type'],
    labelRo: d.labelRo,
    labelEn: d.labelEn,
    labelRu: d.labelRu,
    value: d.value,
    sortOrder: d.sortOrder,
    active: d.active,
  };
}

export async function fetchContacts(): Promise<Contact[]> {
  const list = await http.get<ContactDto[]>('/contacts');
  return list.map(toView).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createContact(input: ContactInput): Promise<Contact> {
  return toView(await http.post<ContactDto>('/contacts', input));
}

export async function updateContact(
  id: string,
  input: ContactInput,
): Promise<Contact> {
  return toView(await http.patch<ContactDto>(`/contacts/${id}`, input));
}

export async function deleteContact(id: string): Promise<void> {
  await http.del<void>(`/contacts/${id}`);
}

export async function setContactActive(
  id: string,
  active: boolean,
): Promise<Contact> {
  return toView(await http.patch<ContactDto>(`/contacts/${id}`, { active }));
}
