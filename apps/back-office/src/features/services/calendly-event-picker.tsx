import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2 } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ro } from '@/i18n/ro';
import {
  fetchCalendlyEventTypes,
  type CalendlyEventType,
} from '@/features/services/calendly-event-types';

const t = ro.services.calendlyPicker;

/**
 * Pick one of the doctor's real Calendly event types and fill BOTH fields at
 * once — the API URI the webhook matches on, and the public scheduling link
 * the site opens. Those two must describe the same event; filling them
 * separately by hand is exactly how they came apart last time.
 *
 * The free-text fields stay below: this is a shortcut, not a cage, and until
 * the client hands over her paid account there is nothing here to pick from.
 */
export function CalendlyEventPicker({
  value,
  onPick,
}: {
  /** Current `calendlyEventTypeUri`, so the picker shows what is mapped. */
  value: string;
  onPick: (eventType: CalendlyEventType) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['calendly', 'event-types'],
    queryFn: fetchCalendlyEventTypes,
    // Her calendar does not change between two edits of the same form.
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        {t.loading}
      </p>
    );
  }

  if (isError) {
    return (
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning-foreground" />
        {t.failed}
      </p>
    );
  }

  // "Not connected" and "connected but empty" are different problems and get
  // different sentences — one is our env, the other is her calendar.
  if (!data?.configured) {
    return (
      <p className="flex items-start gap-2 text-sm text-muted-foreground text-pretty">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning-foreground" />
        {t.notConnected}
      </p>
    );
  }

  if (data.eventTypes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">{t.empty}</p>
    );
  }

  return (
    <div className="space-y-1.5">
      <Select
        value={data.eventTypes.some((e) => e.uri === value) ? value : undefined}
        onValueChange={(uri) => {
          const picked = data.eventTypes.find((e) => e.uri === uri);
          if (picked) onPick(picked);
        }}
      >
        <SelectTrigger className="w-full" aria-label={t.label}>
          <SelectValue placeholder={t.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data.eventTypes.map((e) => (
            <SelectItem key={e.uri} value={e.uri}>
              {e.name}
              {e.duration ? ` · ${e.duration} min` : ''}
              {e.active === false ? ` · ${t.inactive}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground text-pretty">{t.hint}</p>
    </div>
  );
}
