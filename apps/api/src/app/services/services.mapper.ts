import type { ServiceDto } from '@olesia/shared';
import type { Service } from '../../generated/prisma/client';

/** The back-office shape: the whole row, hidden services included. */
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

/**
 * The public shape.
 *
 * `calendlyEventTypeUri` is how the webhook maps a booking to a service and
 * has no business on an unauthenticated endpoint (audit A4, F5). `active` was
 * a flag every reader had to remember to filter on, and three of the four did
 * not (F6): only `/pricing` checked it, so a service the client deactivated
 * kept its homepage tile and its booking button. The endpoint filters now, and
 * the field has nothing left to say.
 */
export type PublicServiceDto = Omit<
  ServiceDto,
  'calendlyEventTypeUri' | 'active'
>;

export function toPublicServiceDto(s: Service): PublicServiceDto {
  const {
    calendlyEventTypeUri: _uri,
    active: _active,
    ...service
  } = toServiceDto(s);
  return service;
}
