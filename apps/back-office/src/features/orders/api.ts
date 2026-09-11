import type { DeliverableOrderDto } from '@olesia/shared';

import { http } from '@/api/http';
import { fetchEveryPage, MAX_PAGE_SIZE } from '@/api/list';
import type { NewOrder, Order, OrderStatus } from '@/features/orders/types';

/**
 * Real `deliverable-orders` endpoints. Rows are created by the public checkout
 * at `/leads/deliverable/checkout`; here we list them, move them through the
 * workflow, and delete the ones that came to nothing. Payment is not one of
 * them: `paymentStatus` mirrors the payments ledger, and money that arrived
 * outside the bank is recorded through `/payments/manual`.
 */

const KNOWN_STATUSES: readonly Order['status'][] = [
  'awaiting_payment',
  'new',
  'in_progress',
  'delivered',
  'canceled',
];

/**
 * A status this build has never heard of goes in the working queue.
 *
 * `OrderStatusBadge` looks its icon up in a literal map, so an unrecognised
 * value renders `<undefined />` and takes the whole table down with it. The
 * panel being one deploy behind the API is the ordinary way that happens, and
 * `new` is the answer that puts the row in front of the doctor rather than
 * hiding it: the detail sheet still shows what the order really says.
 */
function toStatus(status: string): Order['status'] {
  return KNOWN_STATUSES.includes(status as Order['status'])
    ? (status as Order['status'])
    : 'new';
}

/**
 * An order the doctor took herself, by phone or in a message.
 *
 * Only the product code goes over the wire: the title and the price are read
 * from the catalog server-side, so a hand-written order records the same price
 * as one bought on the site. It starts `new` and unpaid, and the money is
 * recorded afterwards through the manual-payment panel.
 */
export async function createOrder(input: NewOrder): Promise<Order> {
  return toView(
    await http.post<DeliverableOrderDto>('/deliverable-orders', input),
  );
}

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
    status: toStatus(d.status),
    paymentStatus: d.paymentStatus as Order['paymentStatus'],
    deliveredAt: d.deliveredAt,
    createdAt: d.createdAt,
  };
}

/**
 * Both lists, deliberately — the same arrangement the EXPRESS tickets have.
 *
 * `GET /deliverable-orders` leaves out `awaiting_payment` by default, so the
 * doctor's working queue is not padded with orders nobody bought. The panel
 * still has to show them, which is what the "Neachitate" tab is, so it asks
 * for them by name and merges the two, newest first.
 *
 * Two requests rather than one because the API's default is the right default
 * for every other caller, and a `status=all` escape hatch would be a way to
 * undo it by accident.
 */
export async function fetchOrders(): Promise<Order[]> {
  const [working, unpaid] = await Promise.all([
    fetchEveryPage<DeliverableOrderDto>((page) =>
      http.get(`/deliverable-orders?page=${page}&pageSize=${MAX_PAGE_SIZE}`),
    ),
    fetchEveryPage<DeliverableOrderDto>((page) =>
      http.get(
        `/deliverable-orders?page=${page}&pageSize=${MAX_PAGE_SIZE}&status=awaiting_payment`,
      ),
    ),
  ]);
  // The two answers are not one snapshot. A payment landing between them puts
  // the same order in both lists, and the doctor sees the row twice, once as
  // unpaid. The copy that is no longer awaiting payment is the later truth.
  const byId = new Map<string, DeliverableOrderDto>();
  for (const row of [...working, ...unpaid]) {
    const seen = byId.get(row.id);
    if (!seen || seen.status === 'awaiting_payment') byId.set(row.id, row);
  }
  return [...byId.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toView);
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
