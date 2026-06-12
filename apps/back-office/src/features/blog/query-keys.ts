/** Shared TanStack Query keys for the blog feature. */
export const postsQueryKey = ['blog', 'posts'] as const;
export const categoriesQueryKey = ['blog', 'categories'] as const;
export const postQueryKey = (id: string) => ['blog', 'post', id] as const;
