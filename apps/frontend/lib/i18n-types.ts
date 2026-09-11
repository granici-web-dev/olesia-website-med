/**
 * The shape page copy is authored in, and the one-line reader for it
 * (`AGENTS.md` R3).
 *
 * `type Bi` was declared identically in eighteen files and the reader closure
 * written out in fifteen of them (audit A7). Neither was a design decision
 * repeated on purpose — it is the same three-branch ternary every page needs,
 * and a page that spells `ru ? b.ru : en ? b.en : b.ro` slightly differently
 * from its neighbour is a page whose Russian branch nobody checked.
 *
 * This does **not** move copy out of the pages. The strings stay inline, all
 * three branches mandatory, exactly as R3 requires; only the type and the
 * picker are shared.
 */

export type Bi = { ro: string; en: string; ru: string };

/**
 * The reader for one locale: `const lc = biFor(locale)`, then `lc(SOME_BLOCK)`.
 *
 * Romanian is the fallback for anything that is not one of the three, which is
 * the site's default locale and what `loc()` does with API content.
 */
export function biFor(locale: string): (b: Bi) => string {
  if (locale === 'ru') return (b) => b.ru;
  if (locale === 'en') return (b) => b.en;
  return (b) => b.ro;
}
