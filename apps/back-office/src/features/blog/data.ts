/** Public data module for blog — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/blog/mock';
import * as remote from '@/features/blog/api';

export { formatDate } from '@/lib/format';

export const uploadImage = USE_MOCKS ? mock.uploadImage : remote.uploadImage;

export const fetchPosts = USE_MOCKS ? mock.fetchPosts : remote.fetchPosts;
export const fetchPost = USE_MOCKS ? mock.fetchPost : remote.fetchPost;
export const createPost = USE_MOCKS ? mock.createPost : remote.createPost;
export const updatePost = USE_MOCKS ? mock.updatePost : remote.updatePost;
export const deletePost = USE_MOCKS ? mock.deletePost : remote.deletePost;

export const fetchCategories = USE_MOCKS
  ? mock.fetchCategories
  : remote.fetchCategories;
export const createCategory = USE_MOCKS
  ? mock.createCategory
  : remote.createCategory;
export const updateCategory = USE_MOCKS
  ? mock.updateCategory
  : remote.updateCategory;
export const deleteCategory = USE_MOCKS
  ? mock.deleteCategory
  : remote.deleteCategory;
