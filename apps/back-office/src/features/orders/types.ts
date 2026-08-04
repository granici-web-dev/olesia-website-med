/**
 * Group-C orders — the personalized menus and written protocols ordered from
 * /pricing ("Comenzi" in the back office). Unlike an appointment there is no
 * calendar and unlike a subscription there is no period: an order is one
 * product, prepared once and sent.
 *
 * `titleRo` and `priceEur` are what the catalog said when the order was placed,
 * copied onto the row by the API. They are read-only here on purpose — the
 * record has to keep meaning what it meant, whatever the price list does later.
 *
 * Shapes mirror `DeliverableOrderDto` in `packages/shared`.
 */

export type OrderProduct =
  | 'menu_7'
  | 'menu_14'
  | 'menu_30'
  | 'protocol_pednutri'
  | 'protocol_complementary';

export type OrderStatus = 'new' | 'in_progress' | 'delivered' | 'canceled';
export type OrderPayment = 'pending' | 'confirmed';

export interface Order {
  id: string;
  product: OrderProduct;
  titleRo: string;
  priceEur: number;
  clientName: string;
  clientEmail: string;
  phone: string | null;
  notes: string | null;
  status: OrderStatus;
  paymentStatus: OrderPayment;
  deliveredAt: string | null;
  createdAt: string; // ISO
}

/** Tab filter over the workflow status. */
export type OrderStatusFilter = 'all' | OrderStatus;
