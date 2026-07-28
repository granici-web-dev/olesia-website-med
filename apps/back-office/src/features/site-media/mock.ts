import type {
  SiteMediaOverride,
  SiteMediaSet,
  UploadedMedia,
} from '@/features/site-media/types';

/* ------------------------------------------------------------------ *
 * Mock data layer. Starts empty on purpose: nothing has been replaced
 * yet, which is exactly the state the real back office is in.
 * ------------------------------------------------------------------ */

let store: SiteMediaOverride[] = [];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
/** The mock has no clock of its own; a fixed stamp keeps renders stable. */
const STAMP = '2026-07-28T12:00:00.000Z';

export async function fetchSiteMedia(): Promise<SiteMediaOverride[]> {
  await delay(300);
  return store.slice();
}

export async function setSiteMedia(
  key: string,
  input: SiteMediaSet,
): Promise<SiteMediaOverride> {
  await delay(350);
  const saved: SiteMediaOverride = {
    key,
    url: input.url,
    width: input.width ?? null,
    height: input.height ?? null,
    fileName: input.fileName ?? null,
    updatedAt: STAMP,
  };
  store = [...store.filter((m) => m.key !== key), saved];
  return saved;
}

export async function resetSiteMedia(key: string): Promise<void> {
  await delay(300);
  store = store.filter((m) => m.key !== key);
}

export async function uploadSiteImage(file: File): Promise<UploadedMedia> {
  await delay(600);
  return { url: URL.createObjectURL(file), name: file.name, width: 1000, height: 1250 };
}

export async function uploadSiteVideo(file: File): Promise<UploadedMedia> {
  await delay(900);
  return { url: URL.createObjectURL(file), name: file.name };
}
