import type {
  Order,
  OrderPayment,
  OrderStatus,
} from '@/features/orders/types';
import type { badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

/* ----------------------------- presentation ----------------------------- */

export const statusBadgeVariant: Record<OrderStatus, BadgeVariant> = {
  // Muted on purpose: an unpaid order is not work waiting, it is a form
  // somebody abandoned. It should read as quieter than "Nouă", not louder.
  awaiting_payment: 'secondary',
  new: 'info',
  in_progress: 'warning',
  delivered: 'success',
  canceled: 'secondary',
};

export const paymentBadgeVariant: Record<OrderPayment, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
};

const dateTimeFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

/** Prices are whole euros; the symbol goes after the number in Romanian. */
export function formatPrice(eur: number): string {
  return `${new Intl.NumberFormat('ro-RO').format(eur)} €`;
}

/* ------------------------------- mock data ------------------------------ */
/* Used only when `VITE_API_MOCKS === 'true'`; the real API is in `api.ts`.
   Invented names, as everywhere in the mocks — this store never reaches the
   public site, unlike testimonials, where placeholder people did. */

const HOUR = 60 * 60 * 1000;

let store: Order[] = [
  {
    id: 'o1',
    product: 'menu_14',
    titleRo: 'Meniu personalizat · 14 zile',
    priceEur: 48,
    clientName: 'Ana Ciobanu',
    clientEmail: 'ana.ciobanu@example.com',
    phone: '+373 60 111 222',
    notes:
      'Fetiță de 5 ani, intoleranță la lactoză. Aș dori variante pentru pachetul de la grădiniță.',
    status: 'new',
    paymentStatus: 'pending',
    deliveredAt: null,
    createdAt: new Date(Date.now() - 3 * HOUR).toISOString(),
  },
  {
    id: 'o2',
    product: 'protocol_complementary',
    titleRo: 'Protocol individualizat · alimentație complementară (sugari)',
    priceEur: 98,
    clientName: 'Victor Rusu',
    clientEmail: 'victor.rusu@example.com',
    phone: null,
    notes: 'Băiat de 7 luni, începem diversificarea.',
    status: 'in_progress',
    paymentStatus: 'confirmed',
    deliveredAt: null,
    createdAt: new Date(Date.now() - 30 * HOUR).toISOString(),
  },
  {
    id: 'o3',
    product: 'menu_7',
    titleRo: 'Meniu personalizat · 7 zile',
    priceEur: 28,
    clientName: 'Doina Balan',
    clientEmail: 'doina.balan@example.com',
    phone: '+373 69 333 444',
    notes: null,
    status: 'delivered',
    paymentStatus: 'confirmed',
    deliveredAt: new Date(Date.now() - 50 * HOUR).toISOString(),
    createdAt: new Date(Date.now() - 96 * HOUR).toISOString(),
  },
];

function clone(o: Order): Order {
  return { ...o };
}

export async function fetchOrders(): Promise<Order[]> {
  return store.map(clone);
}

export async function setOrderStatus(input: {
  id: string;
  status: OrderStatus;
}): Promise<Order> {
  store = store.map((o) =>
    o.id === input.id
      ? {
          ...o,
          status: input.status,
          deliveredAt:
            input.status === 'delivered'
              ? (o.deliveredAt ?? new Date().toISOString())
              : null,
        }
      : o,
  );
  const found = store.find((o) => o.id === input.id);
  if (!found) throw new Error('not_found');
  return clone(found);
}

export async function deleteOrder(id: string): Promise<void> {
  store = store.filter((o) => o.id !== id);
}
