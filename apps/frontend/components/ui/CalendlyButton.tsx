'use client';

import { useEffect } from 'react';

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
  withArrow = true,
}: {
  /** Public Calendly scheduling URL (Service.calendlySchedulingUrl). */
  url: string;
  /** Visit reason prefilled into the `a1` custom question. */
  reason: string;
  label: string;
  className?: string;
  /** Append a trailing " →" to the label (default true). */
  withArrow?: boolean;
}) {
  useEffect(() => {
    ensureWidgetAssets();
  }, []);

  const open = () => {
    ensureWidgetAssets();
    window.Calendly?.initPopupWidget({
      url,
      prefill: { customAnswers: { a1: reason } },
    });
  };

  return (
    <button type="button" onClick={open} className={className}>
      {label}
      {withArrow ? ' →' : ''}
    </button>
  );
}
