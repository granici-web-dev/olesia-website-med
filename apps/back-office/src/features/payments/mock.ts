import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/components/ui/badge';
import type {
  Payment,
  PaymentState,
  PaymentTargetType,
} from '@/features/payments/types';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

/* ------------------------- presentation helpers ------------------------- */

/**
 * Colour is information here, so the vocabulary is deliberately narrow:
 * money arrived (success), money is in flight (warning), money went back
 * (info), nothing happened (muted). Only an outright failure is destructive —
 * an expired or abandoned checkout is a non-event, not an error, and painting
 * it red would make the ledger look alarming on an ordinary day.
 */
export const stateBadgeVariant: Record<PaymentState, BadgeVariant> = {
  created: 'muted',
  pending: 'warning',
  paid: 'success',
  failed: 'destructive',
  expired: 'muted',
  abandoned: 'muted',
  cancelled: 'muted',
  refunded: 'info',
  partially_refunded: 'info',
};

const dateTimeFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

/**
 * The bank settles in MDL but may charge in EUR, so the currency travels with
 * every amount and is never assumed. Two decimals always: this is money, and a
 * ledger that shows "160" next to "160,50" reads as a bug.
 */
export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/* ------------------------------- mock data ------------------------------ */
/* Used only when `VITE_API_MOCKS !== 'false'`; the real API is in `api.ts`.
   Invented payers, as everywhere in the mocks. */

const HOUR = 60 * 60 * 1000;
const iso = (ms: number) => new Date(Date.now() - ms).toISOString();

