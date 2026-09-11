'use client';

import { Link } from '@/i18n/navigation';
import { track } from '@/lib/analytics';

/**
 * "Comandă" for a group-C product: a link to its checkout.
 *
 * It used to open the lead-form modal, which wrote an order the doctor saw and
 * worked on before anybody had paid for it. There is a checkout now, and the
 * order is written on the way to the bank instead.
 *
 * A client component only because of the analytics event — the navigation
 * itself is an ordinary `<Link>`, so it works with JavaScript off, opens in a
 * new tab on a middle click, and is a real URL somebody can be sent.
 */
export function OrderDeliverableButton({
  code,
  label,
  className,
}: {
  code: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={`/checkout/deliverable/${code}`}
      className={className}
      onClick={() => track('checkout_open', { service: code })}
    >
      {label}
    </Link>
  );
}
