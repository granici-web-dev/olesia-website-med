/** Shared TanStack Query keys for payments. */
export const paymentsQueryKey = ['payments'] as const;

/** One patient's payment history. */
export const patientPaymentsQueryKey = (patientId: string) =>
  ['payments', 'patient', patientId] as const;
