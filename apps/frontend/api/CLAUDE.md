# API Layer — Frontend

This directory contains the frontend data layer: TanStack Query hooks, service functions, and query key factories for fetching data from Sanity CMS and Cal.com.

> **Backend / DTOs:** Not yet implemented. When the backend (NestJS) is added, DTOs will live in `libs/shared-types/` and be imported here via `@olesia/shared-types`. Until then, types are defined locally in `types/`.

## Skills

When working in this directory, the rules from root `AGENTS.md` apply. In particular: **R5** (TypeScript strict), **R6** (rule of three before abstraction).

## Structure

```
api/
  keys/              Query key factories — one file per domain
  services/          Pure fetch functions — no React, no hooks
  hooks/             TanStack Query hooks — consume services
```

## Rules

1. **One file per domain** in `keys/`, `services/`, `hooks/` (e.g. `articles`, `services`, `booking`)
2. **Services are pure** — no React, no hooks. Only `fetch` or Sanity client calls
3. **Hooks consume services** — never call `fetch` directly inside a hook
4. **Types** come from `@/types/` until backend DTOs are available
5. **Never import server-only modules** (`next/headers`, `server-only`) in this directory — this is client-side code
6. **Keep a barrel `index.ts`** in `keys/`, `services/`, `hooks/` as the directory grows

## Stack

- `@tanstack/react-query@5` — async server state
- Sanity client from `@/lib/sanity/` — content queries
- Cal.com embed from `@/lib/cal/` — booking integration
- Native `fetch` for any REST calls

## Adding a New Domain

```
1. Add query keys  → api/keys/<domain>.keys.ts
2. Add service     → api/services/<domain>.service.ts
3. Add hooks       → api/hooks/use-<domain>.ts
4. Export from barrel index.ts in each folder
```

## Example

```ts
// keys/articles.keys.ts
export const articleKeys = {
  all: ['articles'] as const,
  list: () => [...articleKeys.all, 'list'] as const,
  detail: (slug: string) => [...articleKeys.all, 'detail', slug] as const,
};

// services/articles.service.ts
import { sanityClient } from '@/lib/sanity/client';
import { ARTICLES_QUERY } from '@/lib/sanity/articles.query';
import type { Article } from '@/types/article';

export async function fetchArticles(): Promise<Article[]> {
  return sanityClient.fetch(ARTICLES_QUERY);
}

// hooks/use-articles.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { articleKeys } from '@/api/keys/articles.keys';
import { fetchArticles } from '@/api/services/articles.service';

export function useArticles() {
  return useQuery({
    queryKey: articleKeys.list(),
    queryFn: fetchArticles,
  });
}
```