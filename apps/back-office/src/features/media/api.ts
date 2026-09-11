import type { MediaAppearanceDto } from '@olesia/shared';

import { http } from '@/api/http';
import type {
  MediaAppearance,
  MediaAppearanceInput,
  StoredImage,
} from '@/features/media/types';

/** Real `media-appearances` endpoints; the back office reads the `/all` list. */

function toView(d: MediaAppearanceDto): MediaAppearance {
  return {
    id: d.id,
    kind: d.kind as MediaAppearance['kind'],
    outlet: d.outlet,
    show: d.show,
    date: d.date,
    duration: d.duration,
    titleRo: d.titleRo,
    titleEn: d.titleEn,
    titleRu: d.titleRu,
    summaryRo: d.summaryRo,
    summaryEn: d.summaryEn,
    summaryRu: d.summaryRu,
    url: d.url,
    embedProvider: d.embedProvider as MediaAppearance['embedProvider'],
    embedRef: d.embedRef,
    thumbUrl: d.thumbUrl,
    thumbWidth: d.thumbWidth,
    thumbHeight: d.thumbHeight,
    sortOrder: d.sortOrder,
    active: d.active,
  };
}

export async function fetchMedia(): Promise<MediaAppearance[]> {
  const list = await http.get<MediaAppearanceDto[]>('/media-appearances/all');
  return list.map(toView).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createMedia(
  input: MediaAppearanceInput,
): Promise<MediaAppearance> {
  return toView(
    await http.post<MediaAppearanceDto>('/media-appearances', input),
  );
}

export async function updateMedia(
  id: string,
  input: Partial<MediaAppearanceInput> & { sortOrder?: number },
): Promise<MediaAppearance> {
  return toView(
    await http.patch<MediaAppearanceDto>(`/media-appearances/${id}`, input),
  );
}

export async function deleteMedia(id: string): Promise<void> {
  await http.del<void>(`/media-appearances/${id}`);
}

/**
 * Ask the API to copy a YouTube thumbnail into our own storage. Facebook is
 * rejected server-side (its image URLs expire) — the form falls back to upload.
 */
export async function fetchThumbnail(url: string): Promise<StoredImage> {
  return http.post<StoredImage>('/media-appearances/thumbnail', { url });
}

export async function uploadThumbnail(file: File): Promise<StoredImage> {
  const form = new FormData();
  form.append('file', file);
  return http.post<StoredImage>('/storage/upload', form);
}
