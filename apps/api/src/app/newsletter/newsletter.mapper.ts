import type { SubscriberDto } from '@olesia/shared';
import type { Subscriber } from '../../generated/prisma/client';

export function toSubscriberDto(s: Subscriber): SubscriberDto {
  return {
    id: s.id,
    email: s.email,
    locale: s.locale as SubscriberDto['locale'],
    source: s.source as SubscriberDto['source'],
    consentAt: s.consentAt.toISOString(),
    consentVersion: s.consentVersion,
    confirmedAt: s.confirmedAt ? s.confirmedAt.toISOString() : null,
    unsubscribedAt: s.unsubscribedAt ? s.unsubscribedAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
  };
}
