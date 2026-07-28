import type { TestimonialDto } from '@olesia/shared';
import type { Testimonial } from '../../generated/prisma/client';

export function toTestimonialDto(t: Testimonial): TestimonialDto {
  return {
    id: t.id,
    quoteRo: t.quoteRo,
    quoteEn: t.quoteEn,
    quoteRu: t.quoteRu,
    author: t.author,
    roleRo: t.roleRo,
    roleEn: t.roleEn,
    roleRu: t.roleRu,
    source: t.source,
    sortOrder: t.sortOrder,
    active: t.active,
  };
}
