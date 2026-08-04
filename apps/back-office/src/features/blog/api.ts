import type { Paginated, PostDto, CategoryDto } from '@olesia/shared';

import { http } from '@/api/http';
import type {
  Post,
  PostInput,
  Category,
  CategoryInput,
} from '@/features/blog/types';

/** Real `blog` endpoints (module_calendly.md §7). Public GET is published-only. */

/** Upload a cover image to the storage module; returns its public URL (WebP). */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { url } = await http.post<{ url: string }>('/storage/upload', form);
  return url;
}

function postToView(d: PostDto): Post {
  return {
    id: d.id,
    slug: d.slug,
    titleRo: d.titleRo,
    titleEn: d.titleEn,
    titleRu: d.titleRu ?? '',
    excerptRo: d.excerptRo ?? '',
    excerptEn: d.excerptEn ?? '',
    excerptRu: d.excerptRu ?? '',
    contentRo: d.contentRo,
    contentEn: d.contentEn,
    contentRu: d.contentRu ?? '',
    coverImageUrl: d.coverImageUrl,
    ageKeys: d.ageKeys,
    status: d.status as Post['status'],
    publishedAt: d.publishedAt,
    categoryIds: d.categories.map((c) => c.id),
    // authorName isn't carried by the DTO (only authorId); not shown in the UI.
    authorName: '',
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

function categoryToView(d: CategoryDto): Category {
  return {
    id: d.id,
    slug: d.slug,
    nameRo: d.nameRo,
    nameEn: d.nameEn,
    nameRu: d.nameRu,
  };
}

function asList<T>(r: T[] | Paginated<T>): T[] {
  return Array.isArray(r) ? r : r.items;
}

/* ------------------------------- posts ------------------------------- */

export async function fetchPosts(): Promise<Post[]> {
  const r = await http.get<PostDto[] | Paginated<PostDto>>(
    '/blog/posts?pageSize=200',
  );
  return asList(r)
    .map(postToView)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function fetchPost(id: string): Promise<Post> {
  return postToView(await http.get<PostDto>(`/blog/posts/${id}`));
}

export async function createPost(input: PostInput): Promise<Post> {
  return postToView(await http.post<PostDto>('/blog/posts', input));
}

export async function updatePost(id: string, input: PostInput): Promise<Post> {
  return postToView(await http.patch<PostDto>(`/blog/posts/${id}`, input));
}

export async function deletePost(id: string): Promise<void> {
  await http.del<void>(`/blog/posts/${id}`);
}

/* ----------------------------- categories ---------------------------- */

export async function fetchCategories(): Promise<Category[]> {
  const list = await http.get<CategoryDto[]>('/blog/categories');
  return list.map(categoryToView).sort((a, b) => a.nameRo.localeCompare(b.nameRo));
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  return categoryToView(
    await http.post<CategoryDto>('/blog/categories', input),
  );
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<Category> {
  return categoryToView(
    await http.patch<CategoryDto>(`/blog/categories/${id}`, input),
  );
}

export async function deleteCategory(id: string): Promise<void> {
  await http.del<void>(`/blog/categories/${id}`);
}
