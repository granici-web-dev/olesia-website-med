/**
 * Single source of truth for call-to-action class strings.
 *
 * These exact strings were previously copy-pasted, verbatim, into ~16 page files
 * and several section components — so the same button drifted between pages.
 * Import the token you need from here instead of re-declaring it locally.
 *
 * Booking components (CalendlyButton / BookGroupBButton / OrderDeliverableButton)
 * receive one of these via their `className` prop; arrows are NOT part of these
 * tokens — action buttons render without a trailing "→" (an arrow is only for
 * navigational "Vezi …" links, added explicitly there).
 */

/** Solid dark box — primary action on light (cream) backgrounds. */
export const btnDark =
  'inline-flex cursor-pointer items-center bg-ink px-[22px] py-[14px] text-[13px] font-medium uppercase tracking-[0.04em] text-cream transition-colors hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';

/** Cream rounded pill — primary action on dark (sage) backgrounds. */
export const creamPill =
  'inline-flex cursor-pointer items-center rounded-full bg-cream px-6 py-3 text-sm font-semibold text-sage-deep transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage-soft)]';

/** Underlined text link — secondary action on light backgrounds. */
export const underlineLg =
  'inline-block cursor-pointer border-b border-ink pb-1 text-sm text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';

/** Smaller underlined text link (13px) — dense secondary action on light backgrounds. */
export const underline =
  'inline-block cursor-pointer border-b border-ink pb-[3px] text-[13px] text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';

/** Underlined text link — secondary action on dark (sage) backgrounds. */
export const creamUnderline =
  'inline-block cursor-pointer border-b border-[var(--sage-soft)] pb-0.5 text-sm text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage-soft)]';

/** Uppercase card action (Vezi / Comandă / Descarcă) — used inside library/catalog cards. */
export const cardCta =
  'inline-flex cursor-pointer items-center gap-2 border-b border-ink pb-1 text-[13px] font-medium uppercase tracking-[0.04em] text-ink transition-colors hover:border-sage hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage';
