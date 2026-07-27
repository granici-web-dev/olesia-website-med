import type { ServiceDto } from '@olesia/shared';
import type { Service } from '../../generated/prisma/client';

export function toServiceDto(s: Service): ServiceDto {
  return {
    id: s.id,
    code: s.code as ServiceDto['code'],
    group: s.group as ServiceDto['group'],
    titleRo: s.titleRo,
    titleEn: s.titleEn,
    titleRu: s.titleRu,
    descriptionRo: s.descriptionRo,
    descriptionEn: s.descriptionEn,
    descriptionRu: s.descriptionRu,
    durationMin: s.durationMin,
    price: s.price,
    priceLabelRo: s.priceLabelRo,
    priceLabelEn: s.priceLabelEn,
    priceLabelRu: s.priceLabelRu,
    calendlyEventTypeUri: s.calendlyEventTypeUri,
    calendlySchedulingUrl: s.calendlySchedulingUrl,
    sortOrder: s.sortOrder,
    active: s.active,
  };
}
