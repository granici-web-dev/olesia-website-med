'use client';

import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';

/* ──────────────────────────────────────────────────────────────────────────
   Guide library — topic filter + responsive card grid, with a built-in empty
   state for launch (guides may not exist yet). Content is passed in already
   localized by the server page; this component only owns the filter interaction
   and the card rendering. Free model: each card downloads a PDF directly (no
   account, no email gate). `fileHref` may be empty until the real file exists.
   ────────────────────────────────────────────────────────────────────────── */

export interface GuideItem {
  slug: string;
  topicKey: string;
  topicLabel: string;
  title: string;
  description: string;
  /** Card meta line, e.g. "PDF · 16 pagini · RO". */
  meta: string;
  fileHref: string;
}

export interface GuideTopic {
  key: string;
  label: string;
}

export interface GuideLibraryLabels {
  all: string;
  download: string;
  soon: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  emptyCtaHref: string;
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" aria-hidden="true">
      <path
        d="M6 3.5h7L18 8v12.5H6V3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M13 3.5V8h5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path
        d="M12 11v5m0 0 2-2m-2 2-2-2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GuideCard({ g, labels }: { g: GuideItem; labels: GuideLibraryLabels }) {
  const ready = g.fileHref.length > 0;
  return (
    <article className="group flex flex-col border border-[var(--rule)] bg-paper transition-colors hover:border-sage">
      {/* Typographic cover — no stock imagery; the topic + document motif. */}
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-cream-2 text-sage">
        <span className="mono absolute left-4 top-4 rounded-full border border-[var(--rule)] bg-paper/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-sage-text">
          {g.topicLabel}
        </span>
        <span className="transition-transform duration-500 group-hover:scale-110">
          <DocIcon />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="serif text-[1.35rem] leading-snug tracking-[-0.01em] text-ink text-pretty">
          {g.title}
        </h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
          {g.description}
        </p>
        <p className="mono mt-4 text-[11px] uppercase tracking-[0.08em] text-ink-soft">
          {g.meta}
        </p>

        <div className="mt-6 pt-1">
          {ready ? (
            <a
              href={g.fileHref}
              download
              className="inline-flex cursor-pointer items-center gap-2 border-b border-ink pb-1 text-[13px] font-medium uppercase tracking-[0.04em] text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
            >
              {labels.download}
              <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
          ) : (
            <span className="mono inline-flex items-center rounded-full border border-[var(--rule)] px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
              {labels.soon}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function GuideLibrary({
  guides,
  topics,
  labels,
}: {
  guides: GuideItem[];
  topics: GuideTopic[];
  labels: GuideLibraryLabels;
}) {
  const [active, setActive] = useState('all');

  if (guides.length === 0) {
    return (
      <div className="border-t border-[var(--rule)] py-20 text-center md:py-28">
        <h3 className="serif text-[clamp(1.8rem,3.2vw,2.6rem)] leading-tight tracking-[-0.02em] text-balance">
          {labels.emptyTitle}
        </h3>
        <p className="mx-auto mt-4 max-w-[46ch] leading-relaxed text-ink-soft text-pretty">
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

  const chips: GuideTopic[] = [{ key: 'all', label: labels.all }, ...topics];
  const filtered = active === 'all' ? guides : guides.filter((g) => g.topicKey === active);

  return (
    <div>
      {/* Topic filter — show only when there's more than one topic. */}
      {topics.length > 1 && (
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
        {filtered.map((g, i) => (
          <Reveal key={g.slug} delay={(i % 3) * 70}>
            <GuideCard g={g} labels={labels} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
