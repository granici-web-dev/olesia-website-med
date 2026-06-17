'use client';

import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';

/* ──────────────────────────────────────────────────────────────────────────
   Weekly-menu library — age-segment filter + responsive card grid, with a
   built-in empty state for launch. Age segmentation is the core IA: a menu
   without an age is meaningless. Menus are inspiration (meal ideas, no grams or
   calories), not a personalized plan — that boundary lives in the page copy.
   Content is passed in already localized; this owns the filter + card render.
   ────────────────────────────────────────────────────────────────────────── */

export interface MenuItem {
  slug: string;
  ageKey: string;
  ageLabel: string;
  title: string;
  description: string;
  /** Card meta line, e.g. "7 zile · Vezi pe pagină · RO". */
  meta: string;
  href: string;
}

export interface MenuSegment {
  key: string;
  label: string;
}

export interface MenuLibraryLabels {
  all: string;
  view: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  emptyCtaHref: string;
}

function WeekIcon() {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 9.5h17M8 3.5V6m8-2.5V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M7 13h2m3 0h2m3 0h0M7 16.5h2m3 0h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MenuCard({ m, labels }: { m: MenuItem; labels: MenuLibraryLabels }) {
  return (
    <article className="group flex flex-col border border-[var(--rule)] bg-paper transition-colors hover:border-sage">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-cream-2 text-sage">
        <span className="mono absolute left-4 top-4 rounded-full border border-[var(--rule)] bg-paper/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-sage-text">
          {m.ageLabel}
        </span>
        <span className="transition-transform duration-500 group-hover:scale-110">
          <WeekIcon />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="serif text-[1.35rem] leading-snug tracking-[-0.01em] text-ink text-pretty">
          {m.title}
        </h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
          {m.description}
        </p>
        <p className="mono mt-4 text-[11px] uppercase tracking-[0.08em] text-ink-soft">{m.meta}</p>

        <div className="mt-6 pt-1">
          <a
            href={m.href}
            className="inline-flex cursor-pointer items-center gap-2 border-b border-ink pb-1 text-[13px] font-medium uppercase tracking-[0.04em] text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
          >
            {labels.view}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function MenuLibrary({
  menus,
  segments,
  labels,
}: {
  menus: MenuItem[];
  segments: MenuSegment[];
  labels: MenuLibraryLabels;
}) {
  const [active, setActive] = useState('all');

  if (menus.length === 0) {
    return (
      <div className="border-t border-[var(--rule)] py-20 text-center md:py-28">
        <h3 className="serif text-[clamp(1.8rem,3.2vw,2.6rem)] leading-tight tracking-[-0.02em] text-balance">
          {labels.emptyTitle}
        </h3>
        <p className="mx-auto mt-4 max-w-[48ch] leading-relaxed text-ink-soft text-pretty">
          {labels.emptyBody}
        </p>
        <a
          href={labels.emptyCtaHref}
          className="mt-8 inline-flex cursor-pointer items-center bg-ink px-[22px] py-[14px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
        >
          {labels.emptyCta}
        </a>
      </div>
    );
  }

  const chips: MenuSegment[] = [{ key: 'all', label: labels.all }, ...segments];
  const filtered = active === 'all' ? menus : menus.filter((m) => m.ageKey === active);

  return (
    <div>
      {segments.length > 1 && (
        <div role="tablist" aria-label={labels.all} className="flex flex-wrap gap-2.5">
          {chips.map((c) => {
            const on = active === c.key;
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(c.key)}
                className={`cursor-pointer rounded-full border px-4 py-2 text-[12px] font-medium uppercase tracking-[0.08em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage ${
                  on
                    ? 'border-ink bg-ink text-cream'
                    : 'border-[var(--rule)] text-ink-soft hover:border-sage hover:text-sage'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m, i) => (
          <Reveal key={m.slug} delay={(i % 3) * 70}>
            <MenuCard m={m} labels={labels} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
