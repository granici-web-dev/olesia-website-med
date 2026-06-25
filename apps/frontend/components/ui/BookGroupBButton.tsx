'use client';

import { useState } from 'react';

import { LeadFormModal } from './LeadFormModal';
import type { LeadService } from '@/lib/leads';
import { track } from '@/lib/analytics';

/**
 * "Rezervă" trigger for group-B services (Monitorizare / Întrebare EXPRESS):
 * opens the lead-form modal instead of navigating. Styled by the caller via
 * `className` so it matches the surrounding link/button.
 */
export function BookGroupBButton({
  service,
  label,
  className,
}: {
  service: LeadService;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          track('lead_open', { service });
          setOpen(true);
        }}
      >
        {label}
      </button>
      <LeadFormModal
        service={service}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