let store: Payment[] = [
  {
    id: 'p1',
    checkoutId: '21e8f276-4ff5-49ff-829b-7faec3d49771',
    paymentId: '3a8b125b-165f-4fdb-b97c-51d1fb4d11ac',
    orderId: 'QUICK_QUESTION-M3K2A-7F9B21',
    state: 'paid',
    amount: 160,
    currency: 'MDL',
    refundedAmount: 0,
    method: 'Card',
    targetType: 'quick_question',
    targetId: 'q1',
    payerName: 'Ana Munteanu',
    payerEmail: 'ana.munteanu@example.md',
    payerPhone: '+37369112233',
    patientId: 'pat1',
    rrn: '625308713525',
    approvalCode: '413316',
    cardMask: '444433******1111',
    threeDsResult: 'Y',
    terminalId: '0149587',
    expiresAt: iso(2 * HOUR),
    paidAt: iso(2 * HOUR),
    failedAt: null,
    createdAt: iso(2 * HOUR),
    refunds: [],
  },
  {
    id: 'p2',
    checkoutId: 'a1b2c3d4-0000-4000-8000-000000000002',
    paymentId: 'b2c3d4e5-0000-4000-8000-000000000002',
    orderId: 'DELIVERABLE_ORDER-M3J1Z-2C4D88',
    state: 'refunded',
    amount: 900,
    currency: 'MDL',
    refundedAmount: 900,
    method: 'Card',
    targetType: 'deliverable_order',
    targetId: 'o1',
    payerName: 'Victor Rusu',
    payerEmail: 'victor.rusu@example.md',
    payerPhone: null,
    patientId: null,
    rrn: '625308711002',
    approvalCode: '221904',
    cardMask: '510218******1124',
    threeDsResult: 'Y',
    terminalId: '0149587',
    expiresAt: iso(30 * HOUR),
    paidAt: iso(30 * HOUR),
    failedAt: null,
    createdAt: iso(30 * HOUR),
    refunds: [
      {
        id: 'r1',
        refundId: '67c9c205-3efd-4a36-ae75-01c83f8f2e38',
        state: 'accepted',
        amount: 900,
        currency: 'MDL',
        kind: 'Full',
        reason: 'Clienta a anulat comanda înainte de livrare.',
        executedAt: iso(26 * HOUR),
        createdAt: iso(26 * HOUR),
      },
    ],
  },
  {
    id: 'p3',
    checkoutId: 'a1b2c3d4-0000-4000-8000-000000000003',
    paymentId: null,
    orderId: 'APPOINTMENT-M3I0Y-9A1E45',
    state: 'pending',
    amount: 1200,
    currency: 'MDL',
    refundedAmount: 0,
    method: null,
    targetType: 'appointment',
    targetId: 'a1',
    payerName: 'Daniela Popa',
    payerEmail: 'daniela.popa@example.md',
    payerPhone: '+37368445566',
    patientId: null,
    rrn: null,
    approvalCode: null,
    cardMask: null,
    threeDsResult: null,
    terminalId: null,
    expiresAt: iso(-20 * 60 * 1000),
    paidAt: null,
    failedAt: null,
    createdAt: iso(10 * 60 * 1000),
    refunds: [],
  },
  {
    id: 'p4',
    checkoutId: 'a1b2c3d4-0000-4000-8000-000000000004',
    paymentId: 'b2c3d4e5-0000-4000-8000-000000000004',
    orderId: 'MATERIAL-M3H9X-4B7C10',
    state: 'failed',
    amount: 250,
    currency: 'MDL',
    refundedAmount: 0,
    method: 'Card',
    targetType: 'material',
    targetId: null,
    payerName: 'Mihai Ciobanu',
    payerEmail: 'mihai.ciobanu@example.md',
    payerPhone: null,
    patientId: null,
    rrn: null,
    approvalCode: null,
    cardMask: '520000******0080',
    threeDsResult: 'N',
    terminalId: '0149587',
    expiresAt: iso(50 * HOUR),
    paidAt: null,
    failedAt: iso(50 * HOUR),
    createdAt: iso(50 * HOUR),
    refunds: [],
  },
  {
    id: 'p5',
    checkoutId: 'a1b2c3d4-0000-4000-8000-000000000005',
    paymentId: null,
    orderId: 'SUBSCRIPTION-M3G8W-6D2F33',
    state: 'abandoned',
    amount: 3000,
    currency: 'MDL',
    refundedAmount: 0,
    method: null,
    targetType: 'subscription',
    targetId: null,
    payerName: null,
    payerEmail: 'nicoleta.b@example.md',
    payerPhone: null,
    patientId: null,
    rrn: null,
    approvalCode: null,
    cardMask: null,
    threeDsResult: null,
    terminalId: null,
    expiresAt: iso(70 * HOUR),
    paidAt: null,
    failedAt: null,
    createdAt: iso(71 * HOUR),
    refunds: [],
  },
];

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const delay = () => new Promise((r) => setTimeout(r, 220));

export async function fetchPayments(): Promise<Payment[]> {
  await delay();
  return clone(store);
}

export async function fetchPatientPayments(patientId: string): Promise<Payment[]> {
  await delay();
  return clone(store.filter((p) => p.patientId === patientId));
}

export async function syncPayment(id: string): Promise<Payment> {
  await delay();
  const p = store.find((x) => x.id === id);
  if (!p) throw new Error('not_found');
  return clone(p);
}

export async function refundPayment(input: {
  id: string;
  amount: number;
  reason: string;
}): Promise<Payment> {
  await delay();
  const p = store.find((x) => x.id === input.id);
  if (!p) throw new Error('not_found');

  const refunded = p.refundedAmount + input.amount;
  const next: Payment = {
    ...p,
    refundedAmount: refunded,
    state: refunded >= p.amount ? 'refunded' : 'partially_refunded',
    refunds: [
      ...p.refunds,
      {
        id: `r${Date.now()}`,
        refundId: crypto.randomUUID(),
        state: 'accepted',
        amount: input.amount,
        currency: p.currency,
        kind: refunded >= p.amount ? 'Full' : 'Partial',
        reason: input.reason,
        executedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ],
  };
  store = store.map((x) => (x.id === next.id ? next : x));
  return clone(next);
}

/** Label for what a payment bought. Kept next to the data it describes. */
export const TARGET_KEYS: PaymentTargetType[] = [
  'appointment',
  'quick_question',
  'deliverable_order',
  'subscription',
  'material',
];
