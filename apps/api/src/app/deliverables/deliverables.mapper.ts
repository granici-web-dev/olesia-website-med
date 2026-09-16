import type {
  DeliverableCatalogDto,
  PublicDeliverableCatalogDto,
} from '@olesia/shared';
import type { DeliverableCatalog } from '../../generated/prisma/client';

/** The back-office shape: the whole row, withdrawn products included. */
export function toDeliverableCatalogDto(
  d: DeliverableCatalog,
): DeliverableCatalogDto {
  return {
    code: d.code as DeliverableCatalogDto['code'],
    priceEur: d.priceEur,
    titleRo: d.titleRo,
    titleEn: d.titleEn,
    titleRu: d.titleRu,
    sortOrder: d.sortOrder,
    active: d.active,
  };
}

/**
 * The public shape. `active` is dropped rather than served, so that a product
 * the client has withdrawn cannot be rendered by a reader that forgot to
 * filter — the mistake audit A4 found four readers of `/services` making.
 */
export function toPublicDeliverableCatalogDto(
  d: DeliverableCatalog,
): PublicDeliverableCatalogDto {
  const { active: _active, ...product } = toDeliverableCatalogDto(d);
  return product;
}
