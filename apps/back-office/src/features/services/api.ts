import type { ServiceDto } from '@olesia/shared';

import { http } from '@/api/http';
import type { Service, ServiceInput } from '@/features/services/types';

/**
 * Real `services` endpoints (module_calendly.md §6).
 * GET /services is public; mutations require admin/editor.
 */

function toView(d: ServiceDto): Service {
  return {
    id: d.id,
    code: d.code as Service['code'],
    group: d.group as Service['group'],
    titleRo: d.titleRo,
    titleEn: d.titleEn,
    descriptionRo: d.descriptionRo,
    descriptionEn: d.descriptionEn,
    durationMin: d.durationMin,
    price: d.price,
    priceLabelRo: d.priceLabelRo,
    priceLabelEn: d.priceLabelEn,
    calendlyEventTypeUri: d.calendlyEventTypeUri,
    sortOrder: d.sortOrder,
    active: d.active,
  };
}

export async function fetchServices(): Promise<Service[]> {
  const list = await http.get<ServiceDto[]>('/services');
  return list.map(toView).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createService(input: ServiceInput): Promise<Service> {
  return toView(await http.post<ServiceDto>('/services', input));
}

export async function updateService(
  id: string,
  input: ServiceInput,
): Promise<Service> {
  return toView(await http.patch<ServiceDto>(`/services/${id}`, input));
}

export async function deleteService(id: string): Promise<void> {
  await http.del<void>(`/services/${id}`);
}

export async function setServiceActive(
  id: string,
  active: boolean,
): Promise<Service> {
  return toView(await http.patch<ServiceDto>(`/services/${id}`, { active }));
}
