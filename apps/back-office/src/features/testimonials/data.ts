/** Public data module for testimonials — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/testimonials/mock';
import * as remote from '@/features/testimonials/api';

export const fetchTestimonials = USE_MOCKS
  ? mock.fetchTestimonials
  : remote.fetchTestimonials;
export const createTestimonial = USE_MOCKS
  ? mock.createTestimonial
  : remote.createTestimonial;
export const updateTestimonial = USE_MOCKS
  ? mock.updateTestimonial
  : remote.updateTestimonial;
export const deleteTestimonial = USE_MOCKS
  ? mock.deleteTestimonial
  : remote.deleteTestimonial;
