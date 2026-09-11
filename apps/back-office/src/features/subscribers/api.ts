import type { SubscriberDto } from '@olesia/shared';

import { http } from '@/api/http';
import { fetchEveryPage, MAX_PAGE_SIZE } from '@/api/list';
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
  const rows = await fetchEveryPage<SubscriberDto>((page) =>
    http.get(`/newsletter/subscribers?page=${page}&pageSize=${MAX_PAGE_SIZE}`),
  );
  return rows.map(toView);
}
