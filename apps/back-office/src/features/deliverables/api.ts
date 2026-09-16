import type { DeliverableCatalogDto } from '@olesia/shared';

import { http } from '@/api/http';
import type {
  Deliverable,
  DeliverableCode,
  DeliverableInput,
} from '@/features/deliverables/types';

/**
 * The list is `/deliverables/all`, not `/deliverables`: the public one drops
 * the withdrawn products and `active` itself, which are exactly what this
 * panel exists to show and switch.
 *
 * There is no create and no delete. The five codes are an enum and the rows
 * come from the seed; what the client owns is the price and the titles.
 */

function toView(d: DeliverableCatalogDto): Deliverable {
  return {
    code: d.code as DeliverableCode,
    priceEur: d.priceEur,
    titleRo: d.titleRo,
    titleEn: d.titleEn,
    titleRu: d.titleRu,
    sortOrder: d.sortOrder,
    active: d.active,
  };
}

export async function fetchDeliverables(): Promise<Deliverable[]> {
  const list = await http.get<DeliverableCatalogDto[]>('/deliverables/all');
  return list.map(toView).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function updateDeliverable(
  code: DeliverableCode,
  input: DeliverableInput,
): Promise<Deliverable> {
  return toView(
    await http.patch<DeliverableCatalogDto>(`/deliverables/${code}`, input),
  );
}

export async function setDeliverableActive(
  code: DeliverableCode,
  active: boolean,
): Promise<Deliverable> {
  return toView(
    await http.patch<DeliverableCatalogDto>(`/deliverables/${code}`, {
      active,
    }),
  );
}
