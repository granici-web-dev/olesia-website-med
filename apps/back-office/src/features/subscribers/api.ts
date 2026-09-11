import type { Paginated, SubscriberDto } from '@olesia/shared';

import { http } from '@/api/http';
import type { Subscriber } from '@/features/subscribers/types';

/**
 * Real `newsletter` endpoints. The list is read-only here: signups come from
 * the public site, and there is nothing to send until the client has SMTP.
 */

function toView(d: SubscriberDto): Subscriber {
  return {
    id: d.id,
    email: d.email,
    locale: d.locale,
    source: d.source,
    consentAt: d.consentAt,
    unsubscribedAt: d.unsubscribedAt,
    createdAt: d.createdAt,
  };
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  const r = await http.get<Paginated<SubscriberDto>>(
    '/newsletter/subscribers?pageSize=200',
  );
  return r.items.map(toView);
}
