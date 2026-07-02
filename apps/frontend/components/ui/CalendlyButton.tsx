'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/**
 * Opens the Calendly booking popup for a group-A service, with the visit
 * reason (`a1`) prefilled from the service title (module_calendly.md §8.3).
 * The prefill is only a hint — the booking source of truth stays the
 * `event_type` URI, mapped server-side by the webhook.
 */

const WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';
const WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js';

interface CalendlyApi {
  initPopupWidget: (opts: {
    url: string;
    prefill?: { customAnswers?: Record<string, string> };
  }) => void;
}

declare global {
  interface Window {
    Calendly?: CalendlyApi;
  }
}

/** Inject the Calendly widget assets once per document. */
function ensureWidgetAssets(): void {
  if (typeof document === 'undefined') return;
  if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = WIDGET_CSS;
    document.head.appendChild(link);
  }
  if (!document.querySelector(`script[src="${WIDGET_JS}"]`)) {
    const script = document.createElement('script');
    script.src = WIDGET_JS;
    script.async = true;
    document.body.appendChild(script);
  }
}

export function CalendlyButton({
  url,
  reason,
  label,
  className,
  withArrow = false,
}: {
  /** Public Calendly scheduling URL (Service.calendlySchedulingUrl). */
  url: string;
  /** Visit reason prefilled into the `a1` custom question. */
  reason: string;
  label: string;
  className?: string;
  /**
   * Append a trailing " →" to the label. Defaults to false: booking actions
   * render without an arrow (arrows are reserved for navigational links), which
   * keeps every "Rezervă"/"Programează" CTA consistent across the site.
   */
  withArrow?: boolean;
}) {
  useEffect(() => {
    ensureWidgetAssets();
  }, []);

  const open = () => {
    track('booking_click', { service: reason });
    ensureWidgetAssets();
    const popup = () =>
      window.Calendly?.initPopupWidget({
        url,
        prefill: { customAnswers: { a1: reason } },
      });
    if (window.Calendly) {
      popup();
      return;
    }
    // Widget script not ready yet (fast click on a slow network): poll briefly
    // until Calendly is available, then open — so the button never dead-ends.
    let tries = 0;
    const id = window.setInterval(() => {
      if (window.Calendly) {
        window.clearInterval(id);
        popup();
      } else if (++tries > 40) {
        window.clearInterval(id); // ~4s timeout — give up silently
      }
    }, 100);
  };

  return (
    <button type="button" onClick={open} className={className}>
      {label}
      {withArrow ? ' →' : ''}
    </button>
  );
}
