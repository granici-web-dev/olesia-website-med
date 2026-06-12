import type { SubscriptionDto } from '@olesia/shared';
import type { Subscription } from '../../generated/prisma/client';

export function toSubscriptionDto(s: Subscription): SubscriptionDto {
  return {
    id: s.id,
    serviceId: s.serviceId,
    clientName: s.clientName,
    clientEmail: s.clientEmail,
    status: s.status as SubscriptionDto['status'],
    paymentStatus: s.paymentStatus as SubscriptionDto['paymentStatus'],
    videoQuotaPerMonth: s.videoQuotaPerMonth,
    videoQuotaUsed: s.videoQuotaUsed,
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}
