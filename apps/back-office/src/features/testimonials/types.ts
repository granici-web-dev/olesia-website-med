/**
 * Parent reviews shown on the homepage. Mirrors `TestimonialDto` in
 * `packages/shared`.
 *
 * `author` is nullable on purpose: an unsigned review is a normal case, and the
 * site answers it with a localized neutral label rather than a name nobody gave.
 */

export interface Testimonial {
  id: string;
  quoteRo: string;
  quoteEn: string;
  quoteRu: string | null;
  author: string | null;
  roleRo: string | null;
  roleEn: string | null;
  roleRu: string | null;
  /** Platform the review came from, e.g. "DoctorChat". */
  source: string | null;
  sortOrder: number;
  active: boolean;
}

export type TestimonialInput = Omit<Testimonial, 'id' | 'sortOrder'>;
