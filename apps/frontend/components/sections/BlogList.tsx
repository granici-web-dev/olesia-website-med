'use client';

import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';

/* ──────────────────────────────────────────────────────────────────────────
   Blog listing — category filter (= SEO clusters) + responsive post grid, with
   a built-in empty state for launch. Posts are passed in already localized; the
   whole card links to the article. Covers fall back to a typographic block when
   a post has no image, so the grid never shows empty gray boxes.
   ────────────────────────────────────────────────────────────────────────── */

export interface BlogPostItem {
  slug: string;
  categoryKey: string;
  categoryLabel: string;
  title: string;
  excerpt: string;
  /** "12 mai 2026 · 6 min de citit" */
  meta: string;
  coverUrl: string | null;
  href: string;
}

export interface BlogCategory {
  key: string;
  label: string;
}

export interface BlogListLabels {
  all: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  emptyCtaHref: string;
}

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" aria-hidden="true">
      <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PostCard({ p }: { p: BlogPostItem }) {
  return (
    <article>
      <a href={p.href} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage">
        <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-cream-2 text-sage">
          {p.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.coverUrl}
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="transition-transform duration-500 group-hover:scale-110">
              <PenIcon />
            </span>
          )}
          <span className="mono absolute left-4 top-4 rounded-full border border-[var(--rule)] bg-paper/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-sage-text">
            {p.categoryLabel}
          </span>
        </div>

        <p className="mono mt-4 text-[11px] uppercase tracking-[0.08em] text-ink-soft">{p.meta}</p>
        <h3 className="serif mt-2 text-[1.5rem] leading-snug tracking-[-0.01em] text-ink text-pretty transition-colors group-hover:text-[var(--walnut)]">
          {p.title}
        </h3>
        {p.excerpt ? (
          <p className="mt-2 max-w-[46ch] text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
            {p.excerpt}
          </p>
        ) : null}
      </a>
    </article>
  );
}

export function BlogList({
  posts,
  categories,
  labels,
}: {
  posts: BlogPostItem[];
  categories: BlogCategory[];
  labels: BlogListLabels;
}) {
  const [active, setActive] = useState('all');

  if (posts.length === 0) {
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

  const chips: BlogCategory[] = [{ key: 'all', label: labels.all }, ...categories];
  const filtered = active === 'all' ? posts : posts.filter((p) => p.categoryKey === active);

  return (
    <div>
      {categories.length > 1 && (
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

      <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 70}>
            <PostCard p={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
