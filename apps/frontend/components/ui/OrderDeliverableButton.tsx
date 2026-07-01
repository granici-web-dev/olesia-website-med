'use client';

import { useState } from 'react';

import { LeadFormModal } from './LeadFormModal';
import type { DeliverableProduct } from '@/lib/leads';
import { track } from '@/lib/analytics';

/**
 * "Comandă" trigger for group-C deliverable products (menus + protocols):
 * opens the lead-form modal in order mode, carrying the specific product so the
 * back-office lead shows exactly which service was chosen. Styled by the caller
 * via `className`.
 */
export function OrderDeliverableButton({
  code,
  title,
  label,
  className,
}: {
  code: DeliverableProduct;
  title: string;
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
          track('lead_open', { service: code });
          setOpen(true);
        }}
      >
        {label}
      </button>
      <LeadFormModal
        deliverable={{ code, title }}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
