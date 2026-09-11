'use client';

import { useState } from 'react';

import { Link } from '@/i18n/navigation';
import { LeadFormModal } from './LeadFormModal';
import type { LeadService } from '@/lib/leads';
import { track } from '@/lib/analytics';

/**
 * "Rezervă" trigger for group-B services. Styled by the caller via `className`
 * so it matches the surrounding link or button.
 *
 * The two services behind it now go different ways. **Monitorizare** is on
 * request — no price, no checkout — so it still opens the lead-form modal.
 * **Întrebare EXPRESS** is bought: it navigates to `/quick-question/checkout`,
 * where the question and the payment are collected together. Sending it to the
 * modal instead would take a medical question and promise an answer nobody had
 * paid for.
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

  if (service === 'quick_question') {
    return (
      <Link
        href="/quick-question/checkout"
        className={className}
        onClick={() => track('checkout_open', { service })}
      >
        {label}
      </Link>
    );
  }

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
