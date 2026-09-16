import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarCheck, Link2Off } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { ro } from '@/i18n/ro';
import { fetchCalendlyEventTypes } from '@/features/services/calendly-event-types';
import { calendlyReadiness } from '@/features/services/calendly-readiness';
import type { Service } from '@/features/services/types';

const t = ro.services.calendlyStatus;

/**
 * Whether bookings can actually happen.
 *
 * Every group-A service books through Calendly, and the mapping is the one
 * thing that has to survive the switch from the test account to the client's
 * paid one. This says, in one line, whether the account is connected and
 * whether every bookable service leads to an event that exists and is switched
 * on — so the moment the handover is done, it is visible rather than
 * discovered by a patient. The rule itself is in `calendly-readiness.ts`.
 */
export function CalendlyStatus({ services }: { services: Service[] }) {
  const { data } = useQuery({
    queryKey: ['calendly', 'event-types'],
    queryFn: fetchCalendlyEventTypes,
    staleTime: 5 * 60 * 1000,
  });

  const state = calendlyReadiness(services, data);

  if (state.ok) {
    return (
      <Card className="flex items-start gap-3 border-success/40 bg-success/10 p-4">
        <CalendarCheck className="mt-0.5 size-4 shrink-0 text-success" />
        <p className="text-sm text-pretty">
          {t.ok} {t.eventCount(state.eventCount)}
        </p>
      </Card>
    );
  }

  // Red is for a mapping nobody has made; amber is for one that exists and
  // does not work today. Both can be true at once, and both get said.
  const severe = state.unmapped.length > 0;
  const lines = [
    !state.connected ? t.notConnected : null,
    severe ? t.unmapped(state.unmapped.length) : null,
    state.unbookable.length > 0 ? t.unbookable(state.unbookable) : null,
  ].filter((line): line is string => line !== null);

  return (
    <Card
      className={
        severe
          ? 'flex items-start gap-3 border-destructive/40 bg-destructive/10 p-4'
          : 'flex items-start gap-3 border-warning/40 bg-warning/10 p-4'
      }
    >
      {severe ? (
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      ) : (
        <Link2Off className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
      )}
      <div className="space-y-1.5">
        {lines.map((line) => (
          <p key={line} className="text-sm text-pretty">
            {line}
          </p>
        ))}
      </div>
    </Card>
  );
}
