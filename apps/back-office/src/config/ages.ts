/**
 * Child-age taxonomy (brief §8) — one list for every surface that tags content
 * by age: the digital library and, since the blog got its own `ageKeys`, the
 * articles too. It lives here rather than inside a feature because two features
 * now depend on it and a second copy is how the two filters drift apart.
 *
 * Keys are stable and mirror `AGE_GROUPS` in `apps/frontend/lib/age-taxonomy.ts`
 * (which owns the trilingual public labels). Romanian labels are in
 * `ro.ages` — the back office is Romanian-only.
 */
export const AGE_KEYS = [
  '0-6m',
  '6-12m',
  '1-3y',
  '3-6y',
  '6-12y',
  'adolescent',
] as const;

export type AgeKey = (typeof AGE_KEYS)[number];
