import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarCheck, Link2Off } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { ro } from '@/i18n/ro';
import { fetchCalendlyEventTypes } from '@/features/services/calendly-event-types';
import type { Service } from '@/features/services/types';

const t = ro.services.calendlyStatus;

/**
 * Whether bookings can actually happen.
 *
 * Every group-A service books through Calendly, and the mapping is the one
 * thing that has to survive the switch from the test account to the client's
 * paid one. This says, in one line, whether the account is connected and how
 * many bookable services still have no event mapped — so the moment the
 * handover is done, it is visible rather than discovered by a patient.
 */
export function CalendlyStatus({ services }: { services: Service[] }) {
  const { data } = useQuery({
    queryKey: ['calendly', 'event-types'],
    queryFn: fetchCalendlyEventTypes,
    staleTime: 5 * 60 * 1000,
  });

  const bookable = services.filter((s) => s.group === 'A_booking');
  const unmapped = bookable.filter((s) => !s.calendlyEventTypeUri?.trim());

  // Nothing to warn about: connected, and every bookable service is mapped.
  if (data?.configured && unmapped.length === 0) {
    return (
      <Card className="flex items-start gap-3 border-success/40 bg-success/10 p-4">
        <CalendarCheck className="mt-0.5 size-4 shrink-0 text-success" />
        <p className="text-sm text-pretty">
          {t.ok} {t.eventCount(data.eventTypes.length)}
        </p>
      </Card>
    );
  }

  const notConnected = !data?.configured;

  return (
    <Card
      className={
        notConnected
          ? 'flex items-start gap-3 border-warning/40 bg-warning/10 p-4'
          : 'flex items-start gap-3 border-destructive/40 bg-destructive/10 p-4'
      }
    >
      {notConnected ? (
        <Link2Off className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
      ) : (
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      )}
      <p className="text-sm text-pretty">
        {notConnected ? t.notConnected : t.unmapped(unmapped.length)}
      </p>
    </Card>
  );
}
