/**
 * Client-side field checks shared by the four public forms.
 *
 * There were four email regexes before (audit A6, F10): two anchored, two not.
 * The unanchored pair accepted `"nonsense a@b.c nonsense"`, so a submission the
 * form called valid came back 400 from the API's `@IsEmail()` and the visitor
 * read "something went wrong". One regex, anchored, agreeing with the server.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A cheap "looks like an address" check, not a validator. The address is only
 * ever confirmed by an email actually arriving; the point here is to catch the
 * typo before the round trip, never to reject an unusual but real address.
 */
export function isEmailLike(value: string): boolean {
  return EMAIL.test(value.trim());
}

/**
 * What the API accepts, so an input cannot collect text the server will refuse.
 * Mirrors the `@MaxLength` on `apps/api/src/app/leads/dto/create-lead.dto.ts`
 * and on the newsletter DTO; keep the two in step.
 */
export const FIELD_LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  message: 2000,
  question: 4000,
} as const;
