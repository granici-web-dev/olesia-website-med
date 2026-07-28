import type { TestimonialDto } from '@olesia/shared';

import { http } from '@/api/http';
import type {
  Testimonial,
  TestimonialInput,
} from '@/features/testimonials/types';

/**
 * Real `testimonials` endpoints. The back office reads `/testimonials/all`:
 * the public `/testimonials` hides what is deactivated, which is precisely what
 * still has to be visible and editable here.
 */

function toView(d: TestimonialDto): Testimonial {
  return {
    id: d.id,
    quoteRo: d.quoteRo,
    quoteEn: d.quoteEn,
    quoteRu: d.quoteRu,
    author: d.author,
    roleRo: d.roleRo,
    roleEn: d.roleEn,
    roleRu: d.roleRu,
    source: d.source,
    sortOrder: d.sortOrder,
    active: d.active,
  };
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const list = await http.get<TestimonialDto[]>('/testimonials/all');
  return list.map(toView).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createTestimonial(
  input: TestimonialInput,
): Promise<Testimonial> {
  return toView(await http.post<TestimonialDto>('/testimonials', input));
}

export async function updateTestimonial(
  id: string,
  input: Partial<TestimonialInput> & { sortOrder?: number },
): Promise<Testimonial> {
  return toView(await http.patch<TestimonialDto>(`/testimonials/${id}`, input));
}

export async function deleteTestimonial(id: string): Promise<void> {
  await http.del<void>(`/testimonials/${id}`);
}
