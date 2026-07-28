import type { AboutPageDto } from '@olesia/shared';

import { http } from '@/api/http';
import type { AboutPage, AboutInput } from '@/features/about/types';

/** Real `about` endpoints (module_calendly.md §10). Singleton document. */

function toView(d: AboutPageDto): AboutPage {
  return {
    id: d.id,
    titleRo: d.titleRo,
    titleEn: d.titleEn,
    titleRu: d.titleRu ?? '',
    contentRo: d.contentRo,
    contentEn: d.contentEn,
    contentRu: d.contentRu ?? '',
    images: d.images ?? [],
    stats: d.stats ?? [],
    credentials: d.credentials ?? [],
    updatedAt: d.updatedAt,
  };
}

export async function fetchAbout(): Promise<AboutPage> {
  return toView(await http.get<AboutPageDto>('/about'));
}

export async function updateAbout(input: AboutInput): Promise<AboutPage> {
  return toView(await http.patch<AboutPageDto>('/about', input));
}

/** Upload an image to the storage module; returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { url } = await http.post<{ url: string }>('/storage/upload', form);
  return url;
}
