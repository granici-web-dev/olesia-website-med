/** Shared TanStack Query keys for payments. */
export const paymentsQueryKey = ['payments'] as const;

/** One patient's payment history. */
export const patientPaymentsQueryKey = (patientId: string) =>
  ['payments', 'patient', patientId] as const;

/** Everything recorded against one purchase. */
export const targetPaymentsQueryKey = (targetType: string, targetId: string) =>
  ['payments', 'target', targetType, targetId] as const;

/** The download grant one material payment opened. */
export const materialGrantQueryKey = (paymentId: string) =>
  ['payments', 'grant', paymentId] as const;
