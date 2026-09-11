import type * as React from 'react';

/**
 * The two pieces every detail sheet is built from: a small uppercase heading,
 * and a label/value row in a definition list.
 *
 * Seven sheets declared `SectionTitle` identically and three declared `Field`
 * with label columns of 7, 8 and 8.5rem — a difference nobody chose and nobody
 * could see (audit A10, simplify 2 and 11). One width, here.
 */

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
      {children}
    </p>
  );
}

export function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium break-words">{children}</dd>
    </div>
  );
}
