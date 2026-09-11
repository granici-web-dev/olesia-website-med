import type {
  Paginated,
  PaymentDto,
  PurchaseNextStepDto,
} from '@olesia/shared';

import { http } from '@/api/http';
import type {
  ManualPaymentInput,
  Payment,
  PaymentTargetType,
} from '@/features/payments/types';

/**
 * Real `payments` endpoints. Most rows are written by the checkout flow and the
 * bank's callback; the back office reads them, issues refunds, and records the
 * money that arrived outside the bank.
 */

function asList<T>(r: T[] | Paginated<T>): T[] {
  return Array.isArray(r) ? r : r.items;
}

/**
 * Same fields, with the shared enums relaxed into the view layer's unions and
 * every money value forced to a number. The API maps `Decimal` for us, but a
 * string slipping through here turns `a + b` into concatenation and shows a
 * total that is wrong by orders of magnitude — silently, and about money.
 */
const toView = (d: PaymentDto): Payment => ({
  ...(d as unknown as Payment),
  amount: Number(d.amount),
  refundedAmount: Number(d.refundedAmount),
  refunds: (d.refunds ?? []).map((r) => ({ ...r, amount: Number(r.amount) })),
});

export async function fetchPayments(): Promise<Payment[]> {
  const r = await http.get<PaymentDto[] | Paginated<PaymentDto>>(
    '/payments?pageSize=200',
  );
  return asList(r).map(toView);
}

export async function fetchPatientPayments(
  patientId: string,
): Promise<Payment[]> {
  const r = await http.get<PaymentDto[]>(`/payments/patient/${patientId}`);
  return r.map(toView);
}

/**
 * The live download link for a payment that bought a material, or null when
 * there is none — an unpaid purchase, a grant a refund took back.
 *
 * The one recourse a buyer who lost the return page's link has: with no SMTP
 * the receipt does not reach them either, so they write in and the doctor
 * copies the link off the payment (shape open question 3, decided).
 */
export async function fetchMaterialGrant(
  paymentId: string,
): Promise<PurchaseNextStepDto | null> {
  return http.get<PurchaseNextStepDto | null>(
    `/materials/grant/payment/${paymentId}`,
  );
}

/**
 * Take a buyer's access back by hand. Admin only server-side; the button is
 * hidden for an editor. A refund already does this on its own — this is the
 * path with no money in it.
 */
export async function revokeMaterialGrant(paymentId: string): Promise<void> {
  await http.del<void>(`/materials/grant/payment/${paymentId}`);
}

/** Re-ask the bank about one payment, for when a callback went missing. */
export async function syncPayment(id: string): Promise<Payment> {
  return toView(await http.post<PaymentDto>(`/payments/${id}/sync`, {}));
}

/** Every payment recorded against one purchase. */
export async function fetchTargetPayments(
  targetType: PaymentTargetType,
  targetId: string,
): Promise<Payment[]> {
  const r = await http.get<PaymentDto[]>(
    `/payments/target/${targetType}/${targetId}`,
  );
  return r.map(toView);
}

/** Cash at the practice, a transfer, a card machine that is not ours. */
export async function recordManualPayment(
  input: ManualPaymentInput,
): Promise<Payment> {
  return toView(await http.post<PaymentDto>('/payments/manual', input));
}

/** Undo a manual payment recorded in error. Bank payments are refunded. */
export async function voidPayment(id: string): Promise<Payment> {
  return toView(await http.post<PaymentDto>(`/payments/${id}/void`, {}));
}

/**
 * Send the payment confirmation again, for a payment whose first attempt never
 * left. Admin only server-side; the button is hidden for an editor.
 */
export async function resendConfirmation(id: string): Promise<Payment> {
  return toView(
    await http.post<PaymentDto>(`/payments/${id}/resend-confirmation`, {}),
  );
}

export async function refundPayment(input: {
  id: string;
  amount: number;
  reason: string;
}): Promise<Payment> {
  return toView(
    await http.post<PaymentDto>(`/payments/${input.id}/refund`, {
      amount: input.amount,
      reason: input.reason,
    }),
  );
}
