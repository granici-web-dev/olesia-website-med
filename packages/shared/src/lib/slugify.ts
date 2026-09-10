/**
 * One slug rule for the whole tree.
 *
 * There were three of these until 2026-09-10 (audit A4, F12): the API's
 * materials and FAQ services each carried their own diacritics table, and the
 * back office a third that folded `â` but not `ş`. They agreed on the Romanian
 * letters and disagreed everywhere else, which is how the panel could preview
 * one slug and the server store another.
 */

/** Romanian diacritics → ASCII, both the comma-below and cedilla code points. */
const DIACRITICS: Record<string, string> = {
  ă: 'a',
  â: 'a',
  î: 'i',
  ș: 's',
  ş: 's',
  ț: 't',
  ţ: 't',
};

/** What a stored slug has to look like: lowercase words joined by hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Fold a title into a URL slug. Returns `fallback` when nothing survives the
 * fold, which is what a title written entirely in Cyrillic does — the caller
 * decides whether that is a usable default or a reason to ask the editor.
 */
export function slugify(value: string, fallback = ''): string {
  const slug = value
    .toLowerCase()
    .replace(/[ăâîșşțţ]/g, (c) => DIACRITICS[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}
