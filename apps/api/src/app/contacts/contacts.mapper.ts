import type { ContactDto } from '@olesia/shared';
import type { Contact } from '../../generated/prisma/client';

export function toContactDto(c: Contact): ContactDto {
  return {
    id: c.id,
    type: c.type as ContactDto['type'],
    labelRo: c.labelRo,
    labelEn: c.labelEn,
    labelRu: c.labelRu,
    value: c.value,
    sortOrder: c.sortOrder,
    active: c.active,
  };
}
