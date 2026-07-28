import type { SiteMediaDto } from '@olesia/shared';

import { http } from '@/api/http';
import type {
  SiteMediaOverride,
  SiteMediaSet,
  UploadedMedia,
} from '@/features/site-media/types';

/** Real `site-media` endpoints. The GET is public — nothing secret in a poster. */

function toView(d: SiteMediaDto): SiteMediaOverride {
  return {
    key: d.key,
    url: d.url,
    width: d.width,
    height: d.height,
    fileName: d.fileName,
    updatedAt: d.updatedAt,
  };
}

export async function fetchSiteMedia(): Promise<SiteMediaOverride[]> {
  const list = await http.get<SiteMediaDto[]>('/site-media');
  return list.map(toView);
}

export async function setSiteMedia(
  key: string,
  input: SiteMediaSet,
): Promise<SiteMediaOverride> {
  return toView(await http.put<SiteMediaDto>(`/site-media/${key}`, input));
}

/** Drop the override — the slot goes back to the file shipped with the site. */
export async function resetSiteMedia(key: string): Promise<void> {
  await http.del<void>(`/site-media/${key}`);
}

/** Photos go through the image pipeline, which also reports the stored size. */
export async function uploadSiteImage(file: File): Promise<UploadedMedia> {
  const form = new FormData();
  form.append('file', file);
  const stored = await http.post<{
    url: string;
    width: number;
    height: number;
  }>('/storage/upload', form);
  return { ...stored, name: file.name };
}

/** Videos are stored untouched — no re-encode over the burned-in subtitles. */
export async function uploadSiteVideo(file: File): Promise<UploadedMedia> {
  const form = new FormData();
  form.append('file', file);
  const stored = await http.post<{ url: string; name: string }>(
    '/site-media/video',
    form,
  );
  return { url: stored.url, name: stored.name };
}
