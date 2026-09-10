import type { DeliverableOrderDto, Paginated } from '@olesia/shared';

import { http } from '@/api/http';
import type { Order, OrderStatus } from '@/features/orders/types';

/**
 * Real `deliverable-orders` endpoints. Rows are created by the public
 * `/leads/deliverable` endpoint; here we list them, move them through the
 * workflow, and delete the ones that came to nothing. Payment is not one of
 * them: `paymentStatus` mirrors the payments ledger, and money that arrived
 * outside the bank is recorded through `/payments/manual`.
 */

function toView(d: DeliverableOrderDto): Order {
  return {
    id: d.id,
    product: d.product as Order['product'],
    titleRo: d.titleRo,
    priceEur: d.priceEur,
    clientName: d.clientName,
    clientEmail: d.clientEmail,
    phone: d.phone,
    notes: d.notes,
    status: d.status as Order['status'],
    paymentStatus: d.paymentStatus as Order['paymentStatus'],
    deliveredAt: d.deliveredAt,
    createdAt: d.createdAt,
  };
}

function asList<T>(r: T[] | Paginated<T>): T[] {
  return Array.isArray(r) ? r : r.items;
}

export async function fetchOrders(): Promise<Order[]> {
  const r = await http.get<DeliverableOrderDto[] | Paginated<DeliverableOrderDto>>(
    '/deliverable-orders?pageSize=200',
  );
  return asList(r).map(toView);
}

export async function setOrderStatus(input: {
  id: string;
  status: OrderStatus;
}): Promise<Order> {
  return toView(
    await http.patch<DeliverableOrderDto>(`/deliverable-orders/${input.id}`, {
      status: input.status,
    }),
  );
}

export async function deleteOrder(id: string): Promise<void> {
  await http.del<void>(`/deliverable-orders/${id}`);
}
