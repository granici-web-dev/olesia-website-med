import { getLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { JsonLd } from '@/components/ui/JsonLd';
import { breadcrumbJsonLd } from '@/lib/structured-data';

export interface Crumb {
  label: string;
  /** Internal href (locale-prefixed by next-intl). Omit for the current page. */
  href?: string;
}

/**
 * Breadcrumb trail for second-level pages (e.g. Servicii / Consultație
 * pediatrică, Articole / <post>). The page passes already-localized labels.
 * The last crumb is the current page (no link, aria-current). The caller owns
 * layout via `className` — pass `shell pt-…` for a full-bleed strip above a
 * hero, or a plain margin when nested inside a narrower content column.
 *
 * The `BreadcrumbList` block belongs here rather than in the ten pages that
 * render a trail (audit A7, F14): the labels and the hrefs a crawler needs are
 * exactly the ones already passed in, and a copy per page is a copy that goes
 * out of step with the visible trail.
 */
export async function Breadcrumbs({
  items,
  className = '',
}: {
  items: Crumb[];
  className?: string;
}) {
  const locale = await getLocale();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, items)} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="mono flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-x-2.5">
                {c.href && !last ? (
                  <Link
                    href={c.href}
                    className="transition-colors hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span
                    className={last ? 'text-ink' : undefined}
                    aria-current={last ? 'page' : undefined}
                  >
                    {c.label}
                  </span>
                )}
                {!last && (
                  <span aria-hidden="true" className="text-ink-soft/40">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
