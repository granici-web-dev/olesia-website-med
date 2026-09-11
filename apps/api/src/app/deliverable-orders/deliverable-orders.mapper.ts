import type { DeliverableOrderDto } from '@olesia/shared';
import type { DeliverableOrder } from '../../generated/prisma/client';

export function toDeliverableOrderDto(
  o: DeliverableOrder,
): DeliverableOrderDto {
  return {
    id: o.id,
    product: o.product as DeliverableOrderDto['product'],
    titleRo: o.titleRo,
    priceEur: o.priceEur,
    clientName: o.clientName,
    clientEmail: o.clientEmail,
    phone: o.phone,
    notes: o.notes,
    status: o.status as DeliverableOrderDto['status'],
    paymentStatus: o.paymentStatus as DeliverableOrderDto['paymentStatus'],
    deliveredAt: o.deliveredAt ? o.deliveredAt.toISOString() : null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}
