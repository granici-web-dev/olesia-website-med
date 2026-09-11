import type { PaymentStatus } from '@/types';

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

/**
 * `awaiting_payment` is the order somebody filled in and never paid for. It is
 * not a stage of the doctor's work — she cannot do anything with one — which
 * is why the API leaves it out of the list unless it is asked for by name, and
 * why it sits in its own tab here (docs/shape-paid-deliverables-and-materials.md).
 */
export type OrderStatus =
  | 'awaiting_payment'
  | 'new'
  | 'in_progress'
  | 'delivered'
  | 'canceled';

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
  paymentStatus: PaymentStatus;
  deliveredAt: string | null;
  createdAt: string; // ISO
}

/**
 * What the doctor fills in for an order she took herself. No price and no
 * title: those come from the catalog, on the server.
 */
export interface NewOrder {
  product: OrderProduct;
  clientName: string;
  clientEmail: string;
  phone?: string;
  notes?: string;
  locale?: 'ro' | 'en' | 'ru';
}

/** Tab filter over the workflow status. */
export type OrderStatusFilter = 'all' | OrderStatus;
